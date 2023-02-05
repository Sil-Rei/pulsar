from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import Stock_price_table, Stock_table
from ..serializers import Stock_price_table_serializer, Stock_table_serializer
import datetime
from itertools import chain

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
