from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import Stock_price_table, User, Portfolio, Vote, Notification
from ..serializers import User_serializer, Portfolio_serializer
from django.db.models import Sum, Case, When, IntegerField

import datetime
from collections import OrderedDict

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_public_portfolios(request):
    portfolio_list = Portfolio.objects.filter(is_public=True)
    serzializer = Portfolio_serializer(portfolio_list, many=True)
    
    #append usernames to each portfolio and votes
    for portfolio in serzializer.data:
        portfolio_request = Portfolio.objects.get(id=portfolio["id"])
        portfolio["upvotes"] = portfolio_request.upvotes()
        portfolio["downvotes"] = portfolio_request.downvotes()
        portfolio["username"] = User.objects.get(id=portfolio["user"]).username
        # if user already voted for it, add that information, votestatus 0 -> not voted, 1 downvoted, 2 upvoted
        portfolio["vote_status"] = 0
        vote = Vote.objects.filter(user=User.objects.get(id=request.user.id), portfolio=portfolio_request)
        if(vote):
            portfolio["vote_status"] += (int(vote[0].upvote==True) + 1) 

    return Response(serzializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def vote_portfolio(request):
    user = User.objects.get(id=request.user.id)
    portfolio = Portfolio.objects.get(id=request.data["portfolio_id"])
    is_upvote = request.data["is_upvote"]

    potential_existing_vote = Vote.objects.filter(user=user, portfolio=portfolio)
    if(potential_existing_vote):
        if(potential_existing_vote[0].upvote == is_upvote):
            return Response("you already voted")
        potential_existing_vote[0].upvote = not potential_existing_vote[0].upvote
        potential_existing_vote[0].save()
        return Response("Changed vote")

    vote = Vote.objects.create(user=user, portfolio=portfolio, upvote=is_upvote)
    vote.save()

    #create a potential notification for the owner

    vote_count = Vote.objects.filter(portfolio=portfolio).count()
    if vote_count == 1:
        message = "You just received your first vote on portfolio " + portfolio.portfolio_name
        Notification.objects.create(user=portfolio.user, message=message, portfolio_id=portfolio.id)
   
    return Response("Vote saved", status=status.HTTP_201_CREATED)

# Returns all data related to one public portfolio
@api_view(["POST"])
def get_public_portfolio_data(request):
    portfolio_request = Portfolio.objects.filter(id=request.data["id"], is_public=True)
    
    serializer = Portfolio_serializer(portfolio_request[0])
    data = serializer.data
    
    if(data == []):
        return Response("Error, no such portfolio or portfolio isn't public")

    #append current price to each position
    for positionIndex in range(len(data["positions"])):
        position = data["positions"][positionIndex]
        latest_position_price = Stock_price_table.objects.filter(ticker_symbol=position["stock_symbol"]).latest("date_time")
        data["positions"][positionIndex]["latest_price"] = latest_position_price.price
   
    return Response(data)



@api_view(["POST"])
def get_public_maingraph_data(request):
    portfolio_request = Portfolio.objects.filter(id=request.data["id"], is_public=True)
    
    serializer = Portfolio_serializer(portfolio_request[0])
    sliced_seri = serializer.data
    
    if(sliced_seri == []):
        return Response("Error, no such portfolio or portfolio isn't public")
    
    if len(sliced_seri["positions"]) == 0:
        return Response()

    history = {}
    buy_fees = float(sliced_seri["buy_fees"]) if sliced_seri["buy_fees"] != None else 0

    #get earliest buy date
    earliest_buy_date = min([position["buy_datetime"] for position in sliced_seri["positions"]])
    earliest_buy_date = datetime.datetime.strptime(earliest_buy_date, '%Y-%m-%dT%H:%M:%SZ')
    all_dates = {earliest_buy_date.date() + datetime.timedelta(days=x): 0 for x in range((datetime.datetime.now() - earliest_buy_date).days + 1)}
   
    for position in sliced_seri["positions"]:
        # get the positions buydate and since that date add the buy in price to each date
        buy_date = datetime.datetime.strptime(position["buy_datetime"], '%Y-%m-%dT%H:%M:%SZ').date()
        position_buy_in_value = float(position["purchase_price"]) * position["number_of_shares"] + buy_fees
        all_dates = {date: position_buy_in_value + all_dates[date] if date >= buy_date else all_dates[date] for date in all_dates}
        # now we can divide each date current value by the buy in value to normalize the day

        # get every price entry for that position since its buy datetime
        entries = Stock_price_table.objects.filter(ticker_symbol=position["stock_symbol"], date_time__gte=position["buy_datetime"])
        
        #for every entry if date exists in keys, append the price for that date times the number of shares, or set it first
        for entry in entries:
            date = str(entry.date_time).split(" ")[0]
            history[date] = history.get(date, 0) + entry.price * position["number_of_shares"]

    history_sorted = OrderedDict(sorted(history.items()))
    #history_sorted now contains each date and the value of all stock prices combined for that day. all_dates contains all dates as well but with the buy_in prices

    for date, value in history_sorted.items():
        date_obj = datetime.datetime.strptime(date, '%Y-%m-%d').date()
        if date_obj in all_dates:
            history_sorted[date] = value / all_dates[date_obj]
    return Response(history_sorted)

@api_view(["POST"])
def get_public_profile(request):
    user_id = request.data["user_id"]


    data = User.objects.raw(f"SELECT * FROM base_user WHERE id='{user_id}'")  # NO JOINS NEEDED, THE NESTED SERIALIZERS DO THE JOB
    seri = User_serializer(data, many=True)
    if(seri.data == []):
        return Response("Error, no such user or user has no portfolios")
    
    public_portfolios = [portfolio for portfolio in seri.data[0]["portfolios"] if portfolio["is_public"]]
    seri.data[0]["portfolios"] = public_portfolios

    # now add the users reputation to the request summing all votes for that users portfolios
    user = User.objects.get(id=user_id)
    portfolios = Portfolio.objects.filter(user=user)
    votes = Vote.objects.filter(portfolio__in=portfolios)
    votes_sum = votes.aggregate(upvotes=Sum(Case(When(upvote=True, then=1), output_field=IntegerField())), downvotes=Sum(Case(When(upvote=False, then=1), output_field=IntegerField())))
    seri.data[0]["reputation"] = votes_sum
    return Response(seri.data)

