import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import {MatDialog} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-kms-summary-report',
  templateUrl: './kms-summary-report.component.html',
  styleUrls: ['./kms-summary-report.component.scss']
})
export class KmsSummaryReportComponent implements OnInit {
  vehicleAddForm : FormGroup;
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public isLoadingData : boolean = false;
  public isReportDataLoading : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
  indeterminate = false;
  companyList= [];
  public currentReportData :any = {};
  public reportList = [];
positionFilter = new FormControl();
filteredValues =  {dttime: '',duration: '',event: '',kms: ''};
reportTypeList = [];
public displayedColumns :any[] =  ['id','vehicle','odometer','today','yesterday','month'];
public reportTypeURL :any;
  public vehicleList = [];
  public companyId :any;
  public selectedCompanyId :any;

 // form group
 filterForm = new FormGroup({
  companyName: new FormControl()
});

get companyName() {
  return this.filterForm.get('companyName');
}
  constructor(public userService:UserService,
    public datePipe:DatePipe,
    public dialog:MatDialog,
    public authService:AuthenticationService,
    public router:Router,
    public dataShare:DataSharingService) { }
  
    ngOnInit() {
      this.reportTypeList = JSON.parse(localStorage.getItem('reportType'));
      this.companyList = this.userService.getCompanyListFromStorage();
      this.userService.sideMenuEmitter$.subscribe(data=>{
        if(data){
          this.dataSource = new MatTableDataSource([]);
          this.currentReportData = data;
          this.reportList =[];
        }else{
          this.currentReportData = this.reportTypeList[0];
        }
      })
    }
  
    updateDataViaKey(value):void{
      if(value){
        let data =  this.companyList.find(x=>x.companyName == value);
        if(data.id){
          this.selectedCompanyId = data.id;
        }
      }
    }
  
      getReportData(form){
        if(this.selectedCompanyId){
          this.isLoading = true;
          this.userService.storeDataToDb({'id':this.selectedCompanyId},'kmsSummaryReport').subscribe((data:any)=>{
            if(data.length>0){
              this.reportList = data;
              this.dataSource = new MatTableDataSource(<any>this.reportList);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.isLoading = false;
  
              //inistialze the fitlers
              this.formSubscribe();
              this.getFormsValue();
            } else{
              this.reportList = [];
              this.dataSource.data =[];
                this.dataSource._updateChangeSubscription();
              this.isLoading = false;
            }
          },  error => {
            this.authService.errorToast(error.error.message);
          })
        }else{
          this.reportList = [];
          this.dataSource = new MatTableDataSource(<any>this.reportList);
        }
      }
  
      formSubscribe() {
        ['driver','mobile','month','odometer','vehicle','yesterday'];
        this.companyName.valueChanges.subscribe((positionValue) => {
          this.filteredValues['driver'] = positionValue;
          this.filteredValues['mobile'] = positionValue;
          this.filteredValues['month'] = positionValue;
          this.filteredValues['odometer'] = positionValue;
          this.filteredValues['vehicle'] = positionValue;
          this.filteredValues['yesterday'] = positionValue;
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        });
      }
      
      getFormsValue() {
        this.dataSource.filterPredicate = (data, filter: string): boolean => {
          let searchString = JSON.parse(filter);
          const resultValue =
            data.driver.toString().trim().toLowerCase().indexOf(searchString.driver != null ? searchString.driver.toLowerCase() : '') !== -1 ||
            data.mobile.toString().trim().toLowerCase().indexOf(searchString.mobile != null ? searchString.mobile.toLowerCase() : '') !== -1 ||
            data.month.toString().trim().toLowerCase().indexOf(searchString.month != null ? searchString.month.toLowerCase() : '') !== -1 ||
            data.vehicle.toString().trim().toLowerCase().indexOf(searchString.vehicle != null ? searchString.vehicle.toLowerCase() : '') !== -1 ||
            data.yesterday.toString().trim().toLowerCase().indexOf(searchString.yesterday != null ? searchString.yesterday.toLowerCase() : '') !== -1;
            ;
          return resultValue;
        };
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }
}