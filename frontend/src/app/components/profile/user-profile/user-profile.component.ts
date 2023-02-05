import { Component, OnInit } from '@angular/core';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit{
  memberSince: string;
  username: string;
  publicPortfolios: Array<any>;
  constructor(private userService: UserDataService){}

  ngOnInit(){
      this.userService.getUserData().subscribe(data=>{
        data = data[0];
        console.log(data);
        this.memberSince = data["member_since"];
        this.username = data["username"];
        this.publicPortfolios = data["portfolios"];
        this.publicPortfolios = this.publicPortfolios.filter(portfolio => portfolio["is_public"]==true)
      })
  }
}
