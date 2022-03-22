import { Component, OnInit } from '@angular/core';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
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
  public sideMenuList :any =[];
  sideMenuListClone =   [
    {'lableName':'Dashboard','routerLink':'/user/dashboard','icon':'menu-icon mdi mdi-home menu-icon','active':true,'collapsed':false},
    {'lableName':'Company','routerLink':'/user/company','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-domain menu-icon','list':[{'name':'Company List'}]},
    {'lableName':'User Group Management','routerLink':'/user/group','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'Group List'}]},
    {'lableName':'User Management','routerLink':'/user/management','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'User List'}]},
    {'lableName':'Vehicles','routerLink':'vehicle/list','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Vehicle List'}]},
    {'lableName':'Driver','routerLink':'/user/driver','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Driver List'}]},
    {'lableName':'Device','routerLink':'/user/device','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Device List'}]},
    {'lableName':'Sim Management','routerLink':'/user/sim','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'SIM List'}]},
    {'lableName':'Geofence','routerLink':'/user/places','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[{'name':'Geofence List'}]},
    {'lableName':'Routes','routerLink':'/user/route','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Routes List'}]},
    {'lableName':'Trip','routerLink':'/user/trip','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Trip List'}]},
    {'lableName':'Map','routerLink':'/user/map','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[]},
    {'lableName':'Alert Management','routerLink':'/user/alert','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Alert List'}]},
    {'lableName':'Permission','routerLink':'/user/permission','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Permission List'}]},
    {'lableName':'customer-support','routerLink':'/user/customer-support','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Case List'}]}
  ]

  constructor(public  auth:AuthenticationService,public router:Router) {}

  ngOnInit() {
    this.initializeSideMenuList()
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
    let groupExist = JSON.parse(localStorage.getItem('user-data')).assignGroup;
    if(groupExist == null){
      this.sideMenuList = [
          {'lableName':'Dashboard','routerLink':'/user/dashboard','icon':'menu-icon mdi mdi-home menu-icon','active':true,'collapsed':false},
          {'lableName':'Company','routerLink':'/user/company','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-domain menu-icon','list':[{'name':'Company List'}]},
          {'lableName':'User Group Management','routerLink':'/user/group','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'Group List'}]},
          {'lableName':'User Management','routerLink':'/user/management','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-account','list':[{'name':'User List'}]},
          {'lableName':'Vehicles','routerLink':'vehicle/list','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Vehicle List'}]},
          {'lableName':'Driver','routerLink':'/user/driver','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Driver List'}]},
          {'lableName':'Device','routerLink':'/user/device','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Device List'}]},
          {'lableName':'Sim Management','routerLink':'/user/sim','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'SIM List'}]},
          {'lableName':'Geofence','routerLink':'/user/places','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[{'name':'Geofence List'}]},
          {'lableName':'Routes','routerLink':'/user/route','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Routes List'}]},
          {'lableName':'Trip','routerLink':'/user/trip','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-car','list':[{'name':'Trip List'}]},
          {'lableName':'Map','routerLink':'/user/map','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-map-marker','list':[]},
          {'lableName':'Alert Management','routerLink':'/user/alert','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Alert List'}]},
          {'lableName':'Permission','routerLink':'/user/permission','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Permission List'}]},
          {'lableName':'customer-support','routerLink':'/user/customer-support','active':false,'collapsed':false,'icon':'menu-icon mdi mdi-bell','list':[{'name':'Case List'}]}
        ]
    }else{
     for(let i=0;i<groupExist.addPermissions.length;i++){
       var finalList =  this.sideMenuListClone.filter(x=>x.lableName == groupExist.addPermissions[i].name);
       if(this.sideMenuList.length == 0){
        this.sideMenuList = finalList;
       }else{
        this.sideMenuList =  this.sideMenuList.concat(finalList);
       }
       console.log(this.sideMenuList );
     }
    }
      localStorage.setItem('pageList',JSON.stringify(this.sideMenuList));
  }


  
  currentMenuDetail(value){
    this.currentLink = value.routerLink;
    let index = this.sideMenuList.findIndex(x=>x.routerLink == value.routerLink);
    this.sideMenuList[index].active = true;
    this.sideMenuList[index].collapsed = value.collapsed;
    this.sideMenuList.forEach(data => {
      if(data.routerLink != this.currentLink){
        data.active = false;
        data.collapsed = false;
      }
    });
  }
}
