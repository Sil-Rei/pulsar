import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { PublicPortfoliosService } from 'src/app/services/public-portfolios.service';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-public-portfolio',
  templateUrl: './public-portfolio.component.html',
  styleUrls: ['./public-portfolio.component.css']
})
export class PublicPortfolioComponent {
  userid: string;
  username: string;
  portfolioName: string;
  portfolioId: number;
  in_cash: number;
  positions: Array<any>;
  overall_performance;
  added_funds: number;

  constructor(private route: ActivatedRoute, private publicService: PublicPortfoliosService){}

  ngOnInit(): void {
      // Extract currently viewed portfolio name out of path
      let portfolioId = this.route.snapshot.params["id"];
      this.username = this.route.snapshot.params["username"];
      this.portfolioId = portfolioId;
      this.publicService.getPublicPortfolio(portfolioId).subscribe(data=>{
        //Flatten data
        console.log(data);
        this.portfolioName = data["portfolio_name"];
        this.in_cash = Number(data["in_cash"]);
        this.positions = data["positions"];
        this.added_funds = Number(data["added_funds"]);
        this.userid = data["user"];

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
        this.publicService.getPublicMainGraphData(portfolioId).subscribe(data=>{
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

  report(){
    if(confirm("are you sure that you want to report " + this.portfolioName + "?")){

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

