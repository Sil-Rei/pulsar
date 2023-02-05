import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormatCheckService } from 'src/app/services/format-check.service';
import { apiUrl } from 'src/environments/environments';

@Component({
  selector: 'app-add-portfolio',
  templateUrl: './add-portfolio.component.html',
  styleUrls: ['./add-portfolio.component.css']
})
export class AddPortfolioComponent implements OnInit{
  formGroup: FormGroup;

  constructor(private http:HttpClient, private router:Router, private formatCheckService: FormatCheckService){}

  ngOnInit(){
    this.initForm();
  }

  initForm(){
    this.formGroup = new FormGroup({
      portfolio_name: new FormControl("", [Validators.required]),
      in_cash: new FormControl("", [Validators.required]), 
      buy_fees: new FormControl("", []),
      sell_fees: new FormControl("", []),
      annual_fees: new FormControl("", [])
    })
  }

  displayError(error){
    document.getElementById("error").innerHTML= error;
    setTimeout(() => {
      document.getElementById("error").innerHTML = "";
    }, 3000);
  }

  createPortfolio(){
    if(this.formGroup.valid){    
      // check for valid inputs
      if(String(this.formGroup.value["portfolio_name"]).length > 20){
        this.displayError("name shouldn't be longer than 20 chars");
        return;
      }else if(!(/^[\x00-\x7F]*$/.test(this.formGroup.value["portfolio_name"]))){
        this.displayError("name contains unvalid characters");
        return;
      }
    
      // check if valid numbers
      if(this.formGroup.value["buy_fees"] != ""){
        if(!this.formatCheckService.checkIfValidNumber(this.formGroup.value["buy_fees"])){
          this.displayError("Buy fees not a valid number.");
          return;
        }
      }
      if(this.formGroup.value["sell_fees"] != ""){
        if(!this.formatCheckService.checkIfValidNumber(this.formGroup.value["sell_fees"])){
          this.displayError("Sell fees not a valid number.");
          return;
        }
      }
      if(this.formGroup.value["annual_fees"] != ""){
        if(!this.formatCheckService.checkIfValidNumber(this.formGroup.value["annual_fees"])){
          this.displayError("Annual fees not a valid number.");
          return;
        }
      }

      this.http.post(`${apiUrl}user/add_portfolio`, this.formGroup.value).subscribe({
        next: response =>{
          this.router.navigate(["/profile/portfolios"]);
        },
        error: error => {
          this.displayError(error["error"]);
        }
    });
    }else{
      this.displayError("please fill in the name and seed capital")
    } 
  };
}