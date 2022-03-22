import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{PermissionAddModel} from 'src/app/core/models/driver/permission.add.model';
import{PermissionListModel} from 'src/app/core/models/driver/permission-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import{Router} from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-permission-managment',
  templateUrl: './permission-managment.component.html',
  styleUrls: ['./permission-managment.component.scss']
})
export class PermissionManagmentComponent implements OnInit {
  vehicleAddForm : FormGroup;
  displayedColumns: any[] = ['page','item','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public permissionAdd = new PermissionAddModel();
  public userList :any=  new PermissionListModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
public emailAlert = false;
public vehicleList : any= [];
public selectedPermissionList :any =[];
public newPermissionList :any =[];
public permissionName :any;

  checked = false;
  indeterminate = false;
  companyList= [];
  statusList :string[]=["active","inActive"];
  public permissionList = [];
  public groupList = [];
  public vehicleTypeList = [];
positionFilter = new FormControl()
public isResetFormError = false;
public 
filteredValues =  {item: '',page:''};
public pageList :any  = [];

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
    this.pageList =  JSON.parse(localStorage.getItem('pageList'));
    this.getAllUserList();
  }

  toggleDialog(event) {
    this.selectedPermissionList =[];
    if(event){
      event.preventDefault();
     }
    document.getElementById('permission-managment').classList.toggle('show-dailog');
  }

   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllUserList() {
    this.isLoading = true;
    this.userService.getDataByUrl('showAllPermissionData').subscribe((data:any)=>{
      if(data.length>0){
        this.userList = data;
        this.dataSource = new MatTableDataSource(<any>this.userList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       this.isLoading = false;

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
    addVehicle(form:any){
      this.vehicleForm = form;
      if(form.form.valid) {
        this.submitted = true;
        this.isLoadingData = true;
        this.userService.storeDataToDb(<any>this.permissionAdd,'savePermission').subscribe((data:any)=>{
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
      if(value && key == 'vehicle'){
        let data =  this.vehicleList.find(x=>x.vehicleNumber == value);
      }else{
        let companyData =  this.companyList.find(x=>x.companyName == value);
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
            ok: 'Save',
            cancel: 'No',
          },
        },
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if(confirmed && value.id){
          this.userService.deleteDataFromDb(value.id,'deletePermissionByID').subscribe((data:any)=>{
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
      this.router.navigate(['/user/permission/detail'], <any>{state: {data: detail,vehicleList:this.vehicleList }});
    }

    formSubscribe() {
      this.username.valueChanges.subscribe((positionValue) => {
        this.filteredValues['page'] = positionValue;
        this.filteredValues['item'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      // this.isActive.valueChanges.subscribe((positionValue) => {
      //   this.filteredValues['isActive'] = positionValue;
      //   this.dataSource.filter = JSON.stringify(this.filteredValues);
      // });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
            let searchString = JSON.parse(filter);
            let isStatusAvailable = false;
            // if(searchString.isActive &&  searchString.isActive.length) {
            //   for (const d of searchString.isActive) {
            //     if (data.isActive === d.toLowerCase()) {
            //       isStatusAvailable = true;
            //     }
            //   }
            // } else {
            //   isStatusAvailable = true;
            // }
            const resultValue =
              data.name.toString().trim().toLowerCase().indexOf(searchString.page != null ? searchString.page.toLowerCase() : '') !== -1;
              return resultValue;
          };
          this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

        // Reset table filters
  resetFilters() {
    this.getAllUserList();
    this.userService.resetFilter(this.filterForm);
  }

  addOrRemoveNewPermission(status,data){
    if(status){
      this.selectedPermissionList.push({
        "lable": data,
        "value": data
      });
    }else{
     const index =  this.selectedPermissionList.findIndex(x=>x.value == data);
     this.selectedPermissionList.splice(index,1);
    }
    this.permissionAdd.items=this.selectedPermissionList;
  }


  selectPermission(name){
    this.selectedPermissionList =[];
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
