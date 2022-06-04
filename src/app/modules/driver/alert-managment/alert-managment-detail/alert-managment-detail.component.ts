import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{UserManagmentListModel} from 'src/app/core/models/driver/user-managment-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-alert-managment-detail',
  templateUrl: './alert-managment-detail.component.html',
  styleUrls: ['./alert-managment-detail.component.scss']
})
export class AlertManagmentDetailComponent implements OnInit {
  public currentUserDetail =  new UserManagmentListModel();
  public permissionList = ["Add","Edit","Delete"];
  public isEdit :boolean = false;
  public companyList = [];
  public vehicleList = [];
  public data =[];
  public isEditData:boolean = false;
  public companyCloneList =[];
  public exporterInstance :any;

  constructor(
      public userService:UserService,
      public dialog:MatDialog,
      public authService:AuthenticationService,
      public dataShare:DataSharingService,
      public router :Router) { 
        this.dataShare.updatedData.subscribe((res: any) => { 
          if(res){ 
            this.exporterInstance = res;
          }
        }) 
      }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

  ngOnInit(): void {
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    this.companyCloneList = this.companyList;
    if(history.state.data){
      this.currentUserDetail = history.state.data;
      this.updateCompany(this.currentUserDetail.company.companyName);
      this.data  = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
      this.currentUserDetail.isActive == 'active' ? this.isEditData = true :this.isEditData = false;
    }else{
      this.currentUserDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

      /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for update driver info
    Return list
  */
    updateGroupInfo() {
      this.userService.updateData(this.currentUserDetail ,'updateAlertInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/alert/']);
        } else{
          this.authService.errorToast(data.message);
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }

      /*
      Author:Kapil Soni
      Funcion:deleteAlert
      Summary:deleteAlert for get delete vehicle
      Return list
    */
    deleteAlert(value){
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
        if(confirmed && this.currentUserDetail.id){
          this.userService.deleteDataFromDb(this.currentUserDetail.id,'deleteAlertByID').subscribe((data:any)=>{
            if(data.message){
              this.router.navigate(['/user/alert/']);
            }
          },  error => {
            this.authService.errorToast(error.message);
          })
        }
      });
    }


    updateCompany(value){
      let matched = this.companyList.find(x=>x.companyName == value);
      if(matched){
        this.userService.getDataByUrl('showVehicleByCompanyId/'+matched.id).subscribe((data:any)=>{
          if(data.length>0){
            this.vehicleList = data;
          }
        },  error => {
          this.authService.errorToast(error.message);
        })
      }
    }

    search(value: string) { 
      let filter = value.toLowerCase();
     let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
      return this.companyList= list;
    }
}
