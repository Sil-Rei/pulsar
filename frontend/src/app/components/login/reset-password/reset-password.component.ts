import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit{
  constructor(private userService: UserDataService){}
  formGroup: FormGroup;

  ngOnInit(){
    this.initForm();
  }

  initForm(){
    this.formGroup = new FormGroup({
      email: new FormControl("", [Validators.required])
    })
  }

  displayError(error){
    document.getElementById("error-message").innerHTML= error;
    setTimeout(() => {
      document.getElementById("error-message").innerHTML = "";
    }, 3000);
  }

  resetProcess(){
    if(this.formGroup.valid){
      this.userService.resetUserPassword(this.formGroup.value["email"]).subscribe({
        next: response =>{

        },
        error: error => {
          this.displayError(error["error"]);
        }
      });
    }else{
      this.displayError("please enter your email")
    }
  }

}
