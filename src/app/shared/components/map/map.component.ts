import { Component, OnInit,Input,ViewChild } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import {Router } from '@angular/Router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { TouchSequence } from 'selenium-webdriver';
import { ThrowStmt } from '@angular/compiler';

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
public startDate :any;
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
public assignGroupPermission =[];
public withoutGroupPermission =[];
public locationExist: boolean = false;

  constructor(
    public auth:AuthenticationService,
    public userService:UserService,public router :Router,private cdRef:ChangeDetectorRef,
    public datePipe:DatePipe) { }

  ngOnInit(): void {
    if(JSON.parse(localStorage.getItem('user-data')).assignGroup != null){
      this.assignGroupPermission =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions.filter(x=>x.name == 'Map');
    }
    if(JSON.parse(localStorage.getItem('user-data')).addPermissions != null){
      this.withoutGroupPermission =JSON.parse(localStorage.getItem('user-data')).addPermissions.filter(x=>x.name == 'Map');
    }
    if(this.assignGroupPermission.length > 0 && this.assignGroupPermission[0].items.length>0){
      this.vehicleHistoryExist = this.assignGroupPermission[0].items.findIndex(x=>x.lable == 'Vehicle Live Location');
      this.dashboardExist = this.assignGroupPermission[0].items.findIndex(x=>x.lable == 'Dashboard');
      this.locationExist = this.assignGroupPermission[0].items.findIndex(x=>x.lable == 'Vehicle History');
    }
    if(this.withoutGroupPermission.length > 0 && this.withoutGroupPermission[0].items.length>0){
      this.vehicleHistoryExist = this.withoutGroupPermission[0].items.findIndex(x=>x.lable == 'Vehicle Live Location');
      this.dashboardExist = this.withoutGroupPermission[0].items.findIndex(x=>x.lable == 'Dashboard');
      this.locationExist = this.withoutGroupPermission[0].items.findIndex(x=>x.lable == 'Vehicle History');
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

    setEndDataEvent(){
      this.resetFilters();
      if(this.defaultMapType != 'Vehicle History'){
        this.getVehicleLocation(this.selectedVehicleNumber);
      }else{
        this.getVehicleHistory();
      }
      
    }
    /*
      Author:Kapil Soni
      Funcion:getVehicleLocation
      Summary:getVehicleLocation for get current  location
      Return list
    */
   getVehicleLocation(vehicleNumber) {
     if(vehicleNumber || (this.startDate && this.endDate)){
        this.isLoadingData = true;
        if(this.startDate == undefined){
          this.startDate = null;
        }
        if(this.endDate == undefined){
          this.endDate = null;
          }

          let sDate  = this.datePipe.transform(this.startDate, 'yyyy-MM-dd hh:mm:ss');
          let eDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd hh:mm:ss');

          if(sDate == null && eDate == null){
            var url = 'vehicleLocation/'+vehicleNumber+'/'+sDate+'/'+eDate;
          }else{
            // var url = 'vehicleLocation/'+vehicleNumber+'/'+sDate.replace(/\s+/g, '')+'/'+eDate.replace(/\s+/g, '');
            var url = 'vehicleLocation/'+vehicleNumber+'/'+sDate+'/'+eDate
          }
          this.userService.getDataByUrl(url).subscribe((data:any)=>{
            if(data.length>0){  
              this.vehicelLocationList = data;
                this.drwapMarker();
              }else{
                this.vehicelLocationList  =[];
                this.isLoadingData=false;
                this.auth.errorToast('Location Not Found');
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
   public currentMapId :any;
  loadGoogleMap() {
    //dynamic setmap ID..
    if(this.defaultMapType == 'Dashboard'){
      this.currentMapId = 'googleMapDashboard';
    }else{
      this.currentMapId = 'locationMapDashboard';
    }
    setTimeout(() => {
      if(document.getElementById(this.currentMapId) != null){
        this.currentLocationMap = new google.maps.Map(document.getElementById(this.currentMapId), {
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
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
    }, 100);
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
      let matched = this.markersArray.find(x=>x.id == this.vehicelLocationList[j].id);
      if(matched == undefined){
        this.markersArray.push([
          this.vehicelLocationList[j].imei,
          this.vehicelLocationList[j].speed,
          this.vehicelLocationList[j].dttime,
          this.vehicelLocationList[j].lat,
          this.vehicelLocationList[j].lngt,
          this.vehicelLocationList[j].vname,
          this.vehicelLocationList[j].id,
          this.vehicelLocationList[j].vehicleStatus
        ])
      }
    }
    for (i = 0; i < this.markersArray.length; i++) {  
      var position = new google.maps.LatLng(this.markersArray[i][3], this.markersArray[i][4]);
      let startLocation = this.markersArray[0];
      let endLocation = this.markersArray[this.markersArray.length - 1];

      //if tab is Vehicle History then exeutute...
      if(this.defaultMapType == 'Vehicle History'){
        if(this.markersArray[i][6] == startLocation[6]){
          var icon = 'green';
          var scale = 14;
        }else if(this.markersArray[i][6] == endLocation[6]){
          var icon = 'blue';
          var scale = 14;
        }else{
          var icon = 'red';
          var scale = 12;
        }
      }else {
        if(this.markersArray[i][7] == 'idle'){
          var icon = 'yellow';
        }else if(this.markersArray[i][7] == 'running'){
          var icon = 'green';
        }else{
          var icon = 'red';
        }
        var scale = 12;
      }
      this.mapMarker = new google.maps.Marker({
        position: position,
        strokeColor: '#40710C',
        map: this.currentLocationMap,  
        title: 'HI!! HI´M HERE!',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: icon,
          fillOpacity: 1,
          strokeColor: 'white', 
          strokeWeight: 2
        }
      });
      if(this.defaultMapType != 'Dashboard'){
        this.currentLocationMap.setZoom(12);
      }else{
        this.currentLocationMap.setZoom(5);
      }
      this.mapMarkerList.push(this.mapMarker);
      
      if(this.defaultMapType == 'Vehicle History'){
        this.flightPlanCoordinates.push(this.mapMarker.getPosition());
      }
      this.currentLocationMap.setCenter(position);

      const map = this.currentLocationMap;
      const markers = this.mapMarkerList;

      if(this.defaultMapType == 'Dashboard'){
        new MarkerClusterer({ markers, map});
      }

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
    this.markersArray=[];
   
    this.flightPlanCoordinates=[];
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
        },error=>{
          this.isLoadingData =false;
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
          //this.getVehicleHistory();
        }
        this.loadGoogleMap();
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
      //  this.markersArray=[];
      //  this.mapMarkerList=[];
      //  this.flightPlanCoordinates=[];
      //   this.getVehicleLocation(this.selectedVehicleNumber);
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
          const now =new Date();
          this.startFromStartDate();
          return new Date().toISOString().split('T')[0];
        // if(this.startDate){
        //   const now =new Date();
        //   let finalDate = new Date(now.setDate(now.getDate() + 10));
        //   return new Date(finalDate).toISOString().split('T')[0];
        // }
   }

   startFromStartDate(){
      if(this.startDate){
          const now =new Date(this.startDate);
          let finalDate = new Date(now.setDate(now.getDate() + 20));
          return new Date(finalDate).toISOString().split('T')[0];
        }
   }

   getSelectedDate(value){
    const now = new Date(this.startDate).toISOString().slice(0, 16);
    (<any>document.getElementsByClassName("endDateLocal"))[0].min = now;
  }

     /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    getVehicleHistory() {
      this.isLoadingData = true; 
      const postData :any =   {
        "vname":this.selectedVehicleNumber,
        "startdate":this.startDate,
        "enddate":this.endDate
      }
      this.userService.storeDataToDb(postData,'vehicleHistory').subscribe((data:any)=>{
        if(data.length>0){
          this.vehicelLocationList = data;
          this.drwapMarker();
        } else{
          this.isLoadingData = false; 
          this.vehicleList= [];
        }
      },error=>{
        this.isLoadingData =false;
      })
    }
}
