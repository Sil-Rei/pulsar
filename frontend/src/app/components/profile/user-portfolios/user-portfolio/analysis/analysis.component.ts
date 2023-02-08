import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { PublicPortfoliosService } from 'src/app/services/public-portfolios.service';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent {
  portfolioName: string;

  constructor(private route: ActivatedRoute, private userService:UserDataService, private publicService: PublicPortfoliosService){}

  ngOnInit(){
    this.portfolioName = this.route.snapshot.params["name"];
    this.userService.getPortfolioData(this.portfolioName).subscribe(data=>{
      this.prepareStockDistributionChart(data[0]["positions"]);
      this.prepareSectorDistributionChart(data[0]["positions"]);
    })
  }

  getTotalInvestedMoney(positions){
    let moneyInvestedTotal: number = 0;
    for(let i = 0; i < positions.length; i ++){
      moneyInvestedTotal += positions[i]["latest_price"] * positions[i]["number_of_shares"];
    }
    return moneyInvestedTotal;
  }

  prepareStockDistributionChart(positions: Array<any>){
    let distributionChartNames: Array<any> = [];
    let distributionChartPercentages: Array<any> = [];

    let moneyInvestedTotal: number = this.getTotalInvestedMoney(positions);

    for(let i = 0; i < positions.length; i ++){
      distributionChartNames.push(positions[i]["full_name"]);
      distributionChartPercentages.push(((positions[i]["latest_price"] * positions[i]["number_of_shares"]) / moneyInvestedTotal)*100);
    }
    this.renderPieChart(distributionChartNames, distributionChartPercentages, "Percentage", "stock-distribution");
  }

  prepareSectorDistributionChart(positions) {
    let distributionChart = {};
    let moneyInvestedTotal = this.getTotalInvestedMoney(positions);
  
    for (let i = 0; i < positions.length; i++) {
      let sector = positions[i]["sector"];
      if (!distributionChart.hasOwnProperty(sector)) {
        distributionChart[sector] = 0;
      }
      distributionChart[sector] += ((positions[i]["latest_price"] * positions[i]["number_of_shares"]) / moneyInvestedTotal) * 100;
    }
  
    let sortedSectors = Object.keys(distributionChart).sort((a, b) => distributionChart[b] - distributionChart[a]);
    let sortedPercentages = sortedSectors.map(sector => distributionChart[sector]);
  
    this.renderHBarChart(sortedSectors, sortedPercentages, "Percentage", "sector-distribution");
  }

  public renderPieChart(xData, yData, symbol, chartId){
    new Chart(chartId, {
      type: "doughnut",
      data : {
        labels: xData,
        datasets: [{
          label: symbol,
          data: yData,
          //backgroundColor: ["#fdb44b", "#fd9f1c", "#fdbf68", "#e38502", "#fed49a"],
        }
        ]
      },
      options: {
        borderColor: "black",
        plugins: {
          legend: {
            labels: {
              color: "white"
            }
          }
        }
      }
    })
  }

  public renderHBarChart(xData, yData, symbol, chartId){
    new Chart(chartId, {
      type: "bar",
      data : {
        labels: xData,
        datasets: [{
          label: symbol,
          data: yData,
          barThickness: 35,
          backgroundColor: ["#fdb44b", "#00204a"],
          borderColor:  ["#fdb44b", "#00204a"]
        }
        ]
      },
      options: {
        indexAxis: 'y',

        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: { color: '#f5f5f5'},
            grid:{
              display: false,
            }
          },
          x: {
            ticks: { display: false },
            grid:{
              display: false,
            }
          }
        }
      },
    })
  }

}
