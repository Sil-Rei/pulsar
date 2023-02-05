import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  formGroup: FormGroup;
  recaptchaResponse: string;
  captchaPublicKey: string;
  constructor(private authService:AuthService, public router:Router) {}

  ngOnInit(){
    this.initForm();
    this.authService.getCaptchaToken().subscribe(res => {
      this.captchaPublicKey = String(res);
    });
  }

  resolved(response: string) {
    this.recaptchaResponse = response;
  }

  initForm(){
    this.formGroup = new FormGroup({
      username: new FormControl("", [Validators.required]),
      email: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      passwordCheck : new FormControl("", [Validators.required])
    })
  }

  displayError(error){
    if(error["username"] != undefined){
      error = error["username"];
    }
    document.getElementsByClassName("error-message")[0].innerHTML= error;
    setTimeout(() => {
      document.getElementsByClassName("error-message")[0].innerHTML = "";
    }, 3000);
  }

  registerProcess(){
    if(this.formGroup.valid){

      // check if passwords are the same
      if(this.formGroup.value["password"] != this.formGroup.value["passwordCheck"]){
        this.displayError("Passwords do not match");
        return;
      }
      // check password length
      if(String(this.formGroup.value["password"]).length < 8 || String(this.formGroup.value["password"]).length > 45){
        this.displayError("Password must be at least 8 characters");
        return;
      }

      this.authService.register({...this.formGroup.value, recaptchaResponse: this.recaptchaResponse}).subscribe({
        next: response =>{
          this.router.navigate(["/sign-in"])
        },
        error: error => {
          this.displayError(error["error"]);
        }
    });
      }else{
        this.displayError("Please fill in all the details needed");
      }
    }
}
