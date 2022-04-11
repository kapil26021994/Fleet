import { Component, OnInit ,ViewChild} from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service';
import{TripListModel} from 'src/app/core/models/driver/trip-list.model';
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
  public currentTripDetail = new TripListModel();
  public data =[];
  public routeDetailMapInstance :any;
  public vehicleList = [];
  public driverList =[];
  public directionsDisplay :any;
  public endPointLocation:any;
  public polylineList =[];
  public circleInstance :any;
  public selectedLatLngList =[];
  public triangleCoords  =[];
  public drawingToolInstance :any;
  public selectedShape :any;
  public allOverlayList = [];
  public tripIndex :any;
  constructor(public userService:UserService,public authService:AuthenticationService,
    public router:Router,public dataShare:DataSharingService,public dialog:MatDialog) { 
    }


  ngOnInit(): void {
    if(history.state.data){
      this.currentTripDetail = history.state.data;
      this.data  = [history.state.data];
      // this.vehicleList  = history.state.vehicleList;
      // this.driverList  = history.state.driverList;
      // this.currentTripDetail.vehicleNumber = this.currentTripDetail.vehicle.vehicleNumber;
      // this.currentTripDetail.firstName = this.currentTripDetail.driver.firstName;
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
      this.loadGoogleMap();
    }else{
      this.currentTripDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }


  loadGoogleMap() {
    if(this.currentTripDetail.routeGeofence.length >0){
      let  matched = this.currentTripDetail.routeGeofence.find(x=>x.type == 'Circle');
      if(matched){
        let lat =  Number(matched.data[0].lat);
        let lng =  Number(matched.data[0].lng);
        var center =new google.maps.LatLng(Number(matched.data[0].lat), Number(matched.data[0].lng));
      }
    } else{
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
       this.routeDetailMapInstance = new google.maps.Map(document.getElementById("tripDetailMap"), mapAttr);
       var  self = this;
       for(var i=0;i<self.currentTripDetail.routeGeofence.length;i++){
        this.tripIndex = i;
        switch(self.currentTripDetail.routeGeofence[i].type) {
          case 'Circle':
            var circelLocation =new google.maps.LatLng(Number(self.currentTripDetail.routeGeofence[i].data[0].lat), Number(self.currentTripDetail.routeGeofence[i].data[0].lng));
            this.circleInstance = new google.maps.Circle({
              center: circelLocation,
              map: self.routeDetailMapInstance,
              radius: self.currentTripDetail.routeGeofence[i].radius,
              fillColor: '#FF0000',
              fillOpacity: 0.2,
              strokeColor: "#FF0000",
              strokeWeight: 0.2,
              draggable: true,
              editable: true
            });
            self.polylineList.push(self.circleInstance);
            self.circleInstance.setMap(self.routeDetailMapInstance);

            //get draggable and radius_changed events..
            google.maps.event.addListener(self.circleInstance, 'dragend', function(evt){
              self.selectedLatLngList.push({ 
                "lat":evt.latLng.lat(),
                "lng":evt.latLng.lng()
              })
              let  index = self.currentTripDetail.routeGeofence.findIndex(x=>x.type == <any>'Circle');
              if(index != -1){
                self.currentTripDetail.routeGeofence[index].data.splice(index,1);
                self.currentTripDetail.routeGeofence[index].data = self.selectedLatLngList;
                self.selectedLatLngList=[];
              }
             });
             google.maps.event.addListener(self.circleInstance, 'radius_changed', function (evt) {
                let  index = self.currentTripDetail.routeGeofence.findIndex(x=>x.type == <any>'Circle');
                if(index != -1){
                  self.currentTripDetail.routeGeofence[index].radius = self.circleInstance.getRadius()
                }
            });
            break;
          case 'polygon':
            // Define the LatLng coordinates for the polygon's path.
            for(var  j=0;j<self.currentTripDetail.routeGeofence[i].data.length;j++){
              self.triangleCoords.push({
                'lat':Number(self.currentTripDetail.routeGeofence[i].data[j].lat),
                'lng':Number(self.currentTripDetail.routeGeofence[i].data[j].lng),
              })
            }
              // Construct the polygon.
              const polygonInstance = new google.maps.Polygon({
                paths: self.triangleCoords,
                strokeColor: "#FF0000",
                strokeOpacity: 0.3,
                strokeWeight: 1,
                fillColor: "#FF0000",
                fillOpacity: 0.3,
                draggable: true,
                editable: true
              });
              self.polylineList.push(polygonInstance);
              
              var place_polygon_path = polygonInstance.getPath();
              google.maps.event.addListener(place_polygon_path, 'set_at', function (evt) {
                let list = [];
                let coords = place_polygon_path.getArray();
                for(var  j=0;j<coords.length;j++){
                  list.push({
                    'lat':Number(coords[j].lat()),
                    'lng':Number(coords[j].lng()),
                  })
                }
                let  index = self.currentTripDetail.routeGeofence.findIndex(x=>x.type == <any>'polygon');
                if(index != -1){
                  self.currentTripDetail.routeGeofence[index].data = [];
                  self.currentTripDetail.routeGeofence[index].data = list;
                }
              });
              polygonInstance.setMap(self.routeDetailMapInstance);
            break;
          default:
            for(var  j=0;j<self.currentTripDetail.routeGeofence[i].data.length;j++){
              self.triangleCoords.push({
                'lat':Number(self.currentTripDetail.routeGeofence[i].data[j].lat),
                'lng':Number(self.currentTripDetail.routeGeofence[i].data[j].lng),
              })
            }
            const polylineInstance = new google.maps.Polyline({
              path: self.triangleCoords,
              geodesic: true,
              strokeColor: "#FF0000",
              strokeOpacity: 3.0,
              strokeWeight: 2,
              draggable: true,
              editable: true
            });
            var  self = this;
            this.polylineList.push(polylineInstance);
            let polylinePath = polylineInstance.getPath();
            google.maps.event.addListener(polylinePath, 'set_at', function (evt) {
              let list = [];
              var path = polylinePath.getArray();
                let  index = self.currentTripDetail.routeGeofence.findIndex(x=>x.type == <any>'polyline');
                if(index != -1){
                  for(var  j=0;j<path.length;j++){
                    list.push({
                      'lat':Number(path[j].lat()),
                      'lng':Number(path[j].lng()),
                    })
                  }
                  self.currentTripDetail.routeGeofence[index].data =[];
                  self.currentTripDetail.routeGeofence[index].data =list;
                }
            });
            polylineInstance.setMap(this.routeDetailMapInstance);
            break;
        }
      }
      this.updateDrwaingType();
      //this.drwaLineBetweenLocation();
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
          self.directionsDisplay.setMap(null);
          self.drwaLineBetweenLocation();
      });
    }

  fetchEndLocation(){
    var self = this;
    var  autocomplete = new google.maps.places.Autocomplete((document.getElementById('endTrip')),{ types: ['geocode'] });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var lat = autocomplete.getPlace().geometry.location.lat(),
          lng = autocomplete.getPlace().geometry.location.lng();
          self.currentTripDetail.endpoint =autocomplete.getPlace().formatted_address;
          self.directionsDisplay.setMap(null);
          self.drwaLineBetweenLocation();
      });
    }

         /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for get vehicle list
    Return list
  */
    updateDriverInfo() {
      delete this.currentTripDetail.vehicleNumber;
      delete  this.currentTripDetail.firstName;
      this.currentTripDetail.driver=this.currentTripDetail.driver;
      this.userService.updateData(this.currentTripDetail ,'updateRouteInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/route/']);
        } 
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }

    drwaLineBetweenLocation(){
      var self = this;
      var directionsService = new google.maps.DirectionsService();
      self.directionsDisplay = new google.maps.DirectionsRenderer();
      self.directionsDisplay.setMap(self.routeDetailMapInstance);
      self.directionsDisplay.addListener("directions_changed", () => {
        const directions = self.directionsDisplay.getDirections();
        if (directions) {
          //computeTotalDistance(directions);
        }
      });

        var request = {
          origin:self.currentTripDetail.startPoint , 
          destination:self.currentTripDetail.endpoint,
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
            fillOpacity: 0.2,
            strokeWeight: 2,
            zIndex: 1,
          },
        });
        drawingManager.setMap(this.routeDetailMapInstance);
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
              "lat":lat,
              "lng": lng
            })
            self.currentTripDetail.routeGeofence.push({
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
            self.currentTripDetail.routeGeofence.push({
              "type":event.type,
              "radius": '',
              "data": self.selectedLatLngList
            })
          }
          if(event.type == 'polyline') {
            const coords = event.overlay.getPath().getArray();
            for(var i=0;i<coords.length;i++){
              self.selectedLatLngList.push({ 
                "lat": coords[i].lat(),
                "lng": coords[i].lng()
              })
            }
            self.currentTripDetail.routeGeofence.push({
              "type":'polyline',
              "radius": '',
              "data": self.selectedLatLngList
            })
          }
        });
      }

                 /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    deleteRoute(value){
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
          this.userService.deleteDataFromDb(this.currentTripDetail.id,'deleteRouteByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              this.router.navigate(['/user/route/']);
            }
          }, error => {
            this.authService.errorToast(error.error.message);
          })
        }
      });
    }
}
