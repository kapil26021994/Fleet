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
  public data = [];
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
              this.authService.errorToast(error.error.message);
            })
          }
      });
    }
}
