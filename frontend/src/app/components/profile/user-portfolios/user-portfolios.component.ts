import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from 'src/app/services/userdata.service';
import { apiUrl } from 'src/environments/environments';

@Component({
  selector: 'app-dashboard',
  templateUrl: './user-portfolios.component.html',
  styleUrls: ['./user-portfolios.component.css']
})
export class UserPortfoliosComponent implements OnInit{
  name: string = localStorage.getItem("username");
  isVerified: boolean;

  userPortfolios;  

  constructor(private service:UserDataService){
  }

  ngOnInit() {
    this.service.getUserData().subscribe(data=>{
      this.userPortfolios = Array.from(data[0]["portfolios"]);
      this.isVerified = data[0]["verified_email"];
    })
  }
}
