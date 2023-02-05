import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicPortfoliosService } from 'src/app/services/public-portfolios.service';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-portfolio-settings',
  templateUrl: './portfolio-settings.component.html',
  styleUrls: ['./portfolio-settings.component.css']
})

export class PortfolioSettingsComponent implements OnInit {
  portfolioName: string;
  is_public: boolean;

  constructor(private route: ActivatedRoute, private userService:UserDataService, private publicService: PublicPortfoliosService){}

  ngOnInit(){
    this.portfolioName = this.route.snapshot.params["name"];
    this.userService.getPortfolioData(this.portfolioName).subscribe(data=>{
      this.is_public = data[0]["is_public"];
    })
  }

  displayError(error){
    document.getElementById("error-message").innerHTML = error;
              setTimeout(function(){
                document.getElementById("error-message").innerHTML = '';
            }, 2000)
  }

  makePublic(){
    if(!confirm("are you sure that you want to make " + this.portfolioName + " public? \nmake sure the name is compliant with our guidelines")){
      return;
    }
    this.publicService.togglePortfolioPublicness(this.portfolioName).subscribe({
      next: status => {
        this.displayError("portfolio now public");
        this.ngOnInit();
      },
      error: error => {
         this.displayError(error.error);
      }});
  }

  makePrivate(){
    if(!confirm("are you sure that you want to make " + this.portfolioName + " private? \nit will lose all votings")){
      return;
    }
    this.publicService.togglePortfolioPublicness(this.portfolioName).subscribe({
      next: status => {
        this.displayError("portfolio now private");
        this.ngOnInit();
      },
      error: error => {
         this.displayError(error.error);
      }});
  }
  
}
