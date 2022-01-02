import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-driver',
  templateUrl: './edit-driver.component.html',
  styleUrls: ['./edit-driver.component.scss']
})
export class EditDriverComponent implements OnInit {

  constructor() { }
  public isEdit = false;
  lineChartData = [{
    label: '# of Votes',
    data: [10, 19, 3, 5, 2, 3],
    borderWidth: 1,
    fill: false
  }];

  lineChartLabels = ["2013", "2014", "2014", "2015", "2016", "2017"];

  lineChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  lineChartColors = [
    {
      borderColor: '#3880FF'
    }
  ];
  ngOnInit(): void {
   
  }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

}
