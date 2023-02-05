from base.models import Stock_price_table
from base.models import Stock_table
from itertools import chain
import yfinance as yf


class HistoricalGatherer():
    symbols = []

    def __init__(self):
        all_stock_symbols_tuple = list(Stock_table.objects.values_list("ticker_symbol")) #Output is list of nested tuples
        self.symbols = list(chain.from_iterable(all_stock_symbols_tuple))
        self.fill_database()


    def fill_database(self):
        for symbol_name in self.symbols:
            # if already added continue
            if Stock_table.objects.get(ticker_symbol=symbol_name).first_date_entry != None:
                print(symbol_name + " skipped.")
                continue
            symbol = yf.Ticker(symbol_name)
            historical_data = symbol.history(start="2019-01-01", period="max")

            # get first entry date and save it to db
            first_date_entry = historical_data.index[0].date()
            stock = Stock_table.objects.get(ticker_symbol=symbol_name)
            stock.first_date_entry = first_date_entry
            stock.save()

            # loop through history data and add to stockpricetable
            for index, row in historical_data.iterrows():
                Stock_price_table.objects.create(ticker_symbol=symbol_name, price=round(row["Close"],2), date_time=index)

            print(symbol_name + " added")
            
            

