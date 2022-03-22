import { Component, OnInit } from '@angular/core';
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';
import{UserService} from 'src/app/core/services/user/user.service'
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';

@Component({
  selector: 'app-edit-driver',
  templateUrl: './edit-driver.component.html',
  styleUrls: ['./edit-driver.component.scss']
})
export class EditDriverComponent implements OnInit {
  currentVehicleDetail = new DiverListModel();
  public exporterInstance:any;
  public data = [];
  constructor(
    public userService : UserService,
    public router :Router,
    public authService:AuthenticationService,
    public dataShare :DataSharingService) { 
    this.dataShare.updatedData.subscribe((res: any) => { 
      if(res){ 
        this.exporterInstance = res;
      }
    })  
  }
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
    if(history.state.data){
      this.currentVehicleDetail = history.state.data;
      this.data = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      this.currentVehicleDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

     /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for get vehicle list
    Return list
  */
    updateDriverInfo() {
      this.userService.updateData(this.currentVehicleDetail ,'updateDriverInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/driver/']);
        } 
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }

}
