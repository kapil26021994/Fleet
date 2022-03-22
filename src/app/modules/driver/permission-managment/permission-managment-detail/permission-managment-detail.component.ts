import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{PermissionListModel} from 'src/app/core/models/driver/permission-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';

@Component({
  selector: 'app-permission-managment-detail',
  templateUrl: './permission-managment-detail.component.html',
  styleUrls: ['./permission-managment-detail.component.scss']
})
export class PermissioManagmentDetailComponent implements OnInit {
  public currentUserDetail =  new PermissionListModel();
  public permissionList = ["Add","Edit","Delete"];
  public isEdit :boolean = false;
  public companyList = [];
  public pageList =[];
  public vehicleList = [];
  public data =[];
  public selectedPermissionList = [];
  public isEditData:boolean = false;
  public exporterInstance :any;
  public idDataLoad : boolean = false;
  public isAddPermission : boolean = false;

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
    this.pageList =  JSON.parse(localStorage.getItem('pageList'));
    if(history.state.data){
      this.currentUserDetail = history.state.data;
      this.data  = [history.state.data];
      this.vehicleList = history.state.vehicleList;
      this.idDataLoad = true;
      this.selectedPermissionList= this.currentUserDetail.items;
      this.selectPermission(this.currentUserDetail.name);
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
      this.userService.updateData(this.currentUserDetail ,'updatePermissionInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/permission/']);
        } else{
          this.authService.errorToast(data.message);
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }


    addOrRemoveNewPermission(status,data){
      this.isAddPermission = true;
      if(status){
        this.selectedPermissionList.push({
          "lable": data,
          "value": data
        });
      }else{
       const index =  this.selectedPermissionList.findIndex(x=>x.value == data);
       this.selectedPermissionList.splice(index,1);
      }
      this.currentUserDetail.items=this.selectedPermissionList;
    }
  
    selectPermission(name){
      if(!this.idDataLoad){
        this.selectedPermissionList =[];
      }
      if(name != 'Map' && name != 'Dashboard'){
        this.permissionList = ['insert','update','view','delete'];
      }else if(name == 'Map'){
        this.permissionList = ['Dashboard','Vehicle History','Vehicle Live Location'];
      }else{
        this.permissionList = ['View'];
      }
    }

    checkPermissionAddedOrNot(value){
      if(this.selectedPermissionList.length>0){
        let matched =  this.selectedPermissionList.find(x=>x.value == value);
        if(matched){
          return true;
        } else{
         return false;
        }
      } else{
        return false;
      }
    }
}
