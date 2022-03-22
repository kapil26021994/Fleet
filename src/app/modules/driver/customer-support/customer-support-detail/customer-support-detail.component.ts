import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{CustomerSupportListModel} from 'src/app/core/models/driver/customer-support-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';

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

  constructor(
      public userService:UserService,
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
    if(history.state.data){
      this.currentUserDetail = history.state.data;
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
      }
    }
}
