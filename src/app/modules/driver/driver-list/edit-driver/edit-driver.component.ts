import { Component, OnInit } from '@angular/core';
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';
import{UserService} from 'src/app/core/services/user/user.service'
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-edit-driver',
  templateUrl: './edit-driver.component.html',
  styleUrls: ['./edit-driver.component.scss']
})
export class EditDriverComponent implements OnInit {
  currentVehicleDetail = new DiverListModel();
  public exporterInstance:any;
  public isEditData :boolean = false;
  public data = [];
  public companyList =[];
  public vehicleList =[];
  public vehicleCloneList =[];
  public companyCloneList =[];
  constructor(
    public userService : UserService,
    public dialog :MatDialog,
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
  
  ngOnInit(): void {
    this.companyList= this.userService.getCompanyList();
    this.companyCloneList = this.companyList;
    if(history.state.data){
      this.currentVehicleDetail = history.state.data;
      if(this.currentVehicleDetail.company){
        (<any>this.currentVehicleDetail).companyName = this.currentVehicleDetail.company.companyName;
        this.getVehicleListByCompanyId(this.currentVehicleDetail.company);
      }
     
      if(this.currentVehicleDetail.vehicle){
        (<any>this.currentVehicleDetail).vehicleNumber = this.currentVehicleDetail.vehicle.vehicleNumber;
      }
      
      this.data = [history.state.data];
      (<any>this.currentVehicleDetail).isActive == 'active' ? this.isEditData = true :this.isEditData = false;
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
      if((<any>this.currentVehicleDetail).companyName){
        let matched= this.companyList.find(x=>x.companyName == (<any>this.currentVehicleDetail).companyName);
        if(matched){
          this.currentVehicleDetail.company = matched;
        }
      }
    
      if((<any>this.currentVehicleDetail).vehicleNumber){
        let vehicleMatched= this.vehicleList.find(x=>x.vehicleNumber == (<any>this.currentVehicleDetail).vehicleNumber);
        if(vehicleMatched){
          this.currentVehicleDetail.vehicle = vehicleMatched;
        }
      }
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


    /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
  */
    deleteDriver(value){
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
            this.userService.deleteDataFromDb(this.currentVehicleDetail.id,'deleteDriverByID').subscribe((data:any)=>{
              if(data.message){
                this.authService.successToast(data.message);
                this.router.navigate(['/user/driver']);
              }
            }, error => {
              this.authService.errorToast(error.error.error);
            })
          }
      });
    }

    getVehicleListByCompanyId(value){
      var companyId :any;
      if(value.id){
        companyId = value.id;
      }else{
        let matched = this.companyList.find(x=>x.companyName == value);
        if(matched){
          companyId =  matched.id;
        }
      }
      if(companyId){
        this.userService.getDataByUrl('showVehicleByCompanyId/'+companyId).subscribe((data:any)=>{
          if(data.length>0){
            this.vehicleList = data;
            this.vehicleCloneList = this.vehicleList;
          }else{
            this.authService.errorToast('Vehicle Not Found');
            this.vehicleList =[];
          }
         }, error => {
          this.authService.errorToast(error.error.error);
        })
      }
    }

    search(value: string, key) {
      if (key == 'company') {
        const companyList = this.companyCloneList.filter(item => item.companyName.toLowerCase().search(value.toLowerCase()) > -1);
        return this.companyList = companyList;
      } else {
        const vehicleList = this.vehicleCloneList.filter(item => item.vehicleNumber.toLowerCase().search(value.toLowerCase()) > -1);
        return this.vehicleList = vehicleList;
      }
    }
}
