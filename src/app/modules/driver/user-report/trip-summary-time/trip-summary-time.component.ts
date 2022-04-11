import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{RawDetailReportModel} from 'src/app/core/models/driver/raw-detail-report.model';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import {MatDialog} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-trip-summary-time',
  templateUrl: './trip-summary-time.component.html',
  styleUrls: ['./trip-summary-time.component.scss']
})
export class TripSummaryTimeComponent implements OnInit {
  vehicleAddForm : FormGroup;
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public reportAdd = new RawDetailReportModel();
  public isLoadingData : boolean = false;
  public isReportDataLoading : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;
  indeterminate = false;
  companyList= [];
  public currentReportData :any = {};
  public reportList = [];
  public vehicleList = [];
positionFilter = new FormControl();
filteredValues =  {period: '',interval: '',movement: ''};
reportTypeList = [];
public displayedColumns :any[] =  ['period','avgSpeed','interval','movement'];
public reportTypeURL :any;

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
      this.userService.sideMenuEmitter$.subscribe(data=>{
        if(data){
          this.dataSource = new MatTableDataSource([]);
          this.currentReportData = data;
          this.reportList =[];
        }else{
          this.currentReportData = this.reportTypeList[0];
        }
      })
      this.getAllMultpleDataViaURL();
    }
  
      /*
      Author:Kapil Soni
      Funcion:getAllMultpleDataViaURL
      Summary:getAllMultpleDataViaURL for get vehicle list
      Return list
    */
      getAllMultpleDataViaURL() {
      this.userService.getMulipleAPIDataViaUrl('company/showAllCompanyData','','','').subscribe((data:any)=>{
        if(data[1].length > 0 || data[0].length > 0){
          this.companyList = data[1];
        } else{
          this.companyList= [];
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }
  
    updateDataViaKey(value,key):void{
      if(value && key == ''){
        let data =  this.companyList.find(x=>x.companyName == value);
        if(data.id){
          this.userService.getDataByUrl('companyIdToVehicleData/'+data.id).subscribe((data:any)=>{
            if(data){
              this.vehicleList = data;
            }
          },  error => {
            this.authService.errorToast(error.error.message);
          })
        }
      }else{
        let vehicleData =  this.vehicleList.find(x=>x.vehicleNumber == value);
        if(vehicleData){
          this.reportAdd.vname = vehicleData.vehicleNumber;
        }
      }
    }
  
      getReportData(form){
        if(form){
          this.isLoading = true;
          delete this.reportAdd.interval;
          this.reportAdd.startdate  = this.datePipe.transform(this.reportAdd.startdate, 'yyyy-MM-dd hh:mm:ss');
          this.reportAdd.enddate  = this.datePipe.transform(this.reportAdd.enddate, 'yyyy-MM-dd hh:mm:ss');
          this.userService.storeDataToDb(this.reportAdd,'TripSummaryTimeReport').subscribe((data:any)=>{
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
        this.companyName.valueChanges.subscribe((positionValue) => {
          this.filteredValues['period'] = positionValue;
          this.filteredValues['interval'] = positionValue;
          this.filteredValues['movement'] = positionValue;
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        });
      }
      
      getFormsValue() {
        this.dataSource.filterPredicate = (data, filter: string): boolean => {
          let searchString = JSON.parse(filter);
          const resultValue =
            data.period.toString().trim().toLowerCase().indexOf(searchString.period != null ? searchString.period.toLowerCase() : '') !== -1 ||
            data.interval.toString().trim().toLowerCase().indexOf(searchString.interval != null ? searchString.interval.toLowerCase() : '') !== -1 ||
            data.movement.toString().trim().toLowerCase().indexOf(searchString.movement != null ? searchString.movement.toLowerCase() : '') !== -1;
          return resultValue;
        };
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }
}