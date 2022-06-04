import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{UserManagmentAddModel} from 'src/app/core/models/driver/user-managment-add.model';
import{UserManagmentListModel} from 'src/app/core/models/driver/user-managment-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import{Router} from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import { match } from 'assert';

@Component({
  selector: 'app-user-managment',
  templateUrl: './user-managment.component.html',
  styleUrls: ['./user-managment.component.scss']
})
export class UserManagmentComponent implements OnInit {
  vehicleAddForm : FormGroup;
  displayedColumns: any[] = ['company','name','username','email','isActive','phoneNumber','groupName','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public groupAdd = new UserManagmentAddModel();
  public userList :any=  new UserManagmentListModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
public selectedPermission =[];
  checked = false;
  indeterminate = false;
  companyList= [];
  statusList :string[]=["active","inActive"];
  public permissionList = [];
  public groupList = [];
  public vehicleTypeList = [];
  public selectedPermissionList :any = [];
  public selectedPermissionCloneList = [];
  public currentItemData = [];
  public matchedPermissionList =[];
  positionFilter = new FormControl()
  public isResetFormError = false;
  public isLoadingPermission = false;
  filteredValues =  {username: '',isActive:[],email:'',name:'',phoneNumber:''};

 // form group
 filterForm = new FormGroup({
  username: new FormControl(),
  isActive: new FormControl(),
});

get username() {
  return this.filterForm.get('username');
}
get isActive() {
  return this.filterForm.get('isActive');
}

  constructor(public userService:UserService,
    public authService:AuthenticationService,
    public dialog:MatDialog,
    public router:Router,public dataShare  :DataSharingService) { }

  ngOnInit() {
    this.vehicleTypeList =  JSON.parse(localStorage.getItem('vehicleTypeList'));
    this.getAllUserList();
    //this.getAllGroupList();
    this.getAllCompanyData();
    this.getAllMultpleDataViaURL();

  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  toggleDialog(event) {
    if(event){
      event.preventDefault();
     }
    document.getElementById('addVehicle').classList.toggle('show-dailog');
    this.getAllCompanyData();
  }


  // getAllGroupList() {
  //   this.userService.getDataByUrl('showAllUserGroupData').subscribe((data:any)=>{
  //     if(data.length>0){
  //       this.groupList = data;
  //     }
  //   })
  // }


   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllUserList() {
    this.isLoading = true;
    this.userService.getDataByUrl('subUser/showAllSubUserData').subscribe((data:any)=>{
      if(data.length>0){
        this.userList = data;
        this.dataSource = new MatTableDataSource(<any>this.userList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       this.isLoading = false;
       this.groupAdd.isActive = true;

       //inistialze the fitlers
       this.formSubscribe();
       this.getFormsValue();
      } else{
        this.isLoading = false;
        (<any>this).userList= [];
      }
    },  error => {
      (<any>this).userList = [];
      this.isLoading = false;
      this.authService.errorToast(error.error.message);
    })
  }

     /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
   public companyCloneList =[];
    getAllCompanyData() {
      this.userService.getDataByUrl('company/showAllCompanyData').subscribe((data:any)=>{
        if(data.length>0){
          this.companyList = data;
          this.companyCloneList = this.companyList;
          this.groupAdd.company=this.companyList[0];
        } else{
          this.companyList= [];
        }
      },  error => {
        this.isLoadingData = false;
        this.authService.errorToast(error.error.message);
      })
    }

   /*
      Author:Kapil Soni
      Funcion:addVehicle
      Summary:addVehicle for save user..
      Return list
    */
    addVehicle(form:any){
      this.vehicleForm = form;
      this.submitted = true;
      if(form.form.valid) {
        this.isLoadingData = true;
        if(this.groupAdd.isActive){
          this.groupAdd.isActive='active';
        }else{
          this.groupAdd.isActive='inActive';
        }
        delete (<any>this.groupAdd).companyName;
        this.groupAdd.roles = [{"id": 1,"name": "USER"}];
        //delete (<any>this.groupAdd).groupName;
        
        this.userService.storeDataToDb(<any>this.groupAdd,'subUser/signup').subscribe((data:any)=>{
          if(data.message){
            this.isLoadingData = false;
            form.resetForm();
             form.reset();

             //dismiss dlalog and get all list
             this.toggleDialog('');
             this.getAllUserList();
          } else{
            this.authService.errorToast(data.message);
            this.isLoadingData = false;
          }
        },  error => {
          this.isLoadingData = false;
          this.authService.errorToast(error.error.message);
        })
      }
    }

    updateDataViaKey(value,key):void{
      if(value && key ==''){
        let data =  this.groupList.find(x=>x.groupName == value);
        this.groupAdd.assignGroup = data;
        this.isLoadingPermission = true;
        this.getPermissionListViaGroupId(data.id);
      }else{
        let companyData =  this.companyList.find(x=>x.companyName == value);
        this.groupAdd.company = companyData;
        //get groupList by company id
        if(this.groupAdd.company && this.groupAdd.company.id){
          this.userService.getDataByUrl('showUserGroupByCompanyId/'+this.groupAdd.company.id).subscribe((data:any)=>{
            if(data.length>0){
              this.groupList = data;
            }
          }, error => {
            this.authService.errorToast(error.message);
          })
        }
      }
    }

    checkPermisionExist(permission_value,lable){
     let matched  =  this.permissionList.find(x=>x.name == permission_value.name);
     if(matched){
        let valueMatched = matched.items.find(x=>x.value == lable.lable);
        if(valueMatched){
          return false
        }else{
          return true
        }
     }else{
      return false
     }
    }
    

 /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    resetData(){
     // this.getAllGroupList();
      if(this.vehicleForm){
        this.vehicleForm.reset();
       this.vehicleForm.resetForm();
      } 
    }

    isAllSelected() {
      const numSelected = this.selection.selected.length;
      if(this.dataSource){
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
      }
    }

    applyFilter(filterValue: string) {
      if(this.dataSource){
      this.dataSource.filter = filterValue.trim().toLowerCase();
        this.dataSource.filter = filterValue;   
      }
    }

     /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    deleteVehicle(value){
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
        if(confirmed && value.id){
          this.userService.deleteDataFromDb(value.id,'subUser/deleteBySubUserId').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              const index = this.dataSource.data.findIndex(x=>x.id == value.id);
              if(index != -1){
                this.dataSource.data.splice(index, 1);
                this.dataSource._updateChangeSubscription();
              }
            }
          },  error => {
            this.authService.errorToast(error.message);
          })
        }
      });
    }


    getCurrentVehicleDetail(detail:any,exporter){
      this.dataShare.updatedData.next(exporter); 
      this.router.navigate(['/user/management/detail'], <any>{state: {data: detail,groupList:this.groupList }});
    }

    formSubscribe() {
      this.username.valueChanges.subscribe((positionValue) => {
        this.filteredValues['username'] = positionValue;
        this.filteredValues['email'] = positionValue;
        this.filteredValues['phoneNumber'] = positionValue;
        this.filteredValues['name'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.isActive.valueChanges.subscribe((positionValue) => {
        this.filteredValues['isActive'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
            let searchString = JSON.parse(filter);
            let isStatusAvailable = false;
            if(searchString.isActive &&  searchString.isActive.length) {
              for (const d of searchString.isActive) {
                if (data.isActive === d.toLowerCase()) {
                  isStatusAvailable = true;
                }
              }
            } else {
              isStatusAvailable = true;
            }
            const resultValue = isStatusAvailable &&
              (data.username.toString().trim().toLowerCase().indexOf(searchString.username != null ? searchString.username.toLowerCase() : '') !== -1 ||
              data.email.toString().trim().toLowerCase().indexOf(searchString.email != null ? searchString.email.toLowerCase() : '') !== -1 ||
              (data.firstName != null ? data.firstName.toString().trim().toLowerCase().indexOf(searchString.name != null ? searchString.name.toLowerCase() : '') !== -1 : true) ||
              (data.lastName != null ? data.lastName.toString().trim().toLowerCase().indexOf(searchString.name != null ? searchString.name.toLowerCase() : '') !== -1 : true));
            return resultValue;
          };
          this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

        // Reset table filters 
  resetFilters() {
    this.getAllUserList();
    this.userService.resetFilter(this.filterForm);
  }

  //   /*
  //   Author:Kapil Soni
  //   Funcion:getAllMultpleDataViaURL
  //   Summary:getAllMultpleDataViaURL for get vehicle list
  //   Return list
  // */
  getAllMultpleDataViaURL() {
    this.userService.getMulipleAPIDataViaUrl('company/showAllCompanyData','showAllPermissionData','','').subscribe((data:any)=>{
      if(data[1].length > 0 && data[0].length > 0){
        this.permissionList = data[0];
      } 
    },  error => {
      this.authService.errorToast(error.error.message);
    })
  }

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
        let index = matched.items.findIndex(x=>x == value);
        matched.items.splice(index,1);
      }

      let matchedcloneData =this.selectedPermissionCloneList.find(x=>x.name == event.source.group.label);
      if(matchedcloneData){
        let data = {
          "lable": value,
          "value": value
        };
        let index = matchedcloneData.items.findIndex(x=>x == data.value);
        matchedcloneData.items.splice(index,1);
      }
    }
    //delete (<any>this.groupAdd).companyName;
    this.groupAdd.addPermissions=this.selectedPermissionList;
  }

     /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    getPermissionListViaGroupId(id) {
      this.getAllMultpleDataViaURL();
      var list =[];
      this.userService.getDataByUrl('showUserGroupById/'+id).subscribe((data:any)=>{
        if(data.addPermissions.length>0){
          list = this.permissionList.filter(entry1 => !data.addPermissions.some(entry2 => entry1.name === entry2.name));
          this.isLoadingPermission  = false;
          this.permissionList = list;
        }else{
          this.isLoadingPermission  = false;
          this.permissionList =[];
        }
      },  error => {
        this.isLoadingPermission  = false;
        this.authService.errorToast(error.error.message);
      })
    }


    search(value: string) { 
      let filter = value.toLowerCase();
     let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
      return this.companyList= list;
    }
}
