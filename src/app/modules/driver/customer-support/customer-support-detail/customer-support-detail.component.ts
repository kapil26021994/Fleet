import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{CustomerSupportListModel} from 'src/app/core/models/driver/customer-support-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-customer-support-detail',
  templateUrl: './customer-support-detail.component.html',
  styleUrls: ['./customer-support-detail.component.scss']
})
export class CustomerSupportDetailComponent implements OnInit {
  public currentUserDetail =  new CustomerSupportListModel();
  public permissionList = ["Add","Edit","Delete"];
  public isEdit :boolean = false;
  public companyList = [];
  public userList = [];
  public data =[];
  public isEditData:boolean = false;
  public exporterInstance :any;
  public username :any;
  public companyCloneList =[];

  constructor(
      public userService:UserService,
      public authService:AuthenticationService,
      public dataShare:DataSharingService,
      public dialog:MatDialog,
      public router :Router) { 
      }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

  ngOnInit(): void {
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    this.companyCloneList = this.companyList;
    if(history.state.data){
      this.currentUserDetail = history.state.data;
      this.updateDataViaKey(this.currentUserDetail.company.companyName,'');
      this.data  = [history.state.data];
      this.userList = history.state.userList;
      this.username = (<any>this.currentUserDetail.user).username;
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
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
      this.userService.updateData(this.currentUserDetail ,'updateRaiseTicketInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/customer-support/']);
        } else{
          this.authService.errorToast(data.message);
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }

    updateDataViaKey(value,key):void{
      if(value && key == 'user'){
        let data =  this.userList.find(x=>x.username == value);
        this.currentUserDetail.user = data;
      }else{
        let companyData =  this.companyList.find(x=>x.companyName == value);
        this.currentUserDetail.company = companyData;

        //get subuser List by company-d
        if(this.currentUserDetail.company.id){
          this.userService.getDataByUrl('subUser/showSubUserByCompanyId/'+this.currentUserDetail.company.id).subscribe((data:any)=>{
            if(data.length>0){
              this.userList = data;
            }else{
              this.userList =[];
            }
          },  error => {
            this.authService.errorToast(error.message);
          })
        }
      }
    }

          /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    deleteTicket(){
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
          this.userService.deleteDataFromDb(this.currentUserDetail.id,'deleteRaiseTicketByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              this.router.navigate(['/user/customer-support/']);
            }
          },  error => {
            this.authService.errorToast(error.message);
          })
        }
      });
    }

    search(value: string) { 
      let filter = value.toLowerCase();
     let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
      return this.companyList= list;
    }

}
