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
    let distrbutionChartNames: Array<any> = [];
    let distrbutionChartPercentages: Array<any> = [];

    let moneyInvestedTotal: number = this.getTotalInvestedMoney(positions);

    for(let i = 0; i < positions.length; i ++){
      distrbutionChartNames.push(positions[i]["full_name"]);
      distrbutionChartPercentages.push(((positions[i]["latest_price"] * positions[i]["number_of_shares"]) / moneyInvestedTotal)*100);
    }
    this.renderPieChart(distrbutionChartNames, distrbutionChartPercentages, "Percentage", "stock-distribution");
  }

  prepareSectorDistributionChart(positions){
    let distrbutionChartSectors: Array<any> = [];
    let distrbutionChartPercentages: Array<any> = [];

    let moneyInvestedTotal: number = this.getTotalInvestedMoney(positions);

    for(let i = 0; i < positions.length; i ++){
      let sector = positions[i]["sector"];
      if(!distrbutionChartSectors.includes(sector)){
        distrbutionChartSectors.push(sector);
        distrbutionChartPercentages.push(0);
      }
      let sectorIndex = distrbutionChartSectors.indexOf(sector);
      distrbutionChartPercentages[sectorIndex] += (((positions[i]["latest_price"] * positions[i]["number_of_shares"]) / moneyInvestedTotal)*100);
    }
    this.renderHBarChart(distrbutionChartSectors, distrbutionChartPercentages, "Percentage", "sector-distribution");
  }

  public renderPieChart(xData, yData, symbol, chartId){
    new Chart(chartId, {
      type: "doughnut",
      data : {
        labels: xData,
        datasets: [{
          label: symbol,
          data: yData,
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
