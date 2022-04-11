import { Component, OnInit,ElementRef ,ViewChild,ChangeDetectorRef} from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{UserManagmentListModel} from 'src/app/core/models/driver/user-managment-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-user-managment-detail',
  templateUrl: './user-managment-detail.component.html',
  styleUrls: ['./user-managment-detail.component.scss']
})
export class UserManagmentDetailComponent implements OnInit {
  public currentUserDetail =  new UserManagmentListModel();
  public permissionList = [];
  public isEdit :boolean = false;
  public companyList = [];
  public groupList = [];
  public data =[];
  public isEditData:boolean = false;
  public exporterInstance :any;
  @ViewChild('itemSelectPermission') contentRef: ElementRef;
  public isLoadingPermission = false;
  public modelGroup =[];
  public currentItemData =[];
  public selectedPermissionCloneList =[];
  public selectedPermissionList =[];
  public isUpdatePermission = false;
  public totalPermissionList =[];
  public isDefaultDataLoad = false;
  constructor(
      public userService:UserService,
      public authService:AuthenticationService,
      public dataShare:DataSharingService,
      public router :Router,
      public dialog:MatDialog,
      public changeDetectorRef :ChangeDetectorRef) { 
      }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

  ngOnInit(): void {
   var list =[];
   this.isDefaultDataLoad = true;
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    if(history.state.data){
      this.currentUserDetail = history.state.data;
      this.currentUserDetail.groupName=this.currentUserDetail.assignGroup.groupName
      this.modelGroup = this.currentUserDetail.addPermissions;
      this.data  = [history.state.data];
      this.groupList = history.state.groupList;
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
     
      this.currentUserDetail.isActive == 'active' ? this.isEditData = true :this.isEditData = false;
    }else{
      this.currentUserDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  ngAfterViewInit(){
    this.getAllMultpleDataViaURL();
    //this.getPermissionListViaGroupId(this.currentUserDetail.assignGroup.id);
  }

  getAllMultpleDataViaURL() {
    var list =[];
    this.userService.getMulipleAPIDataViaUrl('company/showAllCompanyData','showAllPermissionData','','').subscribe((data:any)=>{
      if(data[1].length > 0 && data[0].length > 0){
        this.totalPermissionList = data[0];

        //execute only initially....otherwise return whole list..
        if(!this.isUpdatePermission){
          this.currentUserDetail.assignGroup.addPermissions.forEach(group_permission => {
            let index = this.totalPermissionList.findIndex(x=>x.name == group_permission.name);
            if(index != -1){
              this.totalPermissionList.splice(index,1);
            }
          });
          this.defaultSelectedValue(this.contentRef);
        }
       
      } 
    },  error => {
    })
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
      this.userService.updateData(this.currentUserDetail ,'subUser/updatesubUserInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/management/']);
        } else{
          this.authService.errorToast(data.message);
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }

    
//   /*
//   Author:Kapil Soni
//   Funcion:getPermissionListViaGroupId
//   Summary:getPermissionListViaGroupId for get vehicle list
//   Return list
// */
  getPermissionListViaGroupId(id) {
    var list =[];
    this.userService.getDataByUrl('showUserGroupById/'+id).subscribe((data:any)=>{
      if(data.addPermissions.length>0){
        //this.permissionList = data.addPermissions;
        
        this.modelGroup = this.totalPermissionList.filter(entry1 => !data.addPermissions.some(entry2 => entry1.name === entry2.name));
        data.addPermissions.forEach(group_permission => {
          let index = this.totalPermissionList.findIndex(x=>x.name == group_permission.name);
          if(index != -1){
            this.totalPermissionList.splice(index,1);
          }
        });
        this.isLoadingPermission  = false;
       this.defaultSelectedValue(this.contentRef);
      }else{
        this.isLoadingPermission  = false;
        this.permissionList =[];
      }
    },  error => {
      this.isLoadingPermission  = false;
      this.authService.errorToast(error.error.message);
    })
  }

  defaultSelectedValue(content) {
    let values: any[] = [];
    for(let group of this.totalPermissionList){
      for(let item of group.items){
        for(let modelData of this.modelGroup){
          for(let model_item of modelData.items){
            for(let additional_pemission of this.currentUserDetail.addPermissions){
              for(let additional_pemission_item of additional_pemission.items){
                if(group.name  == modelData.name && modelData.name == additional_pemission.name && additional_pemission_item.value == model_item.value && item.value == model_item.value){
                  values.push(item.value);
                }
              }
            }
          }
        }
      }
    }
    // submit the array with all values
    (<any>this.contentRef).update.emit(values)
    this.changeDetectorRef.detectChanges();
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
        if(matched){
          let index = matched.items.findIndex(x=>x.value == value);
          matched.items.splice(index,1);
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
      delete (<any>this.currentUserDetail).companyName;
      this.currentUserDetail.addPermissions=this.selectedPermissionList;
  }

    updateDataViaKey(value){
      this.totalPermissionList =[];
      this.isUpdatePermission = true;
      this.getAllMultpleDataViaURL();
      let matched  = this.groupList.find(x=>x.groupName == value);
      if(matched){
        this.currentUserDetail.assignGroup = matched;
        this.getPermissionListViaGroupId(matched.id);
      }
    }

         /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    delete(){
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
          this.userService.deleteDataFromDb(this.currentUserDetail.id,'subUser/deleteBySubUserId').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              this.router.navigate(['/user/management/']);
            }
          },  error => {
            this.authService.errorToast(error.message);
          })
        }
      });
    }
}
