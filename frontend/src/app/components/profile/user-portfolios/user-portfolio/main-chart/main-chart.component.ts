import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.css']
})
export class MainChartComponent implements OnInit{
  portfolioName: string;

  constructor(private route: ActivatedRoute, private userService:UserDataService){}

  ngOnInit(){
    this.portfolioName = this.route.snapshot.params["name"];
     // Get main chart data and process it
     this.userService.getMainGraphData(this.portfolioName).subscribe(data=>{
      if(data == null){
        document.getElementById("error").style.visibility = "visible";
        return;
      }
      
      // only every nth element
      let filteredDataObject = Object();
      
      let counter: number = 0;
      for(const [key, value] of Object.entries(data)) {
        if(counter % 1 != 0){
          counter++;
          continue;
        }
        filteredDataObject[key] = value;
        counter++;
      }
      console.log(Object.keys(filteredDataObject).length)
      let xLabels = Object.keys(filteredDataObject);
      let yLabels = Object.values(filteredDataObject);
      this.renderChart(xLabels, yLabels, "main chart", "main");
    })
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
