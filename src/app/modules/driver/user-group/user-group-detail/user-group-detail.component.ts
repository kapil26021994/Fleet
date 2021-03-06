import { Component, OnInit,  ViewChild,ElementRef,ChangeDetectorRef  } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{UserGroupListModel} from 'src/app/core/models/driver/user-group-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { FormControl } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-group-detail',
  templateUrl: './user-group-detail.component.html',
  styleUrls: ['./user-group-detail.component.scss']
})
export class UserGroupDetailComponent implements OnInit {
  public currentGroupDetail =  new UserGroupListModel();
  public permissionList = ["Add","Edit","Delete"];
  public isEdit :boolean = false;
  public companyList = [];
  public data = [];
  public companyCloneList =[];
  public exporterInstance :any;
  selectedPermissionList = [];
  public pokemonControl:FormControl;
  public totalPermissionList=[];
  public isDefaultData : boolean =false;
  public isEditData:boolean = false;
  public selectedPermissionCloneList = [];
  public currentItemData = [];
  public modelGroup :any= [];
  @ViewChild('itemSelect') content: ElementRef;
  public isDefaultAPICall :boolean = false;
  constructor(
      public userService:UserService,
      public dataShare:DataSharingService,
      public dialog:MatDialog,
      public authService:AuthenticationService,
      public cdref: ChangeDetectorRef,
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
    this.getAllGroupList();
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    this.companyCloneList   = this.companyList;
    if(history.state.data){
      this.currentGroupDetail = history.state.data;
      this.isDefaultData = true
      this.data  = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data));
      this.permissionList= this.currentGroupDetail.addPermissions;
      this.currentGroupDetail.isActive == 'active' ? this.isEditData = true :this.isEditData = false;
    }else{
      this.currentGroupDetail = JSON.parse(localStorage.getItem('currentPageData'));
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
        this.currentGroupDetail.isActive='active';
      }else{
        this.currentGroupDetail.isActive='inActive';
      }

      //check company name in array...
      let matchedCompany = this.companyList.find(x=>x.companyName == this.currentGroupDetail.company.companyName);
      if(matchedCompany){
        this.currentGroupDetail.company = matchedCompany;
      }
      this.userService.updateData(this.currentGroupDetail ,'updateUserGroupInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/group/']);
        } else{
          this.authService.errorToast(data.message);
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }

   /*
      Author:Kapil Soni
      Funcion:optionSelected
      Summary:optionSelected for update driver info
      Return list
  */

      optionSelected(event,value,permission) {
        if(event.source._selected){
          let matched  =this.selectedPermissionList.find(x=>x.name == event.source.group.label);
          let matchedItem =  this.selectedPermissionList.find(x=>x.name == permission.name);
          if(matchedItem == undefined){
            this.currentItemData = [];
          }
          if(matched == undefined && matchedItem == undefined){
            let data = {
              "lable": value,
              "value": value
            };
            this.currentItemData.push(data);
            this.selectedPermissionList.push({
              'name':event.source.group.label,
              'items':this.currentItemData
            });
          }else{
            let index = this.selectedPermissionList.findIndex(x=>x.name == event.source.group.label);
            if(index != -1){
              let data = {
                "lable": value,
                "value": value
              };
              this.selectedPermissionList[index].name = event.source.group.label;
              this.selectedPermissionList[index].items.push(data);
            }
          }
        }else{
          let matched =this.selectedPermissionList.find(x=>x.name == event.source.group.label);
          let permssionIndex = this.selectedPermissionList.findIndex(x=>x.name == event.source.group.label);
          if(matched){
            let index = matched.items.findIndex(x=>x.value == value);
            matched.items.splice(index,1);
            if(matched.items.length == 0){
              this.selectedPermissionList.splice(permssionIndex,1);
            }
          }
    
          let matchedcloneData =this.selectedPermissionCloneList.find(x=>x.name == event.source.group.label);
          if(matchedcloneData){
            let data = {
              "lable": value,
              "value": value
            };
            let index = matchedcloneData.items.findIndex(x=>x.value == data.value);
            matchedcloneData.items.splice(index,1);
          }
        }
        delete (<any>this.currentGroupDetail).companyName;
        this.currentGroupDetail.addPermissions=this.selectedPermissionList;
      }
    

       /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
 
  getAllGroupList() {
    this.userService.getDataByUrl('showAllPermissionData').subscribe((data:any)=>{
      if(data){
        this.totalPermissionList = data;
        this.modelGroup = history.state.permission;
        this.defaultSelectedValue(this.content);
      }
    })
  }
  
    defaultSelectedValue(content) {
      let values: any[] = [];
      for(let group of this.totalPermissionList){
        for(let item of group.items){
          for(let modelData of this.modelGroup){
            for(let model_item of modelData.items){
              if(modelData.name == group.name && model_item.lable == item.lable){
                values.push(model_item.value);
              }
            }
          }
        }
      }
      // submit the array with all values
      content.update.emit(values);
      this.cdref.detectChanges();
    }

     /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    deletGroup(){
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
        if(confirmed && this.currentGroupDetail.id){
          this.userService.deleteDataFromDb(this.currentGroupDetail.id,'deleteUserGroupByID').subscribe((data:any)=>{
            if(data.message){
              this.router.navigate(['/user/group/']);
              this.authService.successToast(data.message);
            }
          },  error => {
              this.authService.errorToast(error.error.message);
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
