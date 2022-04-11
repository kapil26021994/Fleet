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
  selector: 'app-speed-report',
  templateUrl: './speed-report.component.html',
  styleUrls: ['./speed-report.component.scss']
})
export class SpeedReportComponent implements OnInit {
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
filteredValues =  {speed: '',isActive:[],kms: ''};
reportTypeList = [];
public displayedColumns :any[] =  [ 'dttime','duration','location','topSpeed'];
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
  
      getReportData(form){
        if(form){
          this.isLoading = true;
          this.reportAdd.startdate  = this.datePipe.transform(this.reportAdd.startdate, 'yyyy-MM-dd hh:mm:ss');
          this.reportAdd.enddate  = this.datePipe.transform(this.reportAdd.enddate, 'yyyy-MM-dd hh:mm:ss');
          this.userService.storeDataToDb(this.reportAdd,'overSpeedReport').subscribe((data:any)=>{
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
          this.filteredValues['dttime'] = positionValue;
          this.filteredValues['duration'] = positionValue;
          this.filteredValues['topSpeed'] = positionValue;
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        });
      }
    
      getFormsValue() {
        this.dataSource.filterPredicate = (data, filter: string): boolean => {
          let searchString = JSON.parse(filter);
          let isStatusAvailable = false;
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
          isStatusAvailable && 
            (data.dttime.toString().trim().toLowerCase().indexOf(searchString.dttime != null ? searchString.dttime.toLowerCase() : '') !== -1 ||
            data.duration.toString().trim().toLowerCase().indexOf(searchString.duration != null ? searchString.duration.toLowerCase() : '') !== -1 ||
            data.topSpeed.toString().trim().toLowerCase().indexOf(searchString.speed != null ? searchString.speed.toLowerCase() : '') !== -1
            );
          return resultValue;
        };
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

}
