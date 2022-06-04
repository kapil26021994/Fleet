import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{DeviceManagmentAddModel} from 'src/app/core/models/driver/device-managment-add.model';
import{DeviceManagmentListModel} from 'src/app/core/models/driver/device-managment-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import { FormControl } from '@angular/forms';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-device-managment.component',
  templateUrl: './device-managment.component.html',
  styleUrls: ['./device-managment.component.scss']
})
export class DeviceManagmentComponent implements OnInit {

  displayedColumns: any[] = ['deviceName','deviceImei','callingNumber','deviceType','issueDate','activationDate','isActive','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public submitted :boolean = false;
  public deviceManagmentList :any=  new DeviceManagmentListModel();
  public deviceManagmentAddModel :any=  new DeviceManagmentAddModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
  public isLoading = false;
  public driverForm  :any;
  public simCardList = [];
  public deviceTypeList = [];
  public companyList = [];
  public selectedSimCard :any;
  statusList :string[]=["active","inActive"];
  public simCardCloneList =[];
  public companyCloneList =[];
  filteredValues =  {deviceName:'',deviceType:[],isActive:[],device:'',sim:'',callingNumber:''};

  // form group
  deviceForm = new FormGroup({
    deviceName: new FormControl(),
    deviceType: new FormControl(),
    isActive: new FormControl()
 });
 
 get deviceName() {
   return this.deviceForm.get('deviceName');
 }
 
 get isActive() {
   return this.deviceForm.get('isActive');
 }
 get deviceType() {
  return this.deviceForm.get('deviceType');
}

  constructor(public userService:UserService,
    public dialog:MatDialog,public authService:AuthenticationService,public router:Router,public dataShare :DataSharingService) { }

  ngOnInit() {
    this.deviceManagmentAddModel.activationDate = this.userService.getDefaultDateSelected();
    this.getAllDeviceList();
    this.getDeviceTypeList();
    this.getAllMultpleDataViaURL();
  }
  
    /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
 public deviceTypeCloneList =[];
    getAllDeviceList() {
      this.isLoading = true;
      this.userService.getDataByUrl('showAllDeviceData').subscribe((data:any)=>{
        if(data.length>0){
          this.deviceManagmentList = data;
          this.deviceManagmentAddModel.isActive = true;
          this.dataSource = new MatTableDataSource(this.deviceManagmentList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
         this.isLoading = false;
         //get filter function...
         this.formSubscribe();
         this.getFormsValue();
        //  this.deviceTypeList = this.dataSource.filteredData.map(x=>x.deviceType);
        //  this.deviceTypeCloneList = this.deviceTypeList;
        } else{
          this.isLoading = false;
        }
      },  error => {
        this.isLoading = false;
        this.authService.errorToast(error.error.message);
      })
    }

    getDeviceTypeList(){
      this.userService.getDataByUrl('showAllDeviceType').subscribe((data:any)=>{
        if(data.length>0){
          this.deviceTypeList = data
          this.deviceTypeCloneList = this.deviceTypeList;
        }
      })
    } 

  toggleDialog(event) {
    document.getElementById('addDriver').classList.toggle('show-dailog');
    this.resetData();
  }

     /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
      resetData(){
        if(this.driverForm){
          this.driverForm.resetForm();
          this.driverForm.reset();
        }
        this.submitted ? this.getAllDeviceList() : '';
      }

    /*
      Author:Kapil Soni
      Funcion:getCurrentDriverDetail
      Summary:getCurrentDriverDetail for get driver detail
      Return list
    */
      getCurrentSimCardDetail(detail:any,exporter){
        this.dataShare.updatedData.next(exporter); 
        this.router.navigate(['/user/device/detail'], <any>{state: {data: detail,device:this.deviceManagmentList}});
      }

      /*
      Author:Kapil Soni
      Funcion:deleteDriver
      Summary:deleteDriver for get delete driver
      Return list
    */
    deleteSimCard(value){
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
          this.userService.deleteDataFromDb(value.id,'deleteDeviceByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              const index = this.dataSource.data.findIndex(x=>x.id == value.id);
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

         /*
      Author:Kapil Soni
      Funcion:addDriver
      Summary:addDriver for add driver
      Return list
    */
      addDriver(form:any){
        this.driverForm = form;
        this.submitted = true;
        if(this.deviceManagmentAddModel.isActive){
          this.deviceManagmentAddModel.isActive='active';
        }else{
          this.deviceManagmentAddModel.isActive='inActive';
        }
        let data =  this.companyList.find(x=>x.companyName == this.deviceManagmentAddModel.companyName);
        if(data){
          this.deviceManagmentAddModel.company=data;
        }

        //check sim card exist or not..
        let simCardData =  this.simCardList.find(x=>x.simProvider == this.selectedSimCard);
        if(simCardData){
          this.deviceManagmentAddModel.sim = simCardData;
        }else{
          this.deviceManagmentAddModel.sim  = null;
        }

        if(form.form.valid){
          this.isLoadingData = true;
          this.userService.storeDataToDb(<any>this.deviceManagmentAddModel,'saveDevice').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              this.isLoadingData = false;
              form.resetForm();
                form.reset();
  
                //dismiss dlalog and get all list
                this.toggleDialog('');
                this.getAllDeviceList();
            } else{
              this.isLoadingData = false;
            }
          },  error => {
            this.isLoadingData = false;
            this.authService.errorToast(error.error.message);
          })
        }
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


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    if(this.dataSource){
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
  }

  /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getSimListByCompany(name) {
    const matched = this.companyList.find(x=>x.companyName == name);
    if(matched.id){
      this.userService.getDataByUrl('showAllUnusedSimCardByCompanyId/'+matched.id).subscribe((data:any)=>{
        if(data.length>0){
          this.simCardList = data;
          this.simCardCloneList = this.simCardList;
        }else{
          this.simCardList =[];
          this.authService.errorToast('Sim Card Not found');  
        }
      }, error => {
        this.authService.errorToast(error.error.message);
      })
    }
  }

    updateDataViaKey(value,key):void{
      if(key == 'device'){
        let data =  this.simCardList.find(x=>x.callingNumber == value);
        if(data){
          this.deviceManagmentAddModel.assignSim = data;
          this.deviceManagmentAddModel.deviceName ='Dev_'+data.callingNumber;
        }
        value == 'No-SIM-card' ? this.deviceManagmentAddModel.deviceName = '' : this.deviceManagmentAddModel.deviceName;
      }else{
        let data =  (<any>this.deviceManagmentList).find(x=>x.callingNumber == value);
        this.deviceManagmentAddModel.assignSim = data;
        
      }
    }

    resetFilters(){
      this.getAllDeviceList();
      this.userService.resetFilter(this.deviceForm);
    }

    formSubscribe() {
      this.deviceName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['deviceName'] = positionValue;
        this.filteredValues['device'] = positionValue;
        this.filteredValues['callingNumber'] = positionValue;
        this.filteredValues['sim'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.isActive.valueChanges.subscribe((positionValue) => {
        this.filteredValues['isActive'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.deviceType.valueChanges.subscribe((positionValue) => {
        this.filteredValues['deviceType'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        let searchString = JSON.parse(filter);
        let isStatusAvailable = false;
        let isDeviceTypeAvailable= false;
        if (searchString.isActive && searchString.isActive.length) {
          for (const d of searchString.isActive) {
            if (data.isActive === d) {
              isStatusAvailable = true;
            }
          }
        } else {
          isStatusAvailable = true;
        }
        if (searchString.deviceType && searchString.deviceType.length) {
          for (const d of searchString.deviceType) {
            if (data.deviceType === d) {
              isDeviceTypeAvailable = true;
            }
          }
        } else {
          isDeviceTypeAvailable = true;
        }
        const resultValue =
          isStatusAvailable && isDeviceTypeAvailable && 
          (data.deviceName != null ? data.deviceName.toString().trim().toLowerCase().indexOf(searchString.deviceName != null ? searchString.deviceName.toLowerCase() : '') !== -1 : 0 ||
          data.deviceType != null ? data.deviceType.toString().trim().toLowerCase().indexOf(searchString.deviceType != null ? searchString.deviceType.toLowerCase() : '') !== -1 : 0 ||
          data.assignSim != null  ? data.assignSim.callingNumber.indexOf(searchString.callingNumber) !== -1 : 0)
          return <any>resultValue;
      };
        this.dataSource.filter = JSON.stringify(this.filteredValues);
    }

     /*
      Author:Kapil Soni
      Funcion:getAllMultpleDataViaURL
      Summary:getAllMultpleDataViaURL for get vehicle list
      Return list
    */
      getAllMultpleDataViaURL() {
        this.userService.getMulipleAPIDataViaUrl('company/showAllCompanyData','showAllPermissionData','','').subscribe((data:any)=>{
            this.companyList = data[1];
            this.companyCloneList = this.companyList;
        },  error => {
          this.authService.errorToast(error.error.message);
        })
      }

      search(value: string,key) { 
        switch (key) {
          case 'company':
              const companyList = this.companyCloneList.filter(item => item.companyName.toLowerCase().search(value.toLowerCase()) > -1);
              return this.companyList = companyList;
            break;
          case 'device':
            const deviceList = this.deviceTypeCloneList.filter(item => item.deviceType.toLowerCase().search(value.toLowerCase()) > -1);
            return this.deviceTypeList= deviceList;
            break;
          default:
            const simList = this.simCardCloneList.filter(item => item.toLowerCase().search(value.toLowerCase()) > -1);
            return this.simCardList= simList;
            break;
        }
    }

    updateDevice(value):void{
      let data =  this.deviceTypeList.find(x=>x.deviceType  == value);
      if(data){
        this.deviceManagmentAddModel.device = data.deviceType;
      }
    }

}
