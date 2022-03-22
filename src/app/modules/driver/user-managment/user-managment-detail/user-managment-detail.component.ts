import { Component, OnInit,ElementRef ,ViewChild,ChangeDetectorRef} from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{UserManagmentListModel} from 'src/app/core/models/driver/user-managment-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';

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
  constructor(
      public userService:UserService,
      public authService:AuthenticationService,
      public dataShare:DataSharingService,
      public router :Router,
      public changeDetectorRef :ChangeDetectorRef) { 
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
    this.getPermissionListViaGroupId(this.currentUserDetail.assignGroup.id);
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

    
  /*
  Author:Kapil Soni
  Funcion:getPermissionListViaGroupId
  Summary:getPermissionListViaGroupId for get vehicle list
  Return list
*/
  getPermissionListViaGroupId(id) {
    this.userService.getDataByUrl('showUserGroupById/'+id).subscribe((data:any)=>{
      if(data.addPermissions.length>0){
        this.permissionList = data.addPermissions;
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
    for(let group of this.permissionList){
      for(let item of group.items){
        for(let modelData of this.modelGroup){
          for(let model_item of modelData.items){
              values.push(item.value);
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
}
