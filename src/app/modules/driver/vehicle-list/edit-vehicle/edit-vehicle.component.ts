import { Component, OnInit } from '@angular/core';
import{VehicleAdd} from 'src/app/core/models/driver/vehicle-add.model';
import{UserService} from 'src/app/core/services/user/user.service'
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
;import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { Router} from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
 import {MatDialog} from '@angular/material/dialog';

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

  constructor(public userService : UserService,public router :Router,
    public dialog :MatDialog,
    public authService:AuthenticationService,public dataShare: DataSharingService) { 
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
    this.isEdit = this.isEdit ? false : true;
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

    /*
    Author:Kapil Soni
    Funcion:deleteVehicle
    Summary:deleteVehicle for get delete vehicle  
    Return list
  */
  deleteVehicle(value){
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      panelClass: 'custom-dialog-container',
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Delete',
          cancel: 'No',
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if(confirmed && this.currentVehicleDetail.id){
        this.userService.deleteDataFromDb(this.currentVehicleDetail.id,'deleteVehicleByID').subscribe((data:any)=>{
          if(data.message){
            this.router.navigate(['/user/vehicle/']);
            this.authService.successToast(data.message);
          }
        }, error => {
            this.authService.errorToast(error.error.message);
        })
      }
    });
  }
}
