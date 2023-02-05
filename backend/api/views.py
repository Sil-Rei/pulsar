from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import Stock_price_table, Stock_table, User, Position, Portfolio, Vote, Notification
from .serializers import Stock_price_table_serializer, Stock_table_serializer, User_serializer, Portfolio_serializer, Position_serializer, Portfolio_POST_serializer, RegisterSerializer, NotificationSerializer
from itertools import chain
from django.db.models import Sum, Case, When, IntegerField

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import datetime
from decimal import Decimal
from collections import OrderedDict


# Login/ Register API
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# User
@api_view(["POST"])
def register_user(request):
    print(request.data)
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        User.objects.create(username=request.data["username"])
        user = User.objects.get(username=request.data["username"])
        Notification.objects.create(user=user, message=f"Welcome {user.username} to polar.! \nLook around or go to the portfolio tab to create your own today")
   
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    user = User.objects.get(id=request.user.id)
    notifications = Notification.objects.filter(user=user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_notification(request):
    user = User.objects.get(id=request.user.id)
    Notification.objects.filter(user=user, id=request.data["notification_id"]).delete()
    return Response("Deleted notification")


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    user = User.objects.get(id=request.user.id)
    Notification.objects.filter(user=user, already_read=False).update(already_read=True)
    return Response("marked all as read")

#returns all data related to one user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    username = request.user

    data = User.objects.raw(f"SELECT * FROM base_user WHERE username='{username}'")  # NO JOINS NEEDED, THE NESTED SERIALIZERS DO THE JOB
    seri = User_serializer(data, many=True)

    if(seri.data == []):
        return Response("Error, no such user or user has no portfolios")
    
    return Response(seri.data)


# Returns all data related to one portfolio
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_portfolio_data(request):
    username_request = request.user
    portfolio_name_request = request.data["portfolio_name"]

    data = User.objects.filter(username=username_request)
    seri = User_serializer(data, many=True)
    
    if(seri.data == []):
        return Response("Error, no such user or user has no portfolios")
    sliced_seri = [port for port in seri.data[0]["portfolios"] if port["portfolio_name"] == portfolio_name_request]
    
    #append current price to each position
    for positionIndex in range(len(sliced_seri[0]["positions"])):
        position = sliced_seri[0]["positions"][positionIndex]
        latest_position_price = Stock_price_table.objects.filter(ticker_symbol=position["stock_symbol"]).latest("date_time")
        sliced_seri[0]["positions"][positionIndex]["latest_price"] = latest_position_price.price
    return Response(sliced_seri)

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
@permission_classes([IsAuthenticated])
def get_maingraph_data(request):
    username_request = request.user
    portfolio_name_request = request.data["portfolio_name"]

    data = User.objects.filter(username=username_request)
    seri = User_serializer(data, many=True)
    
    if(seri.data == []):
        return Response("Error, no such user or user has no portfolios")
    
    #extract only requested portfolio 
    sliced_seri = [port for port in seri.data[0]["portfolios"] if port["portfolio_name"] == portfolio_name_request]
    
    if len(sliced_seri[0]["positions"]) == 0:
        return Response()

    history = {}
    buy_fees = float(sliced_seri[0]["buy_fees"]) if sliced_seri[0]["buy_fees"] != None else 0

    #get earliest buy date
    earliest_buy_date = min([position["buy_datetime"] for position in sliced_seri[0]["positions"]])
    earliest_buy_date = datetime.datetime.strptime(earliest_buy_date, '%Y-%m-%dT%H:%M:%SZ')
    all_dates = {earliest_buy_date.date() + datetime.timedelta(days=x): 0 for x in range((datetime.datetime.now() - earliest_buy_date).days + 1)}
   
    for position in sliced_seri[0]["positions"]:
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


#adds portfolio to user
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_portfolio(request):
    
    # get name of portfolio in request
    portfolio_name_request = request.data["portfolio_name"]
    
    #get userid of request
    user_id_request = request.user.id

    #append user id to request
    request.data["user"] = user_id_request
    request.data["portfolio_name"] = portfolio_name_request.lower()

    #copy value of in_cash to added_funds
    request.data["added_funds"] = request.data["in_cash"]
    
    
    # Check if portfolio name already exists within user portfolios
    if Portfolio.objects.filter(user_id=user_id_request, portfolio_name=portfolio_name_request).exists():
        return Response("Already exists", status=status.HTTP_400_BAD_REQUEST)
    
    # Check if valid, then create entry or return error
    serializer = Portfolio_POST_serializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_portfolio(request):
    Portfolio.objects.filter(user_id=request.user.id, portfolio_name=request.data["portfolio_name"].lower()).delete()
    return Response("Deleted", status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_portfolio_publicness(request):
    portfolio = Portfolio.objects.get(user_id=request.user.id, portfolio_name=request.data["portfolio_name"])

    portfolio.is_public = not portfolio.is_public
    portfolio.save()

    return Response(f"portfolio is now {portfolio.is_public}.", status=status.HTTP_202_ACCEPTED)

@api_view(["POST"])
@permission_classes([IsAuthenticated]) 
def add_stock(request):

    # request contains portfolio name, now checking if a portfolio with given name matches user id
    portfolio_name_request = request.data["portfolio_name"].lower()
    user_id_request = request.user.id
    portfolio = Portfolio.objects.get(user_id=user_id_request, portfolio_name=portfolio_name_request)
    portfolio_id = portfolio.id

    if not portfolio_id:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # check if stock exists in backend
    if not Stock_table.objects.filter(ticker_symbol=request.data["stock_symbol"]):
        return Response("Stock doesnt exist.", status=status.HTTP_400_BAD_REQUEST)
    
    # add portfolio_id to data
    request.data["portfolio"] = portfolio_id

    #update balance
    portfolio.in_cash -= Decimal.from_float(request.data["price"])
    portfolio.save()

    serializer = Position_serializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_stock(request):

    #Check if user owns portfolio
    if not Portfolio.objects.filter(user_id=request.user.id, portfolio_name=request.data["portfolio_name"]):
        return Response("No matching portfolio found for this user", status=status.HTTP_403_FORBIDDEN)

    
    # delete stock 
    stock_id = request.data["stock_symbol"]["id"]
    Position.objects.filter(id=stock_id).delete()
    return Response("Deleted", status=status.HTTP_200_OK)
    


# Stock api
@api_view(["POST"])
def check_stock_price(request):
    print(request.data)
    datetime_request = str(request.data["datetime"]).split("-")
    year = int(datetime_request[0])
    month = int(datetime_request[1])
    day = int(datetime_request[2].split("T")[0])
    stock_symbol_request = request.data["stock_symbol"]

    price_query = Stock_price_table.objects.filter(ticker_symbol=stock_symbol_request, date_time__date=datetime.date(year, month, day))
    if not price_query:
        return Response("No price for that given stock and date", status=status.HTTP_404_NOT_FOUND)

    price = price_query[0].price
    return Response(price)


@api_view(["GET"])
def stock_price_data(request, ticker_symbol):
    ticker_symbol = ticker_symbol.upper()
    all_ticker_symbols_tuple = list(Stock_table.objects.values_list("ticker_symbol")) #Output is list of nested tuples
    all_ticker_symbols = list(chain.from_iterable(all_ticker_symbols_tuple)) # Flatten the tuple list to list of strings
        
    if ticker_symbol not in all_ticker_symbols:
        return Response("Error. This stock symbol is not tracked or recognised. Check spelling", status=status.HTTP_404_NOT_FOUND)
    
    # Get all rows where ticker_symbol equals requested ticker_symbol
    requested_stock_data = Stock_price_table.objects.filter(ticker_symbol = ticker_symbol).values()
    
    serializer = Stock_price_table_serializer(requested_stock_data, many=True)
    
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_stock_prices(request):
    print(request.user)
    stock_price_data = Stock_price_table.objects.all()
    serializer = Stock_price_table_serializer(stock_price_data, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_all_stock_symbols(request):
    all_stock_symbols = Stock_table.objects.all()
    serializer = Stock_table_serializer(all_stock_symbols, many=True)
    return Response(serializer.data)
