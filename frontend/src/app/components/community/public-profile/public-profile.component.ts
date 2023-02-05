import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicPortfoliosService } from 'src/app/services/public-portfolios.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent {
  memberSince: string;
  username: string;
  publicPortfolios: Array<any>;
  userId: number;
  reputation: number;
  constructor(private route: ActivatedRoute, private publicService: PublicPortfoliosService){}

  ngOnInit(){
    this.userId = this.route.snapshot.params["userid"];
    this.publicService.getPublicProfile(this.userId).subscribe(data=>{
      data = data[0];
      this.reputation = data["reputation"]["upvotes"] - data["reputation"]["downvotes"];
      this.memberSince = data["member_since"];
      this.username = data["username"];
      this.publicPortfolios = data["portfolios"];
      this.publicPortfolios = this.publicPortfolios.filter(portfolio => portfolio["is_public"]==true)
    })
  }

  report(){
    if(confirm("Are you sure that you want to report " + this.username + "?")){}
  }
}
