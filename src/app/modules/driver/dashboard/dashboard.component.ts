import { AfterViewInit, Component, ElementRef, ViewChild,OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {SelectionModel} from '@angular/cdk/collections';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  objectKeys = Object.keys;
    // Importing ViewChild. We need @ViewChild decorator to get a reference to the local variable 
  // that we have added to the canvas element in the HTML template.
  @ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild('lineChart') private lineChartCanvas: ElementRef;
  barChart: any;
  isLoading = false;
   canvas: any;
  ctx: any;
  public dashboardDataList=[];
  public dashboardKeyList =[];
  public vehicleNumberList =[];
  statusList :string[]=["stop","running"];
  imei: "24324"
info: "!"
lat: 0
lngt: 0
specific: "Istiyaque-ANS"
  displayedColumns: any[] = ['name','vname','mobile','battery', 'ignition','imei','specific','date','idleTime','status'];
  dataSource: MatTableDataSource<any>;
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filteredValues =  {name:'', status:[],vname: '',battery:'',mobile:'',ignition:''};
  selection = new SelectionModel(true, []);
  public companyList =[];
  public vehicleNumber :any;
  public isLoadingData =false;
  public isLoadingGraphData = false;

 // form group
 dashboardFilterForm = new FormGroup({
  searchTerm: new FormControl(),
  companyName: new FormControl(),
  status:new FormControl()
});

get searchTerm() {
  return this.dashboardFilterForm.get('searchTerm');
}
get companyName() {
  return this.dashboardFilterForm.get('companyName');
}
get status() {
  return this.dashboardFilterForm.get('status');
}
  constructor(public userService :UserService,public auth:AuthenticationService) { }

  ngOnInit() {
    this.showAllVehicleTypeList();
    this.getAllDashboardData();
  }

  ngAfterViewInit() {
    this.dashboardFilterForm.get('companyName')?.setValue('19:20')

  }

  masterToggle() {
    this.selection.select(...this.dataSource.data);
  }
  /*
    Author:Kapil Soni
    Funcion:showAllVehicleTypeList
    Summary:showAllVehicleTypeList for get vehicle list
    Return list
  */
  showAllVehicleTypeList() {
    this.userService.getMulipleAPIDataViaUrl('showAllVehicleType','showAllFuelType','company/showAllCompanyData','showAllVehicleData').subscribe((data:any)=>{
      if(data.length>0){
        this.companyList = data[2];

        //viewVehicleData get vehicle list by company id
        if(this.companyList[0].id){
          this.dashboardFilterForm.get('companyName').setValue( this.companyList[0].id);
          this.viewVehicleData();
        }
        this.vehicleNumberList = data[3];
        localStorage.setItem('vehicleTypeList',JSON.stringify(data[1]));
        localStorage.setItem('fuelTypeList',JSON.stringify(data[0]));
        localStorage.setItem('companyList',JSON.stringify(data[2]));
      }
    })
  }

    /*
    Author:Kapil Soni
    Funcion:getAllDashboardData
    Summary:getAllDashboardData for get vehicle list
    Return list
  */
  getAllDashboardData() {
    this.isLoading = true;
    this.userService.getDataByUrl('DashboardData').subscribe((data:any)=>{
      if(data){
        this.dashboardDataList = data;
        this.isLoading =false;
      }
    })
  }

  /*
    Author:Kapil Soni
    Funcion:getAllVehicleDataInDashboard
    Summary:getAllVehicleDataInDashboard for get vehicle list
    Return list
  */
 public dashboardVehicleData =[];
  viewVehicleData() {
    if(this.dashboardFilterForm.get('companyName').value == null){
      this.auth.errorToast('Select Company');
      return false;
    }
    if(this.dashboardFilterForm.get('companyName').value != null){
      this.isLoadingData =true;
      this.userService.getDataByUrl('getVehicleDataToCompanyId/'+this.dashboardFilterForm.get('companyName').value).subscribe((data:any)=>{
        if(data.length>0){
          this.dashboardVehicleData =data;
          this.dataSource = new MatTableDataSource(this.dashboardVehicleData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoadingData =false;
          this.formSubscribe();
          this.getFormsValue();
        }else{
          this.isLoadingData =false;
          this.dashboardVehicleData=[];
          this.dataSource = new MatTableDataSource([]);
        }
      },error=>{
        this.isLoadingData =false;
        console.log(error);
      })
    }
  }

  formSubscribe() {
    this.searchTerm.valueChanges.subscribe((positionValue) => {
      this.filteredValues['name'] = positionValue;
      this.filteredValues['vname'] = positionValue;
      this.filteredValues['mobile'] = positionValue;
      this.filteredValues['battery'] = positionValue;
      this.filteredValues['ignition'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.status.valueChanges.subscribe((positionValue) => {
      this.filteredValues['status'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
  }

  getFormsValue() {
    this.dataSource.filterPredicate = (data, filter: string): boolean => {
      let searchString = JSON.parse(filter);
      let isStatusAvailable = false;
      if(searchString.status &&  searchString.status.length) {
        for (const d of searchString.status) {
          if (data.status === d) {
            isStatusAvailable = true;
          }
        }
      } else {
        isStatusAvailable = true;
      }
      const resultValue =isStatusAvailable &&
        (data.companyName.toString().trim().toLowerCase().indexOf(searchString.name != undefined ? searchString.name.toLowerCase() : '') !== -1 ||
        data.vname.toString().trim().toLowerCase().indexOf(searchString.vname != undefined  ? searchString.vname.toLowerCase() : '') !== -1 ||
        data.mobile.toString().trim().toLowerCase().indexOf(searchString.mobile != undefined ? searchString.mobile.toLowerCase() : '') !== -1 ||
        data.battery.toString().trim().toLowerCase().indexOf(searchString.battery != undefined ? searchString.battery.toLowerCase() : '') !== -1 ||
        data.ignition.toString().trim().toLowerCase().indexOf(searchString.ignition != undefined ? searchString.ignition.toLowerCase() : '') !== -1);
        return resultValue;
    };
    this.dataSource.filter = JSON.stringify(this.filteredValues);
  }

  public chartDataList =[];
  public lineChart:any;
  public selectedPageKey:any;
  generateGraphByKey(key){
    this.isLoadingGraphData = true;
    var apiURL :any;
    this.selectedPageKey =key;
    switch (key) {
      case 'customer':
        apiURL = 'CustomerChartData';
        break;
        case 'vehicle':
          apiURL = 'VehicleChartData'; 
          break;
        case 'kmTracked':
          apiURL = 'KmsTrackedChartData'; 
          break;
        case 'trackers':
          apiURL = 'TrackersChartData'; 
          break;
        case 'simCard':
          apiURL = 'SimCardChartData'; 
          break;
        case 'trips':
          apiURL = 'TripsChartData'; 
          break;
        case 'ticket':
          apiURL = 'TicketRaisedChartData'; 
          break;
        case 'liveTracking':
          apiURL = 'VehicleLiveTrackingChartData'; 
          break;
      default:
        break;
    }

    this.userService.getDataByUrl(apiURL).subscribe((data:any)=>{
      if(data){
         // Now we need to supply a Chart element reference with an object that defines the type of chart we want to use, and the type of data we want to display.
       this.barChart = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: '# of Votes',
            data: data.data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
      this.isLoadingGraphData =false;
      }
    })
    // this.userService.getDataByUrl('CustomerChartData').subscribe((data:any)=>{
    //   if(data){
    //     let gravityBars = '#F06292';
    //     let densityBars = '#4DB6AC';
    //     this.chartDataList = data;

    //     const list = Number(this.chartDataList.filter(x=>x.color == 'red').map(x=>x.data));
    //     const list2 = Number(this.chartDataList.filter(x=>x.color == 'green').map(x=>x.data));
    //     const list3 = Number(this.chartDataList.filter(x=>x.color == 'blue').map(x=>x.data));
    //     let densityData = {
    //       label: "REd",
    //       data: [list],
    //       backgroundColor: densityBars
    //     };
        
    //     let gravityData = {
    //       label: "Green",
    //       data: [list2],
    //       backgroundColor: gravityBars
    //     };

    //     let gravityData2 = {
    //       label: "Green",
    //       data: [list3],
    //       backgroundColor: gravityBars
    //     };
    //     var  planetData :any = {
    //       labels: this.chartDataList.map(x=>x.lable),
    //       datasets: [densityData,gravityData,gravityData2]
    //     };
    //     let chartOptions :any = {
    //       barPercentage: 1,
    //     };
    //     this.barChart= new Chart(this.barCanvas.nativeElement, {
    //       type: "bar",
    //       data: planetData,
    //       options: {
    //           scales: {
    //             yAxes: [{
    //               ticks: {
    //                 beginAtZero: true
    //               }
    //             }]
    //           }
    //         }
    //     });
    //   }
    // });
  }

  resetGraphData(){
    var ctxLine =(<any>document.getElementById("barCanvas")).getContext("2d");
    if(this.barChart != undefined) {
      this.barChart.destroy(); 
      this.barChart = new Chart(ctxLine, {});
    }
  }

  
}
