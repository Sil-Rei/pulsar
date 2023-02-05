from base.models import Stock_price_table
from base.models import Stock_table
import yfinance as yf

stop_thread = False
class DataGatherer():
    list_of_tracked_stocks = []
    
    def __init__(self): 
        self.list_of_tracked_stocks = self.reload_tracked_stocks()
        
    
    def print_stocks(self):
        print("List of stocks:")
        for stock in self.list_of_tracked_stocks:
            print(stock)

    def reload_tracked_stocks(self):
        ticker_symbols = Stock_table.objects.values("ticker_symbol")
        return ticker_symbols

    def update_stock_prices(self):
        for stock in self.list_of_tracked_stocks:
            stock_data = yf.Ticker(stock["ticker_symbol"])
            current_price = stock_data.info["currentPrice"]
            Stock_price_table.objects.create(ticker_symbol=stock["ticker_symbol"], price=current_price)

        print("Updated stock prices")