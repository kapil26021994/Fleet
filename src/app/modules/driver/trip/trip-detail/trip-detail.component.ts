import { Component, OnInit ,ViewChild} from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service';
import{DriverTripListModel} from 'src/app/core/models/driver/driver-trip-list.model';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

declare var google;
@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})
export class TripDetailComponent implements OnInit {
  public startPointLocation :any;
  public startEndLocation :any;
   public isEdit :boolean = false;
   public exporterInstance :any;
  public currentTripDetail = new DriverTripListModel();
  public data =[];
  public vehicleList = [];
  public driverList =[];
  public directionsDisplay :any;
  public endPointLocation:any;
  drawingToolInstance :any;
  public selectedShape :string;
  public allOverlayList :any =[];
  public selectedLatLngList :any =[];
  public tripDetailMapInstance :any;
  public circleInstance :any;
  public polylineInstance :any;
  public polygonInstance :any;
  public selectedAddressList = [];
  public endLocation :any;
  public triangleCoords =[];
  public addMoreAddress :any;
  public addNewLocatonLat :any;
  public addNewLocatonLng :any;
  public polylineList =[];
  constructor(public userService:UserService,public authService:AuthenticationService,
    public router:Router,public dataShare:DataSharingService,public dialog:MatDialog) { 
    }


  ngOnInit(): void {
    if(history.state.data){
      this.currentTripDetail = history.state.data;
      this.data  = [history.state.data];
      this.vehicleList  = history.state.vehicleList;
      this.driverList  = history.state.driverList;
     this.currentTripDetail.vehicleNumber = this.currentTripDetail.vehicle.vehicleNumber;
      this.currentTripDetail.firstName = this.currentTripDetail.driver.firstName;
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
     this.loadGoogleMap();
    }else{
      this.currentTripDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  loadGoogleMap() {
    if(this.currentTripDetail.tripGeofence.length >0){
      let  matched = this.currentTripDetail.tripGeofence.find(x=>x.type == 'Circle');
      if(matched){
        let lat =  Number(matched.data[0].tripGeofanceLat);
        let lng =  Number(matched.data[0].tripGeofenceLng);
        var center =new google.maps.LatLng(Number(matched.data[0].tripGeofanceLat), Number(matched.data[0].tripGeofenceLng));
      }
    }else{
      var center  = new google.maps.LatLng(21.7679, 78.8718);
    }

       // MAP ATTRIBUTES.
       var mapAttr = {
        center: center,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        draggable : true,
    };
 
       // THE MAP TO DISPLAY.
       this.tripDetailMapInstance = new google.maps.Map(document.getElementById("tripListDetailMap"), mapAttr);
       var  self = this;
       for(var i=0;i<self.currentTripDetail.tripGeofence.length;i++){
         switch(self.currentTripDetail.tripGeofence[i].type) {
           case 'Circle':
            var circelLocation =new google.maps.LatLng(Number(self.currentTripDetail.tripGeofence[i].data[0].tripGeofanceLat), Number(self.currentTripDetail.tripGeofence[i].data[0].tripGeofenceLng));
             this.circleInstance = new google.maps.Circle({
               center: circelLocation,
               map: self.tripDetailMapInstance,
               radius: self.currentTripDetail.tripGeofence[i].radius,
               fillColor: '#FF0000',
               fillOpacity: 0.5,
               strokeColor: "#FF0000",
               strokeWeight: 1,
               draggable: true,
               editable: true
             });
             self.polylineList.push(self.circleInstance);
             self.circleInstance.setMap(self.tripDetailMapInstance);
 
             //get draggable and radius_changed events..
             google.maps.event.addListener(self.circleInstance, 'dragend', function(evt){
               self.selectedLatLngList.push({ 
                 "tripGeofanceLat":evt.latLng.lat(),
                 "tripGeofenceLng":evt.latLng.lng()
               })
               let  index = self.currentTripDetail.tripGeofence.findIndex(x=>x.type == <any>'Circle');
               if(index != -1){
                 self.currentTripDetail.tripGeofence[index].data = self.selectedLatLngList;
               }
              });
              google.maps.event.addListener(self.circleInstance, 'radius_changed', function (evt) {
                 let  index = self.currentTripDetail.tripGeofence.findIndex(x=>x.type == <any>'Circle');
                 if(index != -1){
                   self.currentTripDetail.tripGeofence[index].radius = self.circleInstance.getRadius()
                 }
             });
             break;
           case 'polygon':
             // Define the LatLng coordinates for the polygon's path.
             for(var  j=0;j<this.currentTripDetail.tripGeofence[i].data.length;j++){
               this.triangleCoords.push({
                 'lat':Number(this.currentTripDetail.tripGeofence[i].data[j].tripGeofanceLat),
                 'lng':Number(this.currentTripDetail.tripGeofence[i].data[j].tripGeofenceLng),
               })
             }
               // Construct the polygon.
               this.polygonInstance = new google.maps.Polygon({
                 paths: this.triangleCoords,
                 strokeColor: "#FF0000",
                 strokeOpacity: 0.3,
                 strokeWeight: 1,
                 fillColor: "#FF0000",
                 fillOpacity: 0.35,
                 draggable: true,
                 editable: true
               });
               var  self = this;
               self.polylineList.push(this.polygonInstance);
               
               var place_polygon_path = self.polygonInstance.getPath()
               google.maps.event.addListener(place_polygon_path, 'set_at', function (evt) {
                 let list = [];
                 let coords = place_polygon_path.getArray();
                 for(var  j=0;j<coords.length;j++){
                   list.push({
                     'tripGeofanceLat':Number(coords[j].lat()),
                     'tripGeofenceLng':Number(coords[j].lng()),
                   })
                 }
                 let  index = self.currentTripDetail.tripGeofence.findIndex(x=>x.type == <any>'polygon');
                 if(index != -1){
                   self.currentTripDetail.tripGeofence[index].data = [];
                   self.currentTripDetail.tripGeofence[index].data = list;
                 }
               });
               self.polygonInstance.setMap(self.tripDetailMapInstance);
             break;
           default:
             for(var  j=0;j<self.currentTripDetail.tripGeofence[i].data.length;j++){
               this.triangleCoords.push({
                 'lat':Number(self.currentTripDetail.tripGeofence[i].data[j].tripGeofanceLat),
                 'lng':Number(self.currentTripDetail.tripGeofence[i].data[j].tripGeofenceLng),
               })
             }
             self.polylineInstance = new google.maps.Polyline({
               path: self.triangleCoords,
               geodesic: true,
               strokeColor: "#FF0000",
               strokeOpacity: 3.0,
               strokeWeight: 2,
               draggable: true,
               editable: true
             });
             var  self = this;
             this.polylineList.push(this.polylineInstance);
             let polylinePath = this.polylineInstance.getPath();
             google.maps.event.addListener(polylinePath, 'set_at', function (evt) {
               let list = [];
               var path = polylinePath.getArray();
                 let  index = self.currentTripDetail.tripGeofence.findIndex(x=>x.type == <any>'polyline');
                 if(index != -1){
                   for(var  j=0;j<path.length;j++){
                     list.push({
                       'tripGeofanceLat':Number(path[j].lat()),
                       'tripGeofenceLng':Number(path[j].lng()),
                     })
                   }
                   self.currentTripDetail.tripGeofence[index].data =[];
                   self.currentTripDetail.tripGeofence[index].data =list;
                 }
             });
            this.polylineInstance.setMap(this.tripDetailMapInstance);
             break;
         }
       }
       self.updateDrwaingType();
      }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

  fetchStartLocation(){
    var self = this;
    var  autocomplete = new google.maps.places.Autocomplete((document.getElementById('startTrip')),{ types: ['geocode'] });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var lat = autocomplete.getPlace().geometry.location.lat(),
          lng = autocomplete.getPlace().geometry.location.lng();
          self.currentTripDetail.startPoint =autocomplete.getPlace().formatted_address;
          self.drwaLineBetweenLocation();
      });
    }

