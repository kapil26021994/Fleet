import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service'
import{PlaceListModel} from 'src/app/core/models/driver/place-list.model';
import { Router } from '@angular/router';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';


declare var google;
@Component({
  selector: 'app-places-detail',
  templateUrl: './places-detail.component.html',
  styleUrls: ['./places-detail.component.scss']
})
export class PlacesDetailComponent implements OnInit {
public data =[];
  public isEdit :boolean = false;
  public exporterInstance :any;
  public driverForm : any;
  public isMapUpdated : boolean = false;
  public selectedShape :any;
  public drawingToolInstance :any;
  public currentPlaceDetail=new PlaceListModel();
  drwaingTypeList  = ['Polygon','Reactangle','Circle','Polyline']
  public placeMapDetailInstance :any;
  public placeType :any;
  public polylineList =[];
  public selectedLatLngList =[];

  constructor(public userService : UserService,
    public dialog:MatDialog,public router :Router,public authService:AuthenticationService,public dataShare:DataSharingService) { 
    this.dataShare.updatedData.subscribe((res: any) => { 
      if(res){ 
        this.exporterInstance = res;
      }
    }) 
  }

  toggleEditForm() {
    this.isEdit = this.isEdit?false:true;
  }

  ngOnInit(): void {
  
    if(history.state.data){
      this.currentPlaceDetail = history.state.data;
      
      this.loadGoogleMap()
      this.data  = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      //this.currentPlaceDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

     /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for update driver info
    Return list
  */
 public triangleCoords =[]
    public circleInstance :any;
    public polylineInstance :any;
    public polygonInstance :any;
    loadGoogleMap() {
     let lat =  Number(this.currentPlaceDetail.geofence[0].data[0].lat);
     let lng =  Number(this.currentPlaceDetail.geofence[0].data[0].lng);
      var center =new google.maps.LatLng(lat, lng);
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
            editable: true
        };
  

        this.placeMapDetailInstance = new google.maps.Map(document.getElementById("googlePlaceMap"), mapAttr);
        for(var i=0;i<this.currentPlaceDetail.geofence.length;i++){
          switch(this.currentPlaceDetail.geofence[i].type) {
            case 'Circle':
              this.circleInstance = new google.maps.Circle({
                center: center,
                map: this.placeMapDetailInstance,
                radius: this.currentPlaceDetail.geofence[i].radius,
                fillColor: '#FF0000',
                fillOpacity: 0.5,
                strokeColor: "#FF0000",
                strokeWeight: 1,
                draggable: true,
                editable: true
              });
              var  self = this;
              self.polylineList.push(self.circleInstance);
              self.allOverlayList.push(self.circleInstance)

              //get draggable and radius_changed events..
              google.maps.event.addListener(self.circleInstance, 'dragend', function(evt){
                self.selectedLatLngList.push({ 
                  "lat":evt.latLng.lat(),
                  "lng":evt.latLng.lng()
                })
                let  index = self.currentPlaceDetail.geofence.findIndex(x=>x.type == <any>'Circle');
                if(index != -1){
                  self.currentPlaceDetail.geofence[index].data = self.selectedLatLngList;
                }
               });
               google.maps.event.addListener(self.circleInstance, 'radius_changed', function (evt) {
                  let  index = self.currentPlaceDetail.geofence.findIndex(x=>x.type == <any>'Circle');
                  if(index != -1){
                    self.currentPlaceDetail.geofence[index].radius = self.circleInstance.getRadius()
                  }
              });
              this.circleInstance.setMap(this.placeMapDetailInstance);
              break;
            case 'polygon':
              // Define the LatLng coordinates for the polygon's path.
              for(var  j=0;j<this.currentPlaceDetail.geofence[i].data.length;j++){
                this.triangleCoords.push({
                  'lat':Number(this.currentPlaceDetail.geofence[i].data[j].lat),
                  'lng':Number(this.currentPlaceDetail.geofence[i].data[j].lng),
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
                self.allOverlayList.push(self.polygonInstance);
                
                var place_polygon_path = self.polygonInstance.getPath()
                google.maps.event.addListener(place_polygon_path, 'set_at', function (evt) {
                  let list = [];
                  let coords = place_polygon_path.getArray();
                  for(var  j=0;j<coords.length;j++){
                    list.push({
                      'lat':Number(coords[j].lat()),
                      'lng':Number(coords[j].lng()),
                    })
                  }
                  let  index = self.currentPlaceDetail.geofence.findIndex(x=>x.type == <any>'polygon');
                  if(index != -1){
                    self.currentPlaceDetail.geofence[index].data = [];
                    self.currentPlaceDetail.geofence[index].data = list;
                  }
                });
                self.polygonInstance.setMap(self.placeMapDetailInstance);
              break;
            default:
              for(var  j=0;j<this.currentPlaceDetail.geofence[i].data.length;j++){
                this.triangleCoords.push({
                  'lat':Number(this.currentPlaceDetail.geofence[i].data[j].lat),
                  'lng':Number(this.currentPlaceDetail.geofence[i].data[j].lng),
                })
              }
              this.polylineInstance = new google.maps.Polyline({
                path: this.triangleCoords,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 3.0,
                strokeWeight: 2,
                draggable: true,
                editable: true
              });
              var  self = this;
              this.polylineList.push(this.polylineInstance);
              self.allOverlayList.push(self.polylineInstance)
              let polylinePath = this.polylineInstance.getPath();
              google.maps.event.addListener(polylinePath, 'set_at', function (evt) {
                let list = [];
                var path = polylinePath.getArray();
                  let  index = self.currentPlaceDetail.geofence.findIndex(x=>x.type == <any>'polyline');
                  if(index != -1){
                    for(var  j=0;j<path.length;j++){
                      list.push({
                        'lat':Number(path[j].lat()),
                        'lng':Number(path[j].lng()),
                      })
                    }
                    self.currentPlaceDetail.geofence[index].data =[];
                    self.currentPlaceDetail.geofence[index].data =list;
                  }
              });
             this.polylineInstance.setMap(this.placeMapDetailInstance);
              break;
          }
        }
      this.updateDrwaingType();
    }


    updateDriverInfo() {
      this.userService.updateData(this.currentPlaceDetail ,'updatePlaceInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.authService.successToast(data.message);
          this.router.navigate(['/user/places/']);
        } 
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }
  /*
    Author:Kapil Soni
    Funcion:updateDrwaingType
    Summary:updateDrwaingType for update type
    Return list
  */
 public allOverlayList =[];
  updateDrwaingType(){
    var selectedDrawLine :any;
    switch(this.currentPlaceDetail.geofence[0].type) {
      case 'Circle':
        selectedDrawLine = google.maps.drawing.OverlayType.CIRCLE;
        break;
      case 'polygon':
        selectedDrawLine = google.maps.drawing.OverlayType.POLYGON;
        break;
      case 'rectangle':
        selectedDrawLine = google.maps.drawing.OverlayType.RECTANGLE;
          break;
      default:
        selectedDrawLine = google.maps.drawing.OverlayType.POLYLINE;
        break;
    }

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
        fillColor: "#ffff00",
        fillOpacity: 3,
        strokeWeight: 5,
        zIndex: 1,
      },
    });
    drawingManager.setMap(this.placeMapDetailInstance);

    var self = this;
    self.drawingToolInstance=drawingManager;
    self.drawingModeChangedEvent(self.drawingToolInstance);


    google.maps.event.addListener(self.polygonInstance, 'dragend', function(evt){
      console.log(evt.latLng.lat().toFixed(3));
     });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event:any) {
      var newShape = event.overlay;
      newShape.type = event.type;
      self.allOverlayList.push(event);
      self.selectedShape= newShape;

      if(self.allOverlayList.length == 2){
        self.deleteMarkr(newShape.type);
      }

     // self.allOverlayList.push(event);
      if (event.type == 'circle') {
        var radius = event.overlay.getRadius();
        let lat  = event.overlay.getCenter().lat();
        let lng = event.overlay.getCenter().lng();
        self.selectedLatLngList.push({ 
          "lat":lat,
          "lng": lng
        })
        self.currentPlaceDetail.geofence.push({
          "type":'circle',
          "radius":radius,
          "data": self.selectedLatLngList
        })
      }
    
      if(event.type == 'polygon') {
        const coords = event.overlay.getPath().getArray();
        for(var i=0;i<coords.length;i++){
          self.selectedLatLngList.push({ 
            "lat": coords[i].lat(),
            "lng": coords[i].lng()
          })
        }
        self.currentPlaceDetail.geofence.push({
          "type":event.type,
          "radius": '',
          "data": coords
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
        self.currentPlaceDetail.geofence.push({
          "type":'polyline',
          "radius": '',
          "data": self.selectedLatLngList
        })
      }
      if(event.type == 'rectangle') {
        var bounds = event.overlay.getBounds();
        var start = bounds.getNorthEast();
        var end = bounds.getSouthWest();
        var center = bounds.getCenter();
      }
    });
  }


   deleteSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
      // To show:
      this.drawingToolInstance.setOptions({
        drawingControl: false
      });
    }
  }

  deleteAllShape() {
    for (var i = 0; i < this.allOverlayList.length; i++) {
      this.allOverlayList[i].overlay.setMap(null);
    }
    this.allOverlayList = [];
  }

   /*
    Author:Kapil Soni
    Funcion:drawingModeChangedEvent
    Summary:drawingModeChangedEvent for update drwaing type...
    Return list
  */
  drawingModeChangedEvent(drawingManager){
    var self =this;
    // google.maps.event.addListener(drawingManager, 'drawingmode_changed',  function(event:any) {
    //   for (var i=0; i<self.polylineList.length; i++){                           
    //     self.polylineList[i].setMap(null); 
    //     self.polylineList[i].setVisible(false); 
    //   }
    //   self.currentPlaceDetail.geofence=[];
    // })
  }

  deleteMarkr(type){
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      panelClass: 'custom-dialog-container',
      data: {
        isDelete:true,
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Delete'
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if(confirmed){
        if(this.allOverlayList[0].overlay){
          this.allOverlayList[0].overlay.setMap(null);
        }else{
          this.allOverlayList[0].setMap(null);
        }
        this.allOverlayList.splice(0,1);
        this.currentPlaceDetail.geofence.splice(0,1);
        this.selectedLatLngList=[];
      }
    });
  }
}
