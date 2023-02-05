import { Component, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit{
  formGroup: FormGroup;
  constructor(private authService:AuthService, public router:Router) {}

  ngOnInit(){
    this.initForm();
    this.authService.error$.subscribe(error => {
      document.getElementById("error-message").innerHTML = error["error"]["detail"];
      setTimeout(() => {
        document.getElementById("error-message").innerHTML = "";
      }, 3000); // 3000 milliseconds = 3 seconds
    });
  }

  displayError(error){
    document.getElementById("error-message").innerHTML= error;
    setTimeout(() => {
      document.getElementById("error-message").innerHTML = "";
    }, 3000);
  }


  initForm(){
    this.formGroup = new FormGroup({
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required])
    }, {updateOn: "submit"})
  }
  
  loginProcess(){
    try {
      if(this.formGroup.valid){
        this.authService.login(this.formGroup.value);
      }else{
        this.displayError("fill in your username and password")
      }
    } catch(error) {
      document.getElementById("error-message").innerHTML = "error.message";
    }
  }
}

