import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{CompanyManagmentListModel} from 'src/app/core/models/driver/company-managment-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

declare var google;
@Component({
  selector: 'app-company-managment-detail',
  templateUrl: './company-managment-detail.component.html',
  styleUrls: ['./company-managment-detail.component.scss']
})
export class CompanyManagmentDetailComponent implements OnInit {
  public currentUserDetail =  new CompanyManagmentListModel();
  public permissionList = ["Add","Edit","Delete"];
  public isEdit :boolean = false;
  public companyList = [];
  public groupList = [];
  public data = [];
  public exporterInstance :any;
  public isEditData:boolean = false;

  constructor(
      public userService:UserService,
      public dialog:MatDialog,
      public authService:AuthenticationService,
      public router :Router,
      public dataShare:DataSharingService) { 
      }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

  ngOnInit(): void {
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    if(history.state.data){
      this.currentUserDetail = history.state.data;
      this.data = [history.state.data];
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
      if(this.isEditData){
        this.currentUserDetail.isActive='active';
      }else{
        this.currentUserDetail.isActive='inActive';
      }
      this.userService.updateData(this.currentUserDetail ,'company/updateCompanyInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/company/']);
        } else{
          this.authService.errorToast(data.message);
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }


  getStateAndCountryName(){
    var self = this;
    var  autocomplete = new google.maps.places.Autocomplete((document.getElementById('companyDetailAutocomplete')),{ types: ['geocode'] });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        const place = autocomplete.getPlace().address_components;
        self.currentUserDetail.state= place[2].short_name;
        self.currentUserDetail.country = place[3].long_name;
      });
    }

    /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    deleteCompany(value){
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
        if(confirmed&& this.currentUserDetail.id) {
          this.userService.deleteDataFromDb(this.currentUserDetail.id,'company/deleteCompanyByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              this.router.navigate(['/user/company/']);
            }
          },  error => {
            this.authService.errorToast(error.message);
          })
        }
      });
    }
}
