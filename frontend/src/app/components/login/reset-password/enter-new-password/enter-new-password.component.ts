import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-enter-new-password',
  templateUrl: './enter-new-password.component.html',
  styleUrls: ['./enter-new-password.component.css']
})
export class EnterNewPasswordComponent implements OnInit{
  constructor(private router: ActivatedRoute, private userService: UserDataService) {}
  formGroup: FormGroup;
  token: string;

  ngOnInit(){
    this.initForm();
    this.router.queryParams.subscribe(params =>{
      this.token=params["token"];
    });
  }

  initForm(){
    this.formGroup = new FormGroup({
      password: new FormControl("", [Validators.required]),
      passwordRepeat : new FormControl("", [Validators.required])
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
      if(this.formGroup.value["password"] != this.formGroup.value["passwordRepeat"]){
        this.displayError("passwords don't match");
        return;
      }
      if(String(this.formGroup.value["password"]).length < 8 || String(this.formGroup.value["password"]).length > 45){
        this.displayError("Password must be at least 8 characters");
        return;
      }

      this.userService.setNewPassword(this.formGroup.value["password"], this.token).subscribe({
        next: response =>{
          this.displayError("your password has been updated. you can now login.");
          this.formGroup.disable();
        },
        error: error => {
          this.displayError(error["error"]);
        }
      });
    }else{
      this.displayError("please enter the new password");
    }
  }

}
