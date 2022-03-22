import { Component, OnInit } from '@angular/core';
import{VehicleAdd} from 'src/app/core/models/driver/vehicle-add.model';
import{UserService} from 'src/app/core/services/user/user.service'
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
;import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { Router} from '@angular/router';
import * as assert from 'assert';

@Component({
  selector: 'app-edit-vehicle',
  templateUrl: './edit-vehicle.component.html',
  styleUrls: ['./edit-vehicle.component.scss']
})
export class EditVehicleComponent implements OnInit {
  public currentVehicleDetail = new VehicleAdd();
  public exporterInstance :any;
  public vehicleList= [];
  public data =[];
  public fuelTypeList =[];

  constructor(public userService : UserService,public router :Router,public authService:AuthenticationService,public dataShare: DataSharingService) { 
    this.dataShare.updatedData.subscribe((res: any) => { 
      if(res){ 
        this.exporterInstance = res;
      }
    })  
  }
  public isEdit = false;
  public submitted = false;
  lineChartData = [{
    label: '# of Votes',
    data: [10, 19, 3, 5, 2, 3],
    borderWidth: 1,
    fill: false
  }];


  lineChartColors = [
    {
      borderColor: '#3880FF'
    }
  ];

  ngOnInit(): void {
    this.getAllVehicleList();
    if(history.state.data){
      this.currentVehicleDetail = history.state.data;
      this.data  = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      this.currentVehicleDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  ngAfterViewInit(){
  }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }


     /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
    updateInfo() {
      this.userService.updateData(this.currentVehicleDetail ,'updateVehicleInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/vehicle/']);
        } 
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }
    
   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllVehicleList() {
      this.vehicleList  = JSON.parse(localStorage.getItem('vehicleTypeList'));
      this.fuelTypeList = JSON.parse(localStorage.getItem('fuelTypeList'));
  }
}