  fetchEndLocation(){
    var self = this;
    var  autocomplete = new google.maps.places.Autocomplete((document.getElementById('endTrip')),{ types: ['geocode'] });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var lat = autocomplete.getPlace().geometry.location.lat(),
          lng = autocomplete.getPlace().geometry.location.lng();
         //self.currentTripDetail.endpoint =autocomplete.getPlace().formatted_address;
          self.drwaLineBetweenLocation();
      });
    }

    fetchLocationViaKey(pageId){
      var self = this;
      var  autocomplete = new google.maps.places.Autocomplete((document.getElementById(pageId)),{ types: ['geocode'] });
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          //hold location via type
          if(pageId == 'startTrip'){
            self.startPointLocation=autocomplete.getPlace().formatted_address;
            self.currentTripDetail.startPoint =self.startPointLocation;

            self.currentTripDetail.tripLatLong.push({
              "address": self.startPointLocation,
              "destiationLat": autocomplete.getPlace().geometry.location.lat(),
              "destiationLng": autocomplete.getPlace().geometry.location.lng()
            });
          } else{
            self.addMoreAddress = autocomplete.getPlace().formatted_address;
            self.addNewLocatonLat = autocomplete.getPlace().geometry.location.lat();
            self.addNewLocatonLng  =  autocomplete.getPlace().geometry.location.lng();
            //check data exist or not..
            let exist = self.currentTripDetail.tripLatLong.find(x=>x.address == self.addMoreAddress);
            if(exist == undefined){
              self.currentTripDetail.tripLatLong.push({
                "address": self.addMoreAddress,
                "destiationLat": self.addNewLocatonLat,
                "destiationLng": self.addNewLocatonLng
              });
            }
          }
        });
      }

   /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for get vehicle list
    Return list
  */
    updateDriverInfo() {
      //delete this.currentTripDetail.vehicleNumber;
     // delete  this.currentTripDetail.firstName;
      this.currentTripDetail.driver=this.currentTripDetail.driver;
      this.userService.updateData(this.currentTripDetail ,'updateTripInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/trip/']);
        } 
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }
    
     updateDataViaKey(value,key):void{
      if(this.vehicleList.length>0 &&  key == 'vehicle'){
          let data =  (<any>this.vehicleList).find(x=>x.vehicleNumber == value);
          this.currentTripDetail.vehicle = data;
      }else{
        let data =  (<any>this.driverList).find(x=>x.firstName == value);
        this.currentTripDetail.driver = data;
      }
    }

    /*
      Author:Kapil Soni
      Funcion:updateDrwaingType
      Summary:updateDrwaingType for update type
      Return list
    */
    updateDrwaingType(){
      // this.deleteAllShape();
      // this.deleteSelectedShape()
      
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.CIRCLE,
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.POLYLINE
          ],
        },
        circleOptions: {
          fillColor: '#FF0000',
          strokeColor: "#FF0000",
          fillOpacity: 0.5,
          strokeWeight: 5,
          zIndex: 1,
        },
      });
      drawingManager.setMap(this.tripDetailMapInstance);

      var self = this;
      self.drawingToolInstance = drawingManager;
      self.drwaLineBetweenLocation();
      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event:any) {
        var newShape = event.overlay;
        newShape.type = event.type;
        self.selectedShape= newShape;
        self.allOverlayList.push(event);
        if (event.type == 'circle') {
          var bounds = event.overlay.getBounds();
          let lat  = event.overlay.getCenter().lat();
          let lng = event.overlay.getCenter().lng();
          
          self.selectedLatLngList.push({ 
            "tripGeofanceLat":lat,
            "tripGeofenceLng": lng
          })
          self.currentTripDetail.tripGeofence.push({
            "type":'Circle',
            "radius": event.overlay.getRadius(),
            "data": self.selectedLatLngList
          })
          self.selectedLatLngList =[];
        }

        if(event.type == 'polygon') {
          const coords = event.overlay.getPath().getArray();
          for(var i=0;i<coords.length;i++){
            self.selectedLatLngList.push({ 
              "tripGeofanceLat": coords[i].lat(),
              "tripGeofenceLng": coords[i].lng()
            })
          }
          self.currentTripDetail.tripGeofence.push({
            "type":event.type,
            "radius": '',
            "data": self.selectedLatLngList
          })
        }

        if(event.type == 'polyline') {
          const coords = event.overlay.getPath().getArray();
          for(var i=0;i<coords.length;i++){
            self.selectedLatLngList.push({ 
              "tripGeofanceLat": coords[i].lat(),
              "tripGeofenceLng": coords[i].lng()
            })
          }
          self.currentTripDetail.tripGeofence.push({
            "type":'polyline',
            "radius": '',
            "data": self.selectedLatLngList
          })
        }
      });
    }

    drwaLineBetweenLocation(){
      var self = this;
      var directionsService = new google.maps.DirectionsService();
      self.directionsDisplay = new google.maps.DirectionsRenderer();
      self.directionsDisplay.setOptions( {draggable: true} );

      self.directionsDisplay.setMap(self.tripDetailMapInstance);
      self.directionsDisplay.addListener("directions_changed", () => {
        const directions = self.directionsDisplay.getDirections();
        if (directions) {
        }
      });

      let startLocation = self.currentTripDetail.tripLatLong[0].address;
      self.endLocation = self.currentTripDetail.tripLatLong[self.currentTripDetail.tripLatLong.length - 1].address;
          //create the array for lat lng and generate polyline......
      self.selectedAddressList = new Array();
      for(var i=0;i<self.currentTripDetail.tripLatLong.length;i++) {
        if(self.currentTripDetail.tripLatLong[i].address != startLocation && self.currentTripDetail.tripLatLong[i].address != self.endLocation) {
          var first = 
            new google.maps.LatLng(Number(self.currentTripDetail.tripLatLong[i].destiationLat), Number(self.currentTripDetail.tripLatLong[i].destiationLng));
            self.selectedAddressList.push({
              location: first
            });
        }
      }
       
      var request = {
        origin:startLocation, 
        destination:self.endLocation,
        waypoints: self.selectedAddressList,
        optimizeWaypoints: true,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          var leg = response.routes[ 0 ].legs[ 0 ];
          self.directionsDisplay.setDirections(response);
        }
      });
    }

    addLocation(){
      this.drwaLineBetweenLocation();
    }

        /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
      deleteTrip(value){
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          panelClass: 'custom-dialog-container',
          data: {
            message: 'Are you sure want to delete?',
            buttonText: {
              ok: 'Delete',
              cancel: 'No',
            },
          },
        });
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if(confirmed && this.currentTripDetail.id){
            this.userService.deleteDataFromDb(this.currentTripDetail.id,'deleteTripByID').subscribe((data:any)=>{
              if(data.message){
                this.authService.successToast(data.message);
                this.router.navigate(['/user/trip/']);
              }
            }, error => {
              this.authService.errorToast(error.error.message);
            })
          }
        });
      }
}
