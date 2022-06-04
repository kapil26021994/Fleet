import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective ,FormControl,NgForm  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import{CompanyManagmentAddModel} from 'src/app/core/models/driver/company-managment-add.model';
import{CompanyManagmentListModel} from 'src/app/core/models/driver/company-managment-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{Router} from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import { HttpClient, HttpEventType } from '@angular/common/http';


declare var google;
@Component({
  selector: 'app-company-managment',
  templateUrl: './company-managment.component.html',
  styleUrls: ['./company-managment.component.scss']
})
export class CompanyManagmentComponent implements OnInit {
  vehicleAddForm : FormGroup;
  displayedColumns: any[] = ['companyEmail','companyName','companyContactNumber','TotalVehicles','TotalUsers','TotalTrackers','isActive','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public companyAddData = new CompanyManagmentAddModel();
  public userList :any=  new CompanyManagmentListModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
public isResetData = false;
@ViewChild('f', {static: false}) myForm: NgForm;
public imageFileObject :any;

  checked = false;
  indeterminate = false;
  companyList= [];
  statusList :string[]=["active","inActive"];
  public permissionList = ["Add","Edit","Delete"];
  public groupList = [];
  public vehicleTypeList = [];
positionFilter = new FormControl();
filteredValues =  {companyName: '',isActive:[],email:'',createDateTime:''};

 // form group
 filterForm = new FormGroup({
  companyName: new FormControl(),
  isActive: new FormControl(),
});

get companyName() {
  return this.filterForm.get('companyName');
}
get isActive() {
  return this.filterForm.get('isActive');
}

  constructor(
    public dataShare : DataSharingService,
    public dialog:MatDialog,
    public userService:UserService,
    public formDirective: FormGroupDirective,
    public httpClient:HttpClient,
    public authService:AuthenticationService,public router:Router) { }

  ngOnInit() {
    this.vehicleTypeList =  JSON.parse(localStorage.getItem('vehicleTypeList'));
    this.getAllUserList();
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
     (<any>this.companyAddData).isActive= true;
    document.getElementById('addVehicle').classList.toggle('show-dailog');
  }


   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllUserList() {
    this.isLoading = true;
    this.userService.getDataByUrl('company/showAllCompanyData').subscribe((data:any)=>{
      if(data.length>0){
        this.userList = data;
        localStorage.setItem('companyList',JSON.stringify( this.userList));
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
      if(form.form.valid){
        this.submitted = true;
        this.isLoadingData = true;
        if(this.companyAddData.isActive){
          this.companyAddData.isActive='active';
        }else{
          this.companyAddData.isActive='inActive';
        }
       this.userService.storeDataToDb(<any>this.companyAddData,'company/saveCompany').subscribe((data:any)=>{
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
        //this.groupAdd.assignGroup = data;
        delete (<any>this.companyAddData).groupName;
      }else{
        let companyData =  this.companyList.find(x=>x.companyName == value);
        //this.groupAdd.company = companyData;
      }
    }

 /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    resetData(){
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
        if(confirmed&& value.id) {
          this.userService.deleteDataFromDb(value.id,'company/deleteCompanyByID').subscribe((data:any)=>{
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
      this.router.navigate(['/user/company/detail'], <any>{state: {data: detail,groupList:this.groupList}});
    }

    formSubscribe() {
      this.companyName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['email'] = positionValue;
        this.filteredValues['phoneNumber'] = positionValue;
        this.filteredValues['companyName'] = positionValue;
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
            if (data.isActive === d) {
              isStatusAvailable = true;
            }
          }
        } else {
          isStatusAvailable = true;
        }
        const resultValue = isStatusAvailable &&
        (data.companyEmail.toString().trim().toLowerCase().indexOf(searchString.email != null ? searchString.email.toLowerCase() : '') !== -1 ||
        data.companyName.toString().trim().toLowerCase().indexOf(searchString.companyName != null ? searchString.companyName.toLowerCase() : '') !== -1 ||
        data.companyContactNumber.toString().trim().toLowerCase().indexOf(searchString.phoneNumber != null ? searchString.phoneNumber.toLowerCase() : '') !== -1);
      return resultValue;
      };
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    }

        // Reset table filters
  resetFilters() {
    this.getAllUserList();
    this.userService.resetFilter(this.filterForm);
  }


  getStateAndCountryName(){
    var self = this;
    var  autocomplete = new google.maps.places.Autocomplete((document.getElementById('companyAutocomplete')),{ types: ['geocode'] });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        const place = autocomplete.getPlace().address_components;
        self.companyAddData.state= place[2].short_name;
        self.companyAddData.country = place[3].long_name;
        self.companyAddData.city = autocomplete.getPlace().formatted_address;
      });
    }

  //   let imageLogo= <any>document.getElementById('company-logo');
  //   let imageLogoSrc= <any>document.getElementById('company-logo-src')
  //   imageLogo.onchange = evt => {
  //     const [file] = imageLogo.files;
  //     this.imageFileObject = [file];
  //     this.companyAddData.image = this.imageFileObject[0];
  //     console.log(this.imageFileObject);
  //     if (file) {
  //       imageLogoSrc.src = <any>URL.createObjectURL(file)
  //     }
  //     this.userService.uploadImageToDb(this.imageFileObject[0],'image/uploadImage').subscribe((image:any)=>{
  //       if(image){
  //         console.log('image'+image);
  //       }
  //     })
  //   }
  // }
}
