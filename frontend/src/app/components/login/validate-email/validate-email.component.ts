import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-validate-email',
  templateUrl: './validate-email.component.html',
  styleUrls: ['./validate-email.component.css']
})
export class ValidateEmailComponent implements OnInit{

  constructor(private router: ActivatedRoute, private userService: UserDataService) {}

  displayStatus(error){
    document.getElementById("status").innerHTML= error;
  }

  ngOnInit() {
   
    this.router.queryParams.subscribe(params =>{
      this.userService.validateEmail(params["token"]).subscribe({
        next: response =>{
          this.displayStatus("You email is now validated! You can close this tab now and dive into the joy of portfolio analyzing")
        },
        error: error => {
          this.displayStatus(error["error"]);
        }
      })
    });
    
  }


}
