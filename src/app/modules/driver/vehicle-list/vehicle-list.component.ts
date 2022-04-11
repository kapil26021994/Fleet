import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{VehicleAdd} from 'src/app/core/models/driver/vehicle-add.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
 import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
})
export class VehiclelistComponent implements OnInit {
  vehicleAddForm : FormGroup;
  displayedColumns: any[] = ['companyName','vehicleNumber','vehicleType','vehicleDate','insurance','puc','service_period','last_date','isActive','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public vehicleList = [];
  public companyList  = [];
  public submitted :boolean = false;
  public vehicleData = new VehicleAdd();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
public deviceList =[];

  checked = false;
  indeterminate = false;
  fuelTypeList= [];
  statusList :string[]=["active","inActive"];

  vehicleNumberList = [];
  public vehicleTypeList = [];
  public pageList :any =[];
  public vehicleTypeCloneList =[];
  public currentPageView  :any =[];
positionFilter = new FormControl();
public isAddPermission : boolean =   false;
filteredValues =  {insuranceRenewalDate:'',pucRenewalDate:'',servicingPeriod:'',lastServicingDate:'',companyName: '',vehicleNumber:[],vNumber:'',vType:'', isActive:[],companyDomain: '',vehicleType:[]};

 // form group
 filterForm = new FormGroup({
  vehicleType: new FormControl(),
  vehicleNumber: new FormControl(),
  isActive: new FormControl(),
  companyName: new FormControl()
});

get vehicleType() {
  return this.filterForm.get('vehicleType');
}

get vehicleNumber() {
  return this.filterForm.get('vehicleNumber');
}
get isActive() {
  return this.filterForm.get('isActive');
}
get companyName() {
  return this.filterForm.get('companyName');
}

  constructor(public userService:UserService,
    public dialog:MatDialog,
    public dataShare:DataSharingService,
    public authService:AuthenticationService,public router:Router) { }

  ngOnInit() {
    if(JSON.parse(localStorage.getItem('user-data')).assignGroup != null){
      this.currentPageView =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions.filter(x=>x.name == 'Vehicles');
    }
    if(JSON.parse(localStorage.getItem('user-data')).assignGroup != null){
      this.currentPageView =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions.filter(x=>x.name == 'Vehicles');
    }
    if(this.currentPageView.length > 0 && this.currentPageView[0].items.length>0){
      this.isAddPermission = this.currentPageView[0].items.indexOf('insert') == -1;
    }
    
    this.vehicleTypeList =  JSON.parse(localStorage.getItem('vehicleTypeList'));
    this.vehicleTypeCloneList = this.vehicleTypeList;
    this.fuelTypeList =  JSON.parse(localStorage.getItem('fuelTypeList'));
    this.getAllVehicleList();
    this.getAllDeviceList();
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

   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllVehicleList() {
    this.isLoading = true;
    this.userService.getDataByUrl('showAllVehicleData').subscribe((data:any)=>{
      if(data.length>0){
        this.vehicleList = data;
        this.dataSource = new MatTableDataSource(this.vehicleList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
       this.vehicleNumberList = this.dataSource.filteredData.map(x=>x.vehicleNumber);
       this.isLoading = false;

       //inistialze the fitlers
       this.formSubscribe();
       this.getFormsValue();
      } else{
        this.isLoading = false;
        this.vehicleList= [];
      }
    },  error => {
      this.vehicleList = [];
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
        } else{
          this.companyList= [];
        }
      },  error => {
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
        if(this.vehicleData.isActive){
          this.vehicleData.isActive='active';
        }else{
          this.vehicleData.isActive='inActive';
        }

        let data =  this.deviceList.find(x=>x.deviceType == this.vehicleData.deviceType);
        if(data){
          this.vehicleData.device = data;
        }
        
        this.userService.storeDataToDb(<any>this.vehicleData,'saveVehicle').subscribe((data:any)=>{
          if(data.message){
            this.isLoadingData = false;
            form.resetForm();
             form.reset();

             //dismiss dlalog and get all list
             this.toggleDialog('');
             this.getAllVehicleList();
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
      if(value && key == 'company'){
        let data =  this.companyList.find(x=>x.companyName == value);
        this.vehicleData.company = data;
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
      this.getAllVehicleList();
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
          this.userService.deleteDataFromDb(value.id,'deleteVehicleByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              const index = this.dataSource.data.indexOf(value.id);
              this.dataSource.data.splice(index, 1);
              this.dataSource._updateChangeSubscription();
            }
          }, error => {
              this.isLoadingData = false;
              this.authService.errorToast(error.error.message);
          })
        }
      });
    }

    getCurrentVehicleDetail(detail:any,exporter){
      this.dataShare.updatedData.next(exporter);
      this.router.navigate(['/user/vehicle/detail'], <any>{state: {data: detail}});
    }

    getCurrentVehcleRoute(detail:any){
      this.router.navigate(['/user/vehicle/location'], <any>{state: {data: detail}});
    }

    formSubscribe() {
      this.vehicleType.valueChanges.subscribe((positionValue) => {
        this.filteredValues['vehicleType'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      // this.vehicleNumber.valueChanges.subscribe((positionValue) => {
      //   this.filteredValues['vehicleNumber'] = positionValue;
      //   this.dataSource.filter = JSON.stringify(this.filteredValues);
      // });
      this.isActive.valueChanges.subscribe((positionValue) => {
        this.filteredValues['isActive'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.companyName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['companyName'] = positionValue;
        this.filteredValues['vNumber'] = positionValue;
        this.filteredValues['vType'] = positionValue;
        this.filteredValues['insuranceRenewalDate'] = positionValue;
        this.filteredValues['pucRenewalDate'] = positionValue;
        this.filteredValues['servicingPeriod'] = positionValue;
        this.filteredValues['lastServicingDate'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
            let searchString = JSON.parse(filter);
            let isPositionAvailable = false;
            let isVehicleNumberAvailable = false;
            let isStatusAvailable = false;
            if (searchString.vehicleType &&  searchString.vehicleType.length) {
              for (const d of searchString.vehicleType) {
                if (data.vehicleType.trim() === d) {
                  isPositionAvailable = true;
                }
              }
            } else {
              isPositionAvailable = true;
            }
            let finalStatus = false;
            if (searchString.vehicleNumber && searchString.vehicleNumber.length) {
              for (const d of searchString.vehicleNumber) {
              
                if (data.vehicleNumber.trim() === d) {
                  isVehicleNumberAvailable = true;
                }
              }
            } else {
              isVehicleNumberAvailable = true;
            }
            if (searchString.isActive &&  searchString.isActive.length) {
              for (const d of searchString.isActive) {
                if (data.isActive === d) {
                  isStatusAvailable = true;
                }
              }
            } else {
              isStatusAvailable = true;
            }
            const resultValue =
              isPositionAvailable && isVehicleNumberAvailable && isStatusAvailable &&
              (data.company.companyName.toString().trim().toLowerCase().indexOf(searchString.companyName != null ? searchString.companyName.toLowerCase() : '') !== -1 ||
              data.vehicleNumber.toString().trim().toLowerCase().indexOf(searchString.vNumber != null ? searchString.vNumber.toLowerCase() : '') !== -1 ||
              data.vehicleType.toString().trim().toLowerCase().indexOf(searchString.vType != null ? searchString.vType.toLowerCase() : '') !== -1 ||
              data.insuranceRenewalDate.toString().trim().toLowerCase().indexOf(searchString.insuranceRenewalDate != null ? searchString.insuranceRenewalDate.toLowerCase() : '') !== -1 ||
              data.pucRenewalDate.toString().trim().toLowerCase().indexOf(searchString.pucRenewalDate != null ? searchString.pucRenewalDate.toLowerCase() : '') !== -1 ||
              data.servicingPeriod.toString().trim().toLowerCase().indexOf(searchString.servicingPeriod != null ? searchString.servicingPeriod.toLowerCase() : '') !== -1 ||
              data.lastServicingDate.toString().trim().toLowerCase().indexOf(searchString.lastServicingDate != null ? searchString.lastServicingDate.toLowerCase() : '') !== -1);
            return resultValue;
          };
          this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

        // Reset table filters
  resetFilters() {
    this.getAllVehicleList();
    this.userService.resetFilter(this.filterForm);
  }

  /*
      Author:Kapil Soni
      Funcion:getAllVehicleList
      Summary:getAllVehicleList for get vehicle list
      Return list
    */
      getAllDeviceList() {
        this.isLoading = true;
        this.userService.getDataByUrl('showAllUnusedDeviceData').subscribe((data:any)=>{
          if(data.length>0){
            this.deviceList = data;
          }
        })
      }


    search(value: string) { 
      let filter = value.toLowerCase();
     let list = this.vehicleTypeCloneList.filter(option => option.vehicleType.toLowerCase().startsWith(filter));
      return this.vehicleTypeList= list;
    }
}
