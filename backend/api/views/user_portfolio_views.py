from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import Stock_price_table, Stock_table, User, Position, Portfolio
from ..serializers import User_serializer, Position_serializer
import datetime
from decimal import Decimal
from collections import OrderedDict


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
