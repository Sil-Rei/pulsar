import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrl } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PublicPortfoliosService {

  constructor(private http: HttpClient) { }

  public getPublicPortfolios(){
    return this.http.get(`${apiUrl}get_public_portfolios`);
  }

  public getPublicPortfolio(portfolio_id: Number){
    return this.http.post(`${apiUrl}get_public_portfolio`, {id: portfolio_id});
  }

  public getPublicMainGraphData(portfolio_id: Number){
    return this.http.post(`${apiUrl}public_maingraph_data`, {id: portfolio_id});
  }

  public togglePortfolioPublicness(portfolioName: string){
    return this.http.patch(`${apiUrl}user/profile/toggle_publicness`, {portfolio_name:portfolioName});
  }

  public votePortfolio(portfolio_id: Number, isUpvote: boolean){
    return this.http.post(`${apiUrl}community/vote`, {portfolio_id: portfolio_id, is_upvote: isUpvote});
  }

  public getPublicProfile(userId: number){
    return this.http.post(`${apiUrl}get_public_profile`, {user_id: userId});
  }
}
