import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { apiUrl } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class StockdataService {

  constructor(private http:HttpClient, private router:Router) { }

  getAvailableStocks(){
    return this.http.get(`${apiUrl}all_stock_symbols/`);
  }

  getStockPriceForDate(symbol, date){
    return this.http.post(`${apiUrl}check_stock_price`, {"stock_symbol": symbol, "datetime": date});
  }
}
