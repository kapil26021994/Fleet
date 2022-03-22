import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{SimCartAddModel} from 'src/app/core/models/driver/sim-card-add.model';
import{SimCardListModel} from 'src/app/core/models/driver/sim-card-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import { FormControl } from '@angular/forms';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-sim-card',
  templateUrl: './sim-card.component.html',
  styleUrls: ['./sim-card.component.scss']
})
export class SimCardComponent implements OnInit {

  displayedColumns: any[] = ['imeiNumber','callingNumber', 'simProvider', 'purchaseDate','rechargeExpiryDate','iccdNumber','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public submitted :boolean = false;
  public simCardList :any=  new SimCardListModel();
  public simCartAddModel :any=  new SimCartAddModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
  public isLoading = false;
  public driverForm  :any;
  public callingNumberList = [];
  public imeiNumberList = [];
  public companyList = [];
  public simCardFormData:any;
   filteredValues =  {simName:'',callingNumber:[], imeiNumber:[],imei:'',number:'',companyName:''};

  // form group
  simCardForm = new FormGroup({
    simName: new FormControl(),
    callingNumber: new FormControl(),
    imeiNumber: new FormControl(),
   companyName: new FormControl()
 });
 
 get simName() {
   return this.simCardForm.get('simName');
 }
 
 get callingNumber() {
   return this.simCardForm.get('callingNumber');
 }
 get imeiNumber() {
  return this.simCardForm.get('imeiNumber');
}
  constructor(public userService:UserService,
    public dataShare:DataSharingService, public authService:AuthenticationService,public router:Router,public dialog:MatDialog,) { }

  ngOnInit() {
    this.getAllSimCardList()
  }


  
    /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
    getAllSimCardList() {
      this.simCartAddModel.isActive = true;
      this.isLoading = true;
      this.userService.getDataByUrl('showAllSimCardData').subscribe((data:any)=>{
        if(data.length>0){
          this.simCardList = data;
          this.dataSource = new MatTableDataSource(this.simCardList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.callingNumberList = this.dataSource.filteredData.map(x=>x.callingNumber);
          this.imeiNumberList = this.dataSource.filteredData.map(x=>x.imeiNumber);
           this.isLoading = false;

          //inistialze the fitlers
          this.formSubscribe();
          this.getFormsValue();
         
        } else{
          this.isLoading = false;
        }
      },  error => {
        this.isLoading = false;
        this.authService.errorToast(error.error.message);
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
        if(this.simCardFormData){
          this.simCardFormData.resetForm();
          this.simCardFormData.reset();
        }
        this.submitted ? this.getAllSimCardList() : '';
      }

    /*
      Author:Kapil Soni
      Funcion:getCurrentDriverDetail
      Summary:getCurrentDriverDetail for get driver detail
      Return list
    */
      getCurrentSimCardDetail(detail:any,exporter){
        this.dataShare.updatedData.next(exporter);  
        this.router.navigate(['/user/sim/detail'], <any>{state: {data: detail}});
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
            ok: 'Save',
            cancel: 'No',
          },
        },
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if(confirmed && value.id){
          this.userService.deleteDataFromDb(value.id,'deleteSimCardByID').subscribe((data:any)=>{
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
        this.simCardFormData = form;
        this.submitted = true;
        if(form.form.valid){
          if(this.simCartAddModel.isActive){
            this.simCartAddModel.isActive='active';
          }else{
            this.simCartAddModel.isActive='inActive';
          }
          this.isLoadingData = true;
          this.userService.storeDataToDb(<any>this.simCartAddModel,'saveSimCard').subscribe((data:any)=>{
            if(data.message){
              this.isLoadingData = false;
              form.resetForm();
                form.reset();
  
                //dismiss dlalog and get all list
                this.toggleDialog('');
                this.getAllSimCardList();
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

  formSubscribe() {
    this.simName.valueChanges.subscribe((positionValue) => {
      this.filteredValues['simName'] = positionValue;
      this.filteredValues['companyName'] = positionValue;
      this.filteredValues['imei'] = positionValue;
      this.filteredValues['number'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.imeiNumber.valueChanges.subscribe((positionValue) => {
      this.filteredValues['imeiNumber'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.callingNumber.valueChanges.subscribe((positionValue) => {
      this.filteredValues['callingNumber'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
  }

  getFormsValue() {
    this.dataSource.filterPredicate = (data, filter: string): boolean => {
          let searchString = JSON.parse(filter);
          let isPositionAvailable = false;
          let isCallingNumber = false;
          if (searchString.imeiNumber != null && searchString.imeiNumber.length) {
            for (const d of searchString.imeiNumber) {
              if (data.imeiNumber.trim() === d) {
                isPositionAvailable = true;
              }
            }
          } else {
            isPositionAvailable = true;
          }
          if (searchString.callingNumber != null && searchString.callingNumber.length) {
            for (const d of searchString.callingNumber) {
              if (data.callingNumber === d) {
                isCallingNumber = true;
              }
            }
          } else {
            isCallingNumber = true;
          }
          const resultValue =
            isPositionAvailable && isCallingNumber  &&
            (data.simProvider.toString().trim().toLowerCase().indexOf(searchString.simName != null ? searchString.simName.toLowerCase(): '') !== -1 ||
            data.callingNumber.toString().trim().toLowerCase().indexOf(searchString.number != null ? searchString.number.toLowerCase(): '') !== -1 ||
            data.imeiNumber.toString().trim().toLowerCase().indexOf(searchString.imei != null ? searchString.imei.toLowerCase(): '') !== -1);
          return resultValue;
        };
        this.dataSource.filter = JSON.stringify(this.filteredValues);
    }

    resetFilters(){
      this.getAllSimCardList();
      this.userService.resetFilter(this.simCardForm);
    }
}
