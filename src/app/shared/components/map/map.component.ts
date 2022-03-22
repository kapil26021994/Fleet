import { Component, OnInit,Input,ViewChild } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { ChangeDetectorRef } from '@angular/core';

import {Router} from '@angular/router';
//import { MarkerClusterer } from "@googlemaps/markerclusterer";


declare var google;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
public vehicleList = [];
public currentLocationMap :any;
public selectedVehicleNumber :any;
public directionsDisplay :any;
public vehicleRoute : boolean = false;
@Input() vehicleData :any;
public locationList = [];
public mapMarker :any;
public startDate :null;
public markersArray = [];
public isLoadingData = false;
public endDate :any;
public defaultMapType = 'Dashboard';
public vehicelLocationList =[];
public  vehicleListData = [];
public directionsPolylineInstance :any;
public mapMarkerList = [];
public flightPlanCoordinates =[];
public currentPageView :any;
public vehicleHistoryExist : boolean = false
public dashboardExist : boolean = false;
public locationExist: boolean = false;

  constructor(public userService:UserService,public router :Router,private cdRef:ChangeDetectorRef) { }

  ngOnInit(): void {
    if(JSON.parse(localStorage.getItem('user-data')).assignGroup){
      this.currentPageView =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions.filter(x=>x.name == 'Map');
      this.vehicleHistoryExist = this.currentPageView[0].items.find(x=>x.lable  == 'Vehicle History');
      this.dashboardExist = this.currentPageView[0].items.find(x=>x.lable  == 'Dashboard');
      this.locationExist = this.currentPageView[0].items.find(x=>x.lable  == 'Vehicle Live Location');
    }
    this.router.url == '/user/vehicle/location' ? this.vehicleRoute = true : this.vehicleRoute = false;
    this.getAllCompanyData();

    //call only if route from vehicel page...
    if(this.vehicleRoute){
      this.getVehicleLocation(this.vehicleData.vehicleNumber)
    }
  }
  
  ngAfterViewInit(): void {
    this.loadGoogleMap();
  }


  ngAfterViewChecked()
    {
      this.cdRef.detectChanges();
    }
     /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
   public clonedVehicleListData =[];
    getAllCompanyData() {
      this.userService.getDataByUrl('showAllVehicleData').subscribe((data:any)=>{
        if(data.length>0){
          this.vehicleListData = data;
          this.clonedVehicleListData=this.vehicleListData;
          this.selectedVehicleNumber= this.vehicleListData[0].vehicleNumber;
        } else{
          this.vehicleListData= [];
        }
      },  error => {
        //this.authService.errorToast(error.error.message);
      })
    }

    setEndDataEvent(value){
      this.getVehicleLocation(this.selectedVehicleNumber);
    }
    /*
      Author:Kapil Soni
      Funcion:getVehicleLocation
      Summary:getVehicleLocation for get current  location
      Return list
    */
   getVehicleLocation(vehicleNumber) {
     if(vehicleNumber){
        this.isLoadingData = true;
        if(this.startDate == undefined){
          this.startDate = null;
        }
        if(this.endDate == undefined){
          this.endDate = null;
          }
        this.userService.getDataByUrl('vehicleLocation/'+vehicleNumber+'/'+this.startDate+'/'+this.endDate).subscribe((data:any)=>{
          if(data.length>0){  
            this.vehicelLocationList = data;
              this.drwapMarker();
            }else{
              this.isLoadingData=false;
            }
          },  error => {
            this.isLoadingData=false;
        })
      }
  }

  /*
      Author:Kapil Soni
      Funcion:loadGoogleMap
      Summary:loadGoogleMap for get load map
      Return list
    */
  loadGoogleMap() {
    if(document.getElementById("googleMapDashboard") != null){
      this.currentLocationMap = new google.maps.Map(document.getElementById("googleMapDashboard"), {
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        draggable : true,
        center: new google.maps.LatLng(21.7679, 78.8718),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      
      if(this.defaultMapType == 'Dashboard' && !this.vehicleRoute){
        this.getAllVehicleList()
      }
    }
  } 

   /*
      Author:Kapil Soni
      Funcion:drwapMarker
      Summary:drwapMarker for set marker..
      Return list
    */
   drwapMarker(){
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    var i,j ;

    for (j = 0; j < this.vehicelLocationList.length; j++) {  
      this.markersArray.push([
        this.vehicelLocationList[j].imei,
        this.vehicelLocationList[j].speed,
        this.vehicelLocationList[j].dttime,
        this.vehicelLocationList[j].lat,
        this.vehicelLocationList[j].lngt,
        this.vehicelLocationList[j].vname
      ])
    }
    
    for (i = 0; i < this.markersArray.length; i++) {  
         var position = new google.maps.LatLng(this.markersArray[i][3], this.markersArray[i][4]);
        this.mapMarker = new google.maps.Marker({
          position: position,
          strokeColor: '#40710C',
          map: this.currentLocationMap,  
          title: 'HI!! HI´M HERE!',
        });
        this.mapMarkerList.push(this.mapMarker);
        if(this.defaultMapType == 'Vehicle History'){
          this.flightPlanCoordinates.push(this.mapMarker.getPosition());
        }
    
        const imagePath = "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m";
        const test = new MarkerClusterer(this.currentLocationMap);
        this.currentLocationMap.setCenter(position);
         this.isLoadingData = false;
       var self =this;
      google.maps.event.addListener(self.mapMarker, 'click', (function(marker, i) {
        return function() {
          var content = "Vehicle Number: "+ self.markersArray[i][5] + '<br>' + '</h3>' + "IMEI: " + self.markersArray[i][0]  +  '<br>' +
          "Speed : "+ self.markersArray[i][1]  + '<br>' +  "daytime : "+ self.markersArray[i][2]
          infowindow.setContent(content);
          infowindow.open(self.currentLocationMap , marker);
        }
    })(this.mapMarker, i));
    }


    //show line only...if type is Vehicle History..
    if(this.defaultMapType == 'Vehicle History'){
        this.directionsPolylineInstance = new google.maps.Polyline({
          map: this.currentLocationMap,
          path: this.flightPlanCoordinates,
          strokeColor: "#004C84",
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
      }
  }

  resetFilters(){
    //this.startDate = null;
    this.vehicelLocationList= [];
    //this.endDate = null;
    this.setMapOnAll(null);
  }
  
     /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
      getAllVehicleList() {
        this.isLoadingData = true;
        this.userService.getDataByUrl('AllVehicleLocations').subscribe((data:any)=>{
          if(data.length>0){
           this.vehicelLocationList = data;
           this.drwapMarker();
          } else{
            this.isLoadingData = false; 
            this.vehicleList= [];
          }
        })
      }

      updateMapType(value){
        this.resetFilters();
        if(value == 'Dashboard'){
          this.getAllVehicleList();
        }else if(value == 'Vehicle Live Location'){
          this.getVehicleLocation('');
          this.startDate = undefined;
          this.endDate = undefined;
        }else{
          this.startDate = undefined;
          this.endDate = undefined;
          this.getVehicleLocation('');
        }
        this.markersArray=[];
        this.mapMarkerList=[];
      }

      setMapOnAll(map) {
        for (let i = 0; i < this.mapMarkerList.length; i++) {
          this.mapMarkerList[i].setMap(map);
        }
        this.mapMarkerList=[];
        this.vehicelLocationList = [];
        this.markersArray= [];
        this.directionsPolylineInstance ? this.directionsPolylineInstance.setMap(null) : '';
      }


      
   /*
      Author:Kapil Soni
      Funcion:applyFilter
      Summary:applyFilter for fitler data
      Return list
    */
    applyFilter(value: any) {
      if(value){  
        this.resetFilters();
       this.selectedVehicleNumber= value.vehicleNumber;
       this.markersArray=[];
       this.mapMarkerList=[];
       this.flightPlanCoordinates=[];
        this.getVehicleLocation(this.selectedVehicleNumber);
      }
    }

    onKey(value) {
      this.clonedVehicleListData=  this.search(value);
    }
  
    search(value: string) {
      let filter = value.toLowerCase();
      return  this.vehicleListData.filter(option =>
        option.vehicleNumber.toLowerCase().startsWith(filter)
      );
    }

      getToday(): string {
        if(this.startDate){
          var now =new Date(this.startDate);
          let finalDate = new Date(now.setDate(now.getDate() + 10));
          return new Date(finalDate).toISOString().split('T')[0];
        }
   }
}
