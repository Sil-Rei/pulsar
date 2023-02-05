import { Component, OnInit } from '@angular/core';
import { PublicPortfoliosService } from 'src/app/services/public-portfolios.service';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-public-portfolios',
  templateUrl: './public-portfolios.component.html',
  styleUrls: ['./public-portfolios.component.css']
})
export class PublicPortfoliosComponent implements OnInit {
  portfolios;
  alreadyUpvoted: Array<Number> = new Array;
  alreadyDownvoted: Array<Number> = new Array;
  constructor(private publicService: PublicPortfoliosService){}
  
  setPortfolioVote(portfolio_id: Number, isUpvote: boolean){
    if(isUpvote){
      document.getElementById("up." + portfolio_id).style.color="rgb(63, 162, 63)";
    }else{
      document.getElementById("down." + portfolio_id).style.color="#7b0616";
    }
  }
  
  ngOnInit(){
      this.publicService.getPublicPortfolios().subscribe(data=>{
        this.portfolios = data;
        // calculate upvotes - downvotes
        Object.entries(this.portfolios).forEach(portfolio =>{
          portfolio[1]["voting_sum"] = portfolio[1]["upvotes"] - portfolio[1]["downvotes"];
        })
        setTimeout(this.markAlreadyVoted.bind(this), 20);
      })
  }
  // mark already voted portfolios as voted, 0 -> not voted, 1 downvoted, 2 upvoted
  markAlreadyVoted(){
    Object.entries(this.portfolios).forEach(portfolio =>{
      if(portfolio[1]["vote_status"] == 1){
        this.setPortfolioVote(portfolio[1]["id"], false);
        this.alreadyDownvoted.push(portfolio[1]["id"]);
      }else if(portfolio[1]["vote_status"] == 2){
        this.setPortfolioVote(portfolio[1]["id"], true);
        this.alreadyUpvoted.push(portfolio[1]["id"]);
      }
    });
  }

  clicked(directiton: string){
    if(directiton.split(".")[0] == "up"){
      // send upvote to db
      let id = Number(directiton.split(".")[1]);
      this.publicService.votePortfolio(id, true).subscribe();
      document.getElementById(directiton).style.color="rgb(63, 162, 63)";
      // update vote counter to mimic upvote on frontend without need to reload if not in already voted ids
      // remove the vote of the opposite array if existing
      let votingAmount = 1;
      const index = this.alreadyDownvoted.indexOf(id);
      if (index > -1) {
        this.alreadyDownvoted.splice(index, 1); 
        votingAmount++;
      }

      if(!this.alreadyUpvoted.includes(id)){
        document.getElementById("votes"+id).innerHTML = String(Number(document.getElementById("votes"+id).innerHTML) + votingAmount);
        this.alreadyUpvoted.push(id);
      }

      // deselect other
      let downThumb = "down." + directiton.split(".")[1];
      document.getElementById(downThumb).style.color="#fdb44b";

    }else{
      let id = Number(directiton.split(".")[1]);
      this.publicService.votePortfolio(id, false).subscribe();
      document.getElementById(directiton).style.color="#7b0616";
      let votingAmount = 1;
       const index = this.alreadyUpvoted.indexOf(id);
       if (index > -1) {
         this.alreadyUpvoted.splice(index, 1); 
         votingAmount++;
       }
       if(!this.alreadyDownvoted.includes(id)){
        document.getElementById("votes"+id).innerHTML = String(Number(document.getElementById("votes"+id).innerHTML) - votingAmount);
        this.alreadyDownvoted.push(id);
      }
   

      let downThumb = "up." + directiton.split(".")[1];
      document.getElementById(downThumb).style.color="#fdb44b";
    }
    
  }

}
