import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { StockdataService } from 'src/app/services/stockdata.service';
import { UserDataService } from 'src/app/services/userdata.service';
import { apiUrl } from 'src/environments/environments';

@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.css']
})
export class AddStockComponent implements OnInit{
  formGroup: FormGroup;
  dateToday;
  portfolioName;
  dropdownList = [];
  dropdownSettings: IDropdownSettings = {};
  selectedItems = [];

  constructor(private userData: UserDataService, private router:Router, private route: ActivatedRoute, private stockdata: StockdataService, private http:HttpClient){}

  ngOnInit(){
    // Get todays date for max value calender
    let splittedDate = new Date().toISOString().split(":");
    this.dateToday = splittedDate[0] +":"+ splittedDate[1];

    // Init the formular and extraxt name from url
    this.initForm();
    this.portfolioName = this.route.snapshot.params["name"];

    // Get all stock symbols from backend and and them to the dropdown list
    this.stockdata.getAvailableStocks().subscribe(data => {
      let dataAsArray = Object.entries(data);
      for(let i = 0; i < dataAsArray.length; i++){
        let symbol = dataAsArray[i][1]["ticker_symbol"];
        this.dropdownList = this.dropdownList.concat({item_id: i+1, item_text: symbol});
      }
    })
    // Settings for dropdown, single selection so you cant select multiple symbols
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      allowSearchFilter: true,
    };
  }

  displayError(error){
    
    document.getElementById("error-message").innerHTML = error;
              console.error('There was an error!', error);
              setTimeout(function(){
                document.getElementById("error-message").innerHTML = '';
            }, 2000)
  }

  // Initializes the form, stock name gets added manually after
  initForm(){
    this.formGroup = new FormGroup({
      number_of_shares: new FormControl("", [Validators.required]), 
      buy_datetime: new FormControl("", [Validators.required])
    })
  }

  // function called with button click, adds the portfolio name and stock name manually
  addStock(){
    if(this.selectedItems.length == 0){
      this.displayError("please select a stock.");
      return;
    }
    if(this.formGroup.valid && this.selectedItems[0]["item_text"] != null){
       //Append portfolioname and stockname for backend
        this.formGroup.value["portfolio_name"] = this.portfolioName;
        this.formGroup.value["stock_symbol"] = this.selectedItems[0]["item_text"];

        // get stock price for that day to check if balance is high enough
        this.stockdata.getStockPriceForDate(this.formGroup.value["stock_symbol"], this.formGroup.value["buy_datetime"]).subscribe({
          next: stockPrice => {

            this.userData.getPortfolioData(this.portfolioName).subscribe(data=>{
              data = data[0]
  
              let balance = Number(data["in_cash"]);              console.log(balance);
              let price = Number((Number(stockPrice) * this.formGroup.value["number_of_shares"]).toFixed(2));

              // get potential fees
              let buy_fees = data["buy_fees"];

              if(buy_fees != null){
                price += Number(buy_fees);
              }
              if(balance >= price){
                if(!confirm("Do you really want to buy " + this.selectedItems[0]["item_text"] + " for a total of " + price + "$?")){
                  return;
                }
                this.formGroup.value["price"] = price;
                this.formGroup.value["purchase_price"] = stockPrice;
                this.http.post(`${apiUrl}user/add_stock`, this.formGroup.value).subscribe(()=>{
                this.router.navigate(["/profile/portfolios", this.portfolioName]);
                });
              }else{
                this.displayError("Not enough balance");
              }
            })
          },
          error: error => {
              // display error for 2 seconds
              this.displayError(error.error);
          }
        })
    }else{
      this.displayError("please fill in all needed data");
    }
  };

}
