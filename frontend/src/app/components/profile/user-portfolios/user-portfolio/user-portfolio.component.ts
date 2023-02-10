import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-user-portfolio',
  templateUrl: './user-portfolio.component.html',
  styleUrls: ['./user-portfolio.component.css']
})
export class UserPortfolioComponent implements OnInit{

  portfolioName: string;
  in_cash: number;
  positions: Array<any>;
  overall_performance;
  added_funds: number;


  constructor(private route: ActivatedRoute, private userService:UserDataService){}

  ngOnInit(): void {
      // Extract currently viewed portfolio name out of path
      let portfolioName = this.route.snapshot.params["name"];
      this.userService.getPortfolioData(portfolioName).subscribe(data=>{
        //Flatten data
        data = data[0]
        console.log(data);
        this.portfolioName = data["portfolio_name"];
        this.in_cash = Number(data["in_cash"]);
        this.positions = data["positions"];
        this.added_funds = Number(data["added_funds"]);

        // cut of time from label
        this.positions.map(position => position["buy_datetime"] = position["buy_datetime"].split("T")[0]);

        // Calculate the performance since buy with purchase_price and latest_price
        this.positions.map(position=>{
          position["performanceSinceBuy"] = (((Number(position["latest_price"]) - Number(position["purchase_price"])) / Number(position["purchase_price"])) * 100).toFixed(2);
        })
        
        console.log(this.positions);

        // Calculate overall performance -> for each stock, current price * amount, then + balance and divided by added_funds, so all money ever added
        let moneyInStocks: number = 0;
        this.positions.forEach(position=>{
          moneyInStocks += Number(position["latest_price"]) * Number(position["number_of_shares"]);
        })
        console.log("current money: " + (moneyInStocks + this.in_cash) + " overall added: " + this.added_funds);
        this.overall_performance = ((((moneyInStocks + this.in_cash) / this.added_funds) - 1)*100).toFixed(2);

      })

        // Get main chart data and process it
        this.userService.getMainGraphData(portfolioName).subscribe(data=>{
          if(data == null){
            document.getElementById("error").style.visibility = "visible";
            return;
          }
          
          // calulate a modulo number to dynamically adjust the number of datapoints on the graph depending on the overall number of datapoints
          let filteredDataObject = Object();

          let modNumber = (Object.keys(data).length/100+1).toFixed(0);
          console.log(modNumber);

          let counter: number = 0;
          for(const [key, value] of Object.entries(data)) {
            if(counter % Number(modNumber) != 0){
              counter++;
              continue;
            }
            filteredDataObject[key] = value;
            counter++;
          }
          
          let xLabels = Object.keys(filteredDataObject);
          let yLabels = Object.values(filteredDataObject);
          this.renderChart(xLabels, yLabels, "Since start", "main");
        })
        
  }

  deletePortfolio(){
    if(confirm("Do you really want to delete " + this.portfolioName + "?")){
      this.userService.deletePortfolio(this.portfolioName);
    }
  }

  deleteStock(stockSymbol: string){
    if(confirm("Do you really want to delete your " + stockSymbol["stock_symbol"] + " position?")){
     this.userService.deleteStock(this.portfolioName, stockSymbol);
    }
  }

  public renderChart(xData, yData, symbol, chartId){
    new Chart(chartId, {
      type: "line",
      data : {
        labels: xData,
        datasets: [{
          label: symbol,
          data: yData,
          backgroundColor: "#fdb44b",
          borderColor: "#00204a",
        }
        ]
      },
      options: {
        elements: {
          point: {
              radius: 0 // default to disabled in all datasets
          }
      },
        plugins: {
          legend: {
            labels: {
              color: "white"
            }
          }
        },

        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: { color: '#f5f5f5'}
          },
          x: {
            ticks: { color: "#f5f5f5" }
          }
        }}
    })
  }
}

