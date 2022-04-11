import { Component, OnInit } from '@angular/core';
import{DeviceManagmentListModel} from 'src/app/core/models/driver/device-managment-list.model';
import{UserService} from 'src/app/core/services/user/user.service'
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router} from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';

@Component({
  selector: 'app-device-managment-detail',
  templateUrl: './device-managment-detail.component.html',
  styleUrls: ['./device-managment-detail.component.scss']
})
export class DeviceManagmentDetailComponent implements OnInit {

  public currentDeviceDetail = new DeviceManagmentListModel();
  public isEdit :boolean = false;
  public exporterInstance:any;
  public data = [];
  constructor(
    public userService :UserService,
    public dataShare : DataSharingService,
    public dialog:MatDialog,
    public auth:AuthenticationService,public router:Router) { 
    this.dataShare.updatedData.subscribe((res: any) => { 
      if(res){ 
        this.exporterInstance = res;
      }
    })  
  }

  ngOnInit(): void {
    if(history.state.data){
      this.currentDeviceDetail = history.state.data;
      this.data = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      this.currentDeviceDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

      /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for update driver info
    Return list
  */  
    updateDriverInfo() {
      this.userService.updateData(this.currentDeviceDetail ,'updateDeviceInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.auth.successToast(data.message);
          this.router.navigate(['/user/device/']);
        } 
      },  error => {
        this.auth.errorToast(error.error.message);
      })
    }

    toggleEditForm() {
      this.isEdit = this.isEdit?false:true;
    }

    
      /*
      Author:Kapil Soni
      Funcion:deleteDriver
      Summary:deleteDriver for get delete driver
      Return list
    */
    deleteDevice(value){
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
        if(confirmed && this.currentDeviceDetail.id){
          this.userService.deleteDataFromDb(this.currentDeviceDetail.id,'deleteDeviceByID').subscribe((data:any)=>{
            if(data.message){
              this.router.navigate(['/user/device/']);
              this.auth.successToast(data.message);
            }
          }, error => {
            this.auth.errorToast(error.error.message);
          })
        }
      });
    }
}
