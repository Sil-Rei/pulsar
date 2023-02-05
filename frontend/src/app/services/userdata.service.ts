import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { apiUrl } from 'src/environments/environments';


@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(private http:HttpClient, private router:Router) {
    }

   public getUserData(){
    return this.http.get(`${apiUrl}user/data`);
   }

   public getMainGraphData(portfolioName: string){
    return this.http.post(`${apiUrl}user/maingraph_data`, {portfolio_name:portfolioName});
   }

   public getPortfolioData(portfolioName: string){
    return this.http.post(`${apiUrl}user/portfolio_data`, {portfolio_name:portfolioName});
   }

   public deletePortfolio(portfolioName: string){
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        portfolio_name: portfolioName,
      },
    };
      this.http.delete(`${apiUrl}user/delete_portfolio`, options).subscribe(()=>{
        this.router.navigate(["/profile/portfolios"]);
      });
   }

   public deleteStock(portfolioName: string, stockSymbol: string){
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        portfolio_name: portfolioName,
        stock_symbol: stockSymbol,
      }, 
    };
      this.http.delete(`${apiUrl}user/delete_stock`, options).subscribe(()=>{
        window.location.reload();                             //TODO fix reload
      });
   }
}
