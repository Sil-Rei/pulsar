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

  public validateEmail(token: string){
    return this.http.post(`${apiUrl}user/validate_email`, {token: token});
  }

  public getNewVerificationEmail(){
    console.log("send");
    return this.http.get(`${apiUrl}user/new_verification_email`);
  }

  public resetUserPassword(email: string){
    return this.http.post(`${apiUrl}user/reset_password`, {email: email});
  }

  public setNewPassword(password: string, token: string){
    return this.http.post(`${apiUrl}user/reset_password_confirm`, {password: password, token: token});
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
