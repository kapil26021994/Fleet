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
  public isDefaultData  = false;
  public geofenceList = [];
  public selectedDeviceType :any;
  public selectedGeofenceList =[];

  constructor(public userService : UserService,public router :Router,
    public dialog :MatDialog,
    public authService:AuthenticationService,public dataShare: DataSharingService) { 
  }
  public isEdit = false;
  public companyList = [];
  public deviceList =[];
  public submitted = false;
  public isEditData:boolean = false;
  public companyCloneList =[];

  ngOnInit(): void {
    this.getAllVehicleList();
   
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    this.companyCloneList = this.companyList;

    if(history.state.data){
      this.currentVehicleDetail = history.state.data;
      this.currentVehicleDetail.isActive == 'active' ? this.isEditData = true :this.isEditData = false;
      if(this.currentVehicleDetail.device != null){
        this.selectedDeviceType = this.currentVehicleDetail.device.deviceName;
      }else{
        this.selectedDeviceType = 'No-device';
      }
     
      this.getAllDeviceList();
      //assign id and get id array
      if(this.currentVehicleDetail.geofencePlace.length>0){
        this.selectedGeofenceList = this.currentVehicleDetail.geofencePlace.map(x=>x.id);
      }

      //updateDataViaKey function for get geofence list..
      if(this.currentVehicleDetail.company.id){
        this.updateDataViaKey(this.currentVehicleDetail.company,'');
      }
      this.data  = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      this.currentVehicleDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  toggleEditForm() {
    this.isEdit = this.isEdit ? false : true;
  }

  getAllDeviceList() {
    this.userService.getDataByUrl('showAllUnusedDeviceAndSelectedDevice/'+(this.currentVehicleDetail.device == null ? 0 : this.currentVehicleDetail.device.id)).subscribe((data:any)=>{
      if(data.length>0){
        this.deviceList = data;
      }
    })
  }

    /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  updateInfo() {
    if(this.isEditData){
      this.currentVehicleDetail.isActive='active';
    }else{
      this.currentVehicleDetail.isActive='inActive';
    }
    var list =[];
    this.selectedGeofenceList.forEach((data :any)=> {
      let selectedGeofence =  this.geofenceList.find(x=>x.id == data);
      if(selectedGeofence != undefined){
          list.push(selectedGeofence);
      }
    });
    let data =  this.companyList.find(x=>x.companyName ==  this.currentVehicleDetail.company.companyName);
    if(data != undefined){
      this.currentVehicleDetail.company = data;
    }
    
    this.currentVehicleDetail.geofencePlace = list;
    //if device exist or not if not exist in such case we set null....
    let deviceData =  this.deviceList.find(x=>x.deviceName == this.selectedDeviceType);
    if(deviceData){
      this.currentVehicleDetail.device = deviceData;
    }else{
      this.currentVehicleDetail.device = null;
    }
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
 public vehicleTypeCloneList =[];
  getAllVehicleList() {
      this.vehicleList  = JSON.parse(localStorage.getItem('vehicleTypeList'));
      this.vehicleTypeCloneList = this.vehicleList;
      this.fuelTypeList = JSON.parse(localStorage.getItem('fuelTypeList'));
  }

    /*
    Author:Kapil Soni
    Funcion:deleteVehicle
    Summary:deleteVehicle for get delete vehicle  
    Return list
  */
  deleteVehicle(){
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

  updateDataViaKey(value,key){
    if(value){
      if(key == 'company'){
        this.selectedGeofenceList =[];
      }
      
      var companyId :any;
      let data =  this.companyList.find(x=>x.companyName == value);
       if(value.id){
        companyId =value.id; 
       } else{
        companyId  = data.id
       }
      //call showGeofenceByCompanyId for get gofenceList
      if(companyId){
        this.userService.getDataByUrl('showGeofenceByCompanyId/'+companyId).subscribe((data:any)=>{
          if(data.length>0){
            this.geofenceList = data;
          }else{
            this.geofenceList = [];
          }
        })
      }
    }
  }

  updateGeofence(){
    this.isDefaultData = true;
  }

  search(value: string,key) { 
    let filter = value.toLowerCase();
    if(key != ''){
      let list = this.vehicleTypeCloneList.filter(option => option.vehicleType.toLowerCase().startsWith(filter));
      return this.vehicleList= list;
    }else{
      let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
      return this.companyList= list;
    }
  }

}
