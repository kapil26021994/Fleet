import { Component, OnInit,Input  } from '@angular/core';
import {Router} from '@angular/router';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-download-content',
  templateUrl: './download-content.component.html',
  styleUrls: ['./download-content.component.scss']
})
export class DownloadContentComponent implements OnInit {
  @Input() data: any;
  public isReportUrl : boolean = false;
  @Input() exporterInstance: any;
  public currentPageRoute :any;
  public templateHeader :any;
  public pageKey :any;
  public templateData = [];
  constructor(public router :Router) { }

  ngOnInit(): void {
    this.initializePageKey()
    this.router.url.includes('/user/report/')  || this.router.url.includes('/user/report') ? this.isReportUrl = true : this.isReportUrl = false;
  }
    
  initializePageKey(){
      switch (this.router.url){
        case '/user/company':
          this.currentPageRoute = '/user/company';
          this.pageKey= 'company';
          break;
        case '/user/device/list':
          this.currentPageRoute = '/user/device/list';
          this.pageKey= 'device';
          break;
          case '/user/route/list':
            this.currentPageRoute = '/user/route/list';
            this.pageKey= 'route';
            break;
        case '/user/driver/list':
          this.currentPageRoute = '/user/driver/list';
          this.pageKey= 'driver';
          break;
        case '/user/places/list':
          this.currentPageRoute = '/user/places/list';
          this.pageKey= 'places';
          break;
        case '/user/sim/list':
          this.currentPageRoute = '/user/sim/list';
          this.pageKey= 'sim';
          break;
        case '/user/trip/list':
          this.currentPageRoute = '/user/trip/list';
          this.pageKey= 'trip';
          break;
        case '/user/group':
          this.currentPageRoute = '/user/group/list';
          this.pageKey= 'group';
          break;
        case '/user/vehicle/list':
          this.currentPageRoute = '/user/vehicle/list';
          this.pageKey= 'vehicle';
          break;
        case '/user/alert/list':
          this.currentPageRoute = '/user/alert/list';
          this.pageKey= 'alert';
          break;
        case '/user/report':
          this.currentPageRoute = 'user/report/stoppage-report';
          this.pageKey= 'stoppage-report';
        break;
        case '/user/customer-support/list':
          this.currentPageRoute = '/user/customer-support/list';
          this.pageKey= 'customer-support';
          break;
        case '/user/report/stoppage-report':
          this.currentPageRoute = '/user/report/stoppage-report';
          this.pageKey= 'stoppage-report';
          break;
        case '/user/report/raw-Details':
            this.currentPageRoute = '/user/report/raw-Details';
            this.pageKey= 'raw-Details';
          break;
        case '/user/report/speed-report':
          this.currentPageRoute = '/user/report/speed-report';
          this.pageKey= 'speed-report';
          break;
        case '/user/report/vehicle-performance':
          this.currentPageRoute = '/user/report/vehicle-performance';
          this.pageKey= 'vehicle-performance';
          break;
        case '/user/report/vehicle-log':
          this.currentPageRoute ='/user/report/vehicle-log';
          this.pageKey= 'vehicle-log';
          break;
        case '/user/report/trip-summary':
          this.currentPageRoute = '/user/report/trip-summary';
          this.pageKey= 'trip-summary';
          break;
        case '/user/report/trip-summary-time':
          this.currentPageRoute = '/user/report/trip-summary-time';
          this.pageKey= 'trip-summary-time';

          break;
        case '/user/report/event-log':
          this.currentPageRoute = '/user/report/event-log';
          this.pageKey= 'event-log';
          break;
        default:
          this.currentPageRoute = '/user/management/list';
          this.pageKey= 'management';
    }
  }
  
