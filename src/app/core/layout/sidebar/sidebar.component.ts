import { Component, OnInit } from '@angular/core';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import{UserService} from 'src/app/core/services/user/user.service';
declare var bootstrap: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public  currentLink :any;
  public companyCount = 0;
    
  public navItemList =[];
  public reportTypeList =[];
  public sideMenuList :any =[];
  sideMenuListClone =   [
    {'lableName':'Dashboard','routerLink':'/user/dashboard','icon':'menu-icon mdi mdi-home menu-icon','active':true,'collapsed':false},
    {'lableName':'Company','routerLink':'/user/company','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-domain menu-icon','list':[{'name':'Company List'}]},
    {'lableName':'User Group Management','routerLink':'/user/group','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'Group List'}]},
    {'lableName':'User Management','routerLink':'/user/management','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'User List'}]},
    {'lableName':'Sim Management','routerLink':'/user/sim','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'SIM List'}]},
    {'lableName':'Device','routerLink':'/user/device','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Device List'}]},
    {'lableName':'Vehicles','routerLink':'vehicle/list','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Vehicle List'}]},
    {'lableName':'Geofence','routerLink':'/user/places','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[{'name':'Geofence List'}]},
    {'lableName':'Routes','routerLink':'/user/route','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Routes List'}]},
    {'lableName':'Trip','routerLink':'/user/trip','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Trip List'}]},
    {'lableName':'report','routerLink':'/user/report','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':''}]},
    {'lableName':'Alert Management','routerLink':'/user/alert','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Alert List'}]},
    {'lableName':'Permission','routerLink':'/user/permission','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Permission List'}]},
    {'lableName':'Driver','routerLink':'/user/driver','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Driver List'}]},
    {'lableName':'customer-support','routerLink':'/user/customer-support','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Case List'}]},
    {'lableName':'Map','routerLink':'/user/map','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[]}
  ]

  constructor(public  auth:AuthenticationService,public router:Router,public userService:UserService) {}

  ngOnInit() {
    this.initializeSideMenuList();
    this.getAllReportList();
    document.addEventListener("DOMContentLoaded", function(){
      document.querySelectorAll('.sidebar .nav-link').forEach(function(element){
        element.addEventListener('click', function (e) {
          let nextEl = element.nextElementSibling;
          let parentEl  = element.parentElement;	
    
            if(nextEl) {
                e.preventDefault();	
                let mycollapse = new bootstrap.Collapse(nextEl);
                
                if(nextEl.classList.contains('show')){
                  mycollapse.hide();
                } else {
                    mycollapse.show();
                    // find other submenus with class=show
                    var opened_submenu = parentEl.parentElement.querySelector('.submenu.show');
                    // if it exists, then close all of them
                    if(opened_submenu){
                      new bootstrap.Collapse(opened_submenu);
                    }
                }
            }
        }); // addEventListener
      }) // forEach
    }); 
  }

  initializeSideMenuList(){
    let groupExist = JSON.parse(localStorage.getItem('user-data'));
    if(groupExist.assignGroup == null && groupExist.roles[0] ==  "SUPER_ADMIN"){
      this.sideMenuList = [
          {'lableName':'Dashboard','routerLink':'/user/dashboard','icon':'menu-icon mdi mdi-home menu-icon','active':true,'collapsed':false},
          {'lableName':'Company','routerLink':'/user/company','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-domain menu-icon','list':[{'name':'Company List'}]},
          {'lableName':'User Group Management','routerLink':'/user/group','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'Group List'}]},
          {'lableName':'User Management','routerLink':'/user/management','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'User List'}]},
          {'lableName':'Sim Management','routerLink':'/user/sim','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'SIM List'}]},
          {'lableName':'Device','routerLink':'/user/device','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Device List'}]},
          {'lableName':'Vehicles','routerLink':'vehicle/list','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Vehicle List'}]},
          {'lableName':'Geofence','routerLink':'/user/places','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[{'name':'Geofence List'}]},
          {'lableName':'Routes','routerLink':'/user/route','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Routes List'}]},
          {'lableName':'Trip','routerLink':'/user/trip','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Trip List'}]},
          {'lableName':'report','routerLink':'/user/report','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':''}]},
          {'lableName':'Alert Management','routerLink':'/user/alert','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Alert List'}]},
          {'lableName':'Permission','routerLink':'/user/permission','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Permission List'}]},
          {'lableName':'Driver','routerLink':'/user/driver','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Driver List'}]},
          {'lableName':'customer-support','routerLink':'/user/customer-support','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Case List'}]},
          {'lableName':'Map','routerLink':'/user/map','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[]}
        ]
    }else{

      //Below check used for show group level permision
      if(groupExist.assignGroup != null && groupExist.assignGroup.addPermissions.length>0){
        for(let i=0;i<groupExist.assignGroup.addPermissions.length;i++){
          var finalList =  this.sideMenuListClone.filter(x=>x.lableName == groupExist.assignGroup.addPermissions[i].name);
            if(this.sideMenuList.length == 0){
              this.sideMenuList = finalList;
            }else{
              this.sideMenuList =  this.sideMenuList.concat(finalList);
            }
          }
       }

       //Below check used for show user level permision
       if(groupExist.addPermissions.length>0){
          for(let i=0;i<groupExist.addPermissions.length;i++){
            var userPermission =  this.sideMenuListClone.filter(x=>x.lableName == groupExist.addPermissions[i].name);
            if(userPermission.length>0){
              this.sideMenuList =  this.sideMenuList.concat(userPermission);
            }
          }
       }
    }
    localStorage.setItem('pageList',JSON.stringify(this.sideMenuList));
  }
  
  currentMenuDetail(value,submenu){
    this.currentLink = value.routerLink;
    let index = this.sideMenuList.findIndex(x=>x.routerLink == value.routerLink);
    if(index != 15){
      this.sideMenuList[index].active = true;
      this.sideMenuList[index].collapsed = value.collapsed;
    }else{
      let index_submenu = this.sideMenuList[index].list.findIndex(x=>x.name == submenu.name);
      this.initializeRouterLinkInReport(this.sideMenuList[index].list);
      if(index_submenu != -1){
        //this.sideMenuList[index].list[index_submenu].active = true;
        this.userService.sideMenuEmitter$.next(this.sideMenuList[index].list[index_submenu])
      }
    }
    
    this.sideMenuList.forEach(data => {
      if(data.routerLink != this.currentLink){
        data.active = false;
        data.collapsed = false;
      }
    });
  }

     /*
    Author:Kapil Soni
    Funcion:getAllReportList
    Summary:getAllReportList for get vehicle list
    Return list
  */
    getAllReportList() {
      this.userService.getDataByUrl('showAllReportType').subscribe((data:any)=>{
        if(data.length>0){
          data.forEach(report => {
            report.name = report.reportType;
          });
          this.reportTypeList = data;
          localStorage.setItem('reportType',JSON.stringify(this.reportTypeList));
          let matchedReport = this.sideMenuList.find(x=>x.lableName == 'report');
          if(matchedReport){
            matchedReport.list = this.reportTypeList;
          }
          console.log(this.reportTypeList);
        }
      })
    }

    initializeRouterLinkInReport(data){
      data.forEach(data_format => {
        switch (data_format.reportType){
          case 'Stoppage Report':
            data_format.routerLink = '/user/report/stoppage-report';
            break;
          case 'Vehicle Raw Details Report':
            data_format.routerLink = '/user/report/raw-Details';
            break;
          case 'Over Speed Report':
            data_format.routerLink = '/user/report/speed-report';
            break;
          case 'Vehicle Performance Report':
            data_format.routerLink = '/user/report/vehicle-performance';
            break;
          case 'Vehicle Log Report':
            data_format.routerLink = '/user/report/vehicle-log';
            break;
          case 'Trip Summary Location Report':
            data_format.routerLink = '/user/report/trip-summary';
            break;
          case 'Trip Summary Time Report':
            data_format.routerLink = '/user/report/trip-summary-time';
            break;
          case 'KMS Summary Report':
            data_format.routerLink = '/user/report/kms-summary-report';
            break;
          case 'All Vehicles Stoppage Report':
            data_format.routerLink = '/user/report/vehicles-stoppage-report';
            break;
          case 'All Vehicles Stoppage Report':
            data_format.routerLink = '/user/report/vehicles-stoppage-report';
            break;
          case 'Trip Summary Site Report':
            data_format.routerLink = '/user/report/Trip-summary-report';
              break;
          default:
            data_format.routerLink = '/user/report/event-log';
            break;
          }
      });
      console.log(data);
    }
}
