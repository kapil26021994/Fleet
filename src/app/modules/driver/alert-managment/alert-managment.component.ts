import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{AlertManagmentAddModel} from 'src/app/core/models/driver/alert-managment-add.model';
import{AlertManagmentListModel} from 'src/app/core/models/driver/alert-managment-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import{Router} from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-alert-managment',
  templateUrl: './alert-managment.component.html',
  styleUrls: ['./alert-managment.component.scss']
})
export class AlertManagmentComponent implements OnInit {
  vehicleAddForm : FormGroup;
  displayedColumns: any[] = ['company','vehicle','email','phoneNumber','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public alertAdd = new AlertManagmentAddModel();
  public userList :any=  new AlertManagmentListModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
public emailAlert = false;
public vehicleList : any= [];

  checked = false;
  indeterminate = false;
  companyList= [];
  statusList :string[]=["active","inActive"];
  public permissionList = ["Add","Edit","Delete"];
  public groupList = [];
  public vehicleTypeList = [];
positionFilter = new FormControl()
public isResetFormError = false;
filteredValues =  {company: '',isActive:[],email:'',vehicle:''};
public currentPageView :any = [];
public isAddPermission = false;

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
    if(JSON.parse(localStorage.getItem('user-data')).assignGroup != null){
      this.currentPageView =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions.filter(x=>x.name == 'Alert Management');
    }
    if(JSON.parse(localStorage.getItem('user-data')).assignGroup != null){
      this.currentPageView =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions.filter(x=>x.name == 'Alert Management');
    }
    if(this.currentPageView.length > 0 && this.currentPageView[0].items.length>0){
      this.isAddPermission = this.currentPageView[0].items.indexOf('insert') == -1;
    }
    this.getAllUserList();
    this.getDriverAndVehicleList();
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


  getAllGroupList() {
    this.userService.getDataByUrl('showAllUserGroupData').subscribe((data:any)=>{
      if(data.length>0){
        this.groupList = data;
      }
    })
  }


   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllUserList() {
    this.isLoading = true;
    this.userService.getDataByUrl('showAllAlertData').subscribe((data:any)=>{
      if(data.length>0){
        this.userList = data;
        this.dataSource = new MatTableDataSource(<any>this.userList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       this.isLoading = false;
       this.alertAdd.isActive = true;

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
    getAllCompanyData() {
      this.userService.getDataByUrl('company/showAllCompanyData').subscribe((data:any)=>{
        if(data.length>0){
          this.companyList = data;
          this.alertAdd.company=this.companyList[0];
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
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    addVehicle(form:any){
      this.vehicleForm = form;
      if(form.form.valid) {
        this.submitted = true;
        this.isLoadingData = true;
        if(this.alertAdd.isActive){
          this.alertAdd.isActive='active';
        }else{
          this.alertAdd.isActive='inActive';
        }
        this.userService.storeDataToDb(<any>this.alertAdd,'saveAlert').subscribe((data:any)=>{
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
        this.alertAdd.vehicle = data;
      }else{
        let companyData =  this.companyList.find(x=>x.companyName == value);
        this.alertAdd.company = companyData;
      }
    }

 /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    resetData(){
      this.getAllGroupList();
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
          this.userService.deleteDataFromDb(value.id,'deleteAlertByID').subscribe((data:any)=>{
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
      this.router.navigate(['/user/alert/detail'], <any>{state: {data: detail,vehicleList:this.vehicleList }});
    }

    formSubscribe() {
      this.username.valueChanges.subscribe((positionValue) => {
        this.filteredValues['email'] = positionValue;
        this.filteredValues['phoneNumber'] = positionValue;
        this.filteredValues['company'] = positionValue;
        this.filteredValues['vehicle'] = positionValue;
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
              data.email.toString().trim().toLowerCase().indexOf(searchString.email != null ? searchString.email.toLowerCase() : '') !== -1 ||
              data.phoneNumber.toString().trim().toLowerCase().indexOf(searchString.phoneNumber != null ? searchString.phoneNumber.toLowerCase() : '') !== -1 ||
              data.company.companyName.toString().trim().toLowerCase().indexOf(searchString.company != null ? searchString.company.toLowerCase() : '') !== -1 ||
              data.vehicle.vehicleNumber.toString().trim().toLowerCase().indexOf(searchString.vehicle != null ? searchString.vehicle.toLowerCase() : '') !== -1 ;
              return resultValue;
          };
          this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

        // Reset table filters
  resetFilters() {
    this.getAllUserList();
    this.userService.resetFilter(this.filterForm);
  }

    /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
    getDriverAndVehicleList() {
      this.userService.getMulipleAPIData().subscribe((data:any)=>{
        if(data.length>0){
          this.vehicleList = data[0];
          this.companyList = JSON.parse(localStorage.getItem('companyList'));
        } else{
          this.isLoading = false;
        }
      },  error => {
        this.isLoading = false;
        this.authService.errorToast(error.error.message);
      })
    }
}