  createPdf() {
    if(((this.router.url.indexOf('/detail') > -1) || this.router.url.indexOf('/edit') > -1)) {
      switch (this.router.url){
        case '/user/company/detail':
          this.currentPageRoute = '/user/company';
          break;
        case '/user/device/detail':
          this.currentPageRoute = '/user/device/list';
          break;
        case '/user/driver/edit':
          this.currentPageRoute = '/user/driver/list';
          break;
        case '/user/places/detail':
          this.currentPageRoute = '/user/places/list';
          break;
        case '/user/sim/detail':
          this.currentPageRoute = '/user/sim/list';
          break;
        case '/user/trip/detail':
          this.currentPageRoute = '/user/trip/list';
          break;
        case '/user/group/detail':
          this.currentPageRoute = '/user/group/list';
          break;
        case '/user/vehicle/detail':
          this.currentPageRoute = '/user/vehicle/list';
          break;
        default:
          this.currentPageRoute = '/user/management/list';
    }
    }else{
     this.initializePageKey();
    }
  
    switch (this.currentPageRoute){
        case '/user/company':
           this.templateHeader = [['Created Date', 'Name', 'Email', 'Number','Status','Domain']];
          this.data.forEach(e=>{
            var tempObj =[];
            tempObj.push(e.createDateTime);
            tempObj.push(e.companyName);
            tempObj.push( e.companyEmail);
            tempObj.push( e.companyContactNumber);
            tempObj.push( e.isActive);
            tempObj.push(e.companyDomain);
            this.templateData.push(tempObj);
          });
          break;
        case '/user/device/list':
          this.templateHeader  = [['Device Name', 'device Type', 'Assign Sim', 'Issue Date','Status']];
          this.data.forEach(e=>{
            var tempObj =[];
            tempObj.push(e.deviceName);
            tempObj.push( e.deviceType);
            tempObj.push( e.assignSim.simProvider);
            tempObj.push( e.issueDate);
            tempObj.push(e.isActive);
            this.templateData.push(tempObj);
          });
            break;
          case '/user/driver/list':
            this.templateHeader  = [['Name', 'Email', 'Licence Number', 'Address','phoneNumber','isActive']];
            this.data.forEach(e=>{
              var tempObj =[];
              tempObj.push(e.firstName+''+e.lastName);
              tempObj.push( e.email);
              tempObj.push( e.licenceNumber);
              tempObj.push( e.address);
              tempObj.push(e.phoneNumber);
              tempObj.push(e.isActive);
              this.templateData.push(tempObj);
            });
            break;
          case '/user/vehicle/list':
              this.templateHeader  = [['vehicle Number', 'Engine Number', 'Purchase Year', 'Fuel Type','Company Name','isActive']];
              this.data.forEach(e=>{
                var tempObj =[];
                tempObj.push(e.vehicleNumber);
                tempObj.push( e.enginNumber);
                tempObj.push( e.purchaseYear);
                tempObj.push( e.fuelType);
                tempObj.push(e.company.companyName);
                tempObj.push(e.isActive);
                this.templateData.push(tempObj);
              });
              break;
          case '/user/places/list':
              this.templateHeader  = [['Created Date', 'Address', 'Description', 'Geofence','place Name']];
              this.data.forEach(e=>{
                var tempObj =[];
                tempObj.push(e.createDateTime);
                tempObj.push( e.address);
                tempObj.push( e.description);
                tempObj.push( e.geoFence);
                tempObj.push(e.placeName);
                this.templateData.push(tempObj);
              });
              break;
            case '/user/sim/list':
                this.templateHeader  = [['Calling Number', 'iccdNumber', 'IMEI Number', 'purchaseDate','simProvider']];
                this.data.forEach(e=>{
                  var tempObj =[];
                  tempObj.push(e.callingNumber);
                  tempObj.push( e.iccdNumber);
                  tempObj.push( e.imeiNumber);
                  tempObj.push( e.purchaseDate);
                  tempObj.push(e.simProvider);
                  this.templateData.push(tempObj);
                });
                break;
              case '/user/trip/list':
                this.templateHeader  = [['Start Point', 'End point','Vehicle Number','Status']];
                this.data.forEach(e=>{
                  var tempObj =[];
                  tempObj.push(e.startPoint);
                  tempObj.push( e.endpoint);
                  tempObj.push( e.vehicle.vehicleNumber);
                  tempObj.push(e.isActive);
                  this.templateData.push(tempObj);
                });
                 break;
              case '/user/group/list':
                  this.templateHeader  = [['Group Name', 'Company Name', 'Company Email','Status']];
                  this.data.forEach(e=>{
                    var tempObj =[];
                    tempObj.push(e.groupName);
                    tempObj.push( e.company.companyName);
                    tempObj.push( e.company.companyEmail);
                    tempObj.push(e.isActive);
                    this.templateData.push(tempObj);
                  });
                   break;
              case '/user/management/list':
                  this.templateHeader  = [['Username', 'Email', 'phone Number', 'Company Name','Status']];
                  this.data.forEach(e=>{
                    var tempObj =[];
                    tempObj.push(e.username);
                    tempObj.push( e.email);
                    tempObj.push(e.phoneNumber);
                    tempObj.push( e.company.companyName);
                    tempObj.push(e.isActive);
                    this.templateData.push(tempObj);
                  });
                  break;
                case '/user/alert/list':
                  this.templateHeader  = [['Company Name', 'Email', 'phone Number', 'Vehicle Number']];
                  this.data.forEach(e=>{
                    var tempObj =[];
                    tempObj.push(e.company.companyName);
                    tempObj.push( e.email);
                    tempObj.push(e.phoneNumber);
                    tempObj.push( e.vehicle.vehicleNumber);
                    this.templateData.push(tempObj);
                  });
                  break;
                case '/user/customer-support/list':
                  this.templateHeader  = [['Subject', 'Email', 'phone Number','Company', 'Problem Type']];
                  this.data.forEach(e=>{
                    var tempObj =[];
                    tempObj.push(e.subject);
                    tempObj.push( e.email);
                    tempObj.push(e.contactNumber);
                    tempObj.push(e.company.companyName);
                    tempObj.push( e.problemType);
                    this.templateData.push(tempObj);
                  });
                  break;
                  case '/user/report/stoppage-report':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Date & Time', 'Duration']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.dttime);
                      tempObj.push( e.duration);
                      this.templateData.push(tempObj);
                    });
                    break;
                  case '/user/report/raw-Details':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Date & Time', 'Speed', 'KMS','Status']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.dttime);
                      tempObj.push( e.speed);
                      tempObj.push(e.kms);
                      tempObj.push(e.status);
                      this.templateData.push(tempObj);
                    });
                    break;
                    break;
                  case '/user/report/speed-report':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Date & Time', 'Duration', 'Speed']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.dttime);
                      tempObj.push( e.duration);
                      tempObj.push(e.topSpeed);
                      this.templateData.push(tempObj);
                    });
                    break;
                    break;
                  case '/user/report/vehicle-performance':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Driver', 'Mobile', 'Max Speed','Movement','Peroid','vname']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.driver);
                      tempObj.push( e.driverMobile);
                      tempObj.push(e.maxSpeed);
                      tempObj.push(e.movement);
                      tempObj.push(e.period);
                      tempObj.push(e.vname);
                      this.templateData.push(tempObj);
                    });
                    break;
                    break;
                  case '/user/report/vehicle-log':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Start Time', 'End Time', 'Duration','cumulaiveKM','event']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.startTime);
                      tempObj.push( e.endTime);
                      tempObj.push(e.duration);
                      tempObj.push(e.cumulaiveKM);
                      tempObj.push(e.event);
                      this.templateData.push(tempObj);
                    });
                    break;
                    break;
                  case '/user/report/trip-summary':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Start Date', 'End Date', 'kms Covered','movement']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.startDate);
                      tempObj.push( e.startDate);
                      tempObj.push(e.kmsCovered);
                      tempObj.push(e.movement);
                      this.templateData.push(tempObj);
                    });
                    break;
                    break;
                  case '/user/report/trip-summary-time':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Movement', 'Interval', 'period','avgSpeed']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.movement);
                      tempObj.push( e.interval);
                      tempObj.push(e.period);
                      tempObj.push(e.avgSpeed);
                      this.templateData.push(tempObj);
                    });
                    break;
                    break;
                  case '/user/report/event-log':
                    this.currentPageRoute = this.router.url;
                    this.templateHeader  = [['Date & Time', 'Duration', 'KMS','Event']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.dttime);
                      tempObj.push( e.duration);
                      tempObj.push(e.kms);
                      tempObj.push(e.event);
                      this.templateData.push(tempObj);
                    });
                    break;
                  default:
                    this.templateHeader = [['Vehicle Number', 'Vehicle Type', 'Engine Number','tankCapacity','modelName']];
                    this.data.forEach(e=>{
                      var tempObj =[];
                      tempObj.push(e.vehicleNumber);
                      tempObj.push(e.vehicleType);
                      tempObj.push(e.tankCapacity);
                      tempObj.push( e.isActive);
                      this.templateData.push(tempObj);
                    });
                  }
                  var doc = new jsPDF();
                  doc.setFontSize(5);
                  doc.setTextColor(100);
                  (doc as any).autoTable({
                          head: this.templateHeader,
                          body:this.templateData,
                    theme: 'striped',
                  })
                doc.save(this.pageKey);
        }

}
