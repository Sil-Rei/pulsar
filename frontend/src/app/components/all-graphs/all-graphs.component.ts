import { Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Chart, Legend } from "chart.js/auto"
import { y } from 'chart.js/dist/chunks/helpers.core';
import { apiUrl } from 'src/environments/environments';
@Component({
  selector: 'app-all-graphs',
  templateUrl: './all-graphs.component.html',
  styleUrls: ['./all-graphs.component.css']
})
export class AllGraphsComponent {
  chart;
  xData;
  yData;
  stock_symbols = [];
  stock_data; 
  dataReceived = false;

  constructor(private http:HttpClient) {    
    // Get all symbols
    this.http.get(`${apiUrl}all_stock_symbols`)
    .subscribe(data => {
      for(let i = 0; i < Object.entries(data).length; i++){
        this.stock_symbols.push(Object.entries(data)[i][1]["ticker_symbol"]);
      }
      
      console.log(this.stock_symbols);
    
    this.stock_symbols.forEach(function(symbol){
      
      http.get(`${apiUrl}stock_price_data/` + symbol)
      .subscribe(data => {
        // Convert it to readable format
        let stock_data = Object.entries(data).map(entry => entry[1]);
        
        console.log(stock_data);
        
        // Map time to x and price to y axis data
        let xData = stock_data.map(row => row["date_time"])

        // Clean up xdata to only display every nth day
          // Remove milliseconds, seconds and 'T'
          // Show year only if it changed
          let previousYear = 0;
        for(let i = 0; i < xData.length; i++){
          xData[i] = String(xData[i]).split(".")[0].split("T").join(" ").split(":").slice(0, -1).join(":");

          let year = xData[i].split("-")[0];
          // If its a new year show it, else not
          if(year == previousYear){
            xData[i] = xData[i].split("-").filter(item => item !== year).join("-");
          }else{
            previousYear = year;
          }
        }

          // Only every second entry
          for(let i = 0; i < xData.length; i++){
            if(i%2 != 0){
              xData[i] = "";
            }
          }

        let yData = stock_data.map(row => row["price"])
        
        this.renderChart(xData, yData, symbol)
    })}.bind(this))
  this.dataReceived = true});
  }

  public renderChart(xData, yData, symbol){
    this.chart = new Chart("canvas" + symbol, {
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
