import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user/user.service'
import { PlaceListModel } from 'src/app/core/models/driver/place-list.model';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication/authentication.service';
import { DataSharingService } from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';


declare var google;
@Component({
  selector: 'app-places-detail',
  templateUrl: './places-detail.component.html',
  styleUrls: ['./places-detail.component.scss']
})
export class PlacesDetailComponent implements OnInit {
  public data = [];
  public isEdit: boolean = false;
  public exporterInstance: any;
  public driverForm: any;
  public isMapUpdated: boolean = false;
  public selectedShape: any;
  public drawingToolInstance: any;
  public currentPlaceDetail = new PlaceListModel();
  drwaingTypeList = ['Polygon', 'Reactangle', 'Circle', 'Polyline']
  public placeMapDetailInstance: any;
  public placeType: any;
  public polylineList = [];
  public companyList = [];
  public selectedLatLngList = [];
  public drawingManager: any;
  public triangleCoords = []
  public circleInstance: any;
  public polylineInstance: any;
  public polygonInstance: any;
  public companyCloneList =[];

  constructor(public userService: UserService,
    public dialog: MatDialog, public router: Router, public authService: AuthenticationService, public dataShare: DataSharingService) {
  }

  toggleEditForm() {
    this.isEdit = this.isEdit ? false : true;
  }

  ngOnInit(): void {

    if (history.state.data) {
      this.companyList = JSON.parse(localStorage.getItem('companyList'));
      this.companyCloneList=this.companyList; 
      this.currentPlaceDetail = history.state.data;
      if ((<any>this.currentPlaceDetail).company != null) {
        (<any>this.currentPlaceDetail).companyName = (<any>this.currentPlaceDetail).company.companyName;
      } else {
        (<any>this.currentPlaceDetail).companyName = '';
      }

      
      this.data = [history.state.data];
      localStorage.setItem('currentPageData', JSON.stringify(history.state.data))
    } else {
      //this.currentPlaceDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  ngAfterViewInit(){
    this.loadGoogleMap();
  }

  /*
 Author:Kapil Soni
 Funcion:updateDriverInfo
 Summary:updateDriverInfo for update driver info
 Return list
*/

  loadGoogleMap() {

    if (this.currentPlaceDetail.geofence.length > 0) {
      let lat = Number(this.currentPlaceDetail.geofence[0].data[0].lat);
      let lng = Number(this.currentPlaceDetail.geofence[0].data[0].lng);
      var center = new google.maps.LatLng(lat, lng);
    } else {
      let lat = 21.7679
      let lng = 78.8718
      var center = new google.maps.LatLng(lat, lng);
    }
    // MAP ATTRIBUTES.
    var mapAttr = {
      center: center,
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      fullscreenControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      draggable: true,
      editable: true
    };


    this.placeMapDetailInstance = new google.maps.Map(document.getElementById("googlePlaceMap"), mapAttr);
    for (var i = 0; i < this.currentPlaceDetail.geofence.length; i++) {
      if (this.currentPlaceDetail.geofence[i].type == 'Circle') {
        this.currentPlaceDetail.geofence[i].type = 'circle';
      }
      switch (this.currentPlaceDetail.geofence[i].type) {
        case 'circle':
          this.circleInstance = new google.maps.Circle({
            id: this.currentPlaceDetail.geofence[i].id,
            center: center,
            map: this.placeMapDetailInstance,
            radius: this.currentPlaceDetail.geofence[i].radius,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            strokeColor: "#FF0000",
            strokeWeight: 0.2,
            draggable: true,
            editable: true
          });
          var self = this;
          self.polylineList.push(self.circleInstance);
          self.allOverlayList.push(self.circleInstance)

          //get draggable and radius_changed events..
          google.maps.event.addListener(self.circleInstance, 'center_changed', function (evt) {
            self.selectedLatLngList.push({
              "lat": this.center.lat(),
              "lng": this.center.lng()
            })
            let index = self.currentPlaceDetail.geofence.findIndex(x => x.id == this.id);
            if (index != -1) {
              self.currentPlaceDetail.geofence[index].data = self.selectedLatLngList;
              self.selectedLatLngList = [];
            }
          });
          google.maps.event.addListener(self.circleInstance, 'dragend', function (evt) {
            self.selectedLatLngList.push({
              "lat": evt.latLng.lat(),
              "lng": evt.latLng.lng()
            })
            let index = self.currentPlaceDetail.geofence.findIndex(x => x.id == this.id);
            if (index != -1) {
              self.currentPlaceDetail.geofence[index].data = self.selectedLatLngList;
              self.selectedLatLngList = [];
            }
          });
          google.maps.event.addListener(self.circleInstance, 'radius_changed', function (evt) {
            let index = self.currentPlaceDetail.geofence.findIndex(x => x.id == this.id);
            if (index != -1) {
              self.currentPlaceDetail.geofence[index].radius = this.getRadius();
            }
          });
          this.circleInstance.setMap(this.placeMapDetailInstance);
          break;
        case 'polygon':
          // Define the LatLng coordinates for the polygon's path.
          for (var j = 0; j < this.currentPlaceDetail.geofence[i].data.length; j++) {
            this.triangleCoords.push({
              'lat': Number(this.currentPlaceDetail.geofence[i].data[j].lat),
              'lng': Number(this.currentPlaceDetail.geofence[i].data[j].lng),
            })
          }
          var self = this;
          // Construct the polygon.
          self.polygonInstance = new google.maps.Polygon({
            id: self.currentPlaceDetail.geofence[i].id,
            paths: self.triangleCoords,
            strokeColor: "#FF0000",
            strokeOpacity: 0.2,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.2,
            draggable: true,
            editable: true
          });

          self.polylineList.push(self.polygonInstance);
          self.allOverlayList.push(self.polygonInstance);
          self.triangleCoords =[];

            var place_polygon_path = self.polygonInstance.getPath()
            google.maps.event.addListener(place_polygon_path, 'set_at', function (evt) {
              let list = [];
              var place_polygon_path = self.polygonInstance.getPath()
              let coords = place_polygon_path.getArray();
              for (var j = 0; j < coords.length; j++) {
                list.push({
                  'lat': Number(coords[j].lat()),
                  'lng': Number(coords[j].lng()),
                })
              }
              let index = self.currentPlaceDetail.geofence.findIndex(x => x.id == self.polygonInstance.id);
              if (index != -1) {
                self.currentPlaceDetail.geofence[index].data = [];
                self.currentPlaceDetail.geofence[index].data = list;
                list = [];
                place_polygon_path = '';
                console.log(self.currentPlaceDetail.geofence[0].data);
                console.log(self.currentPlaceDetail.geofence[index].data);
              }
            });
          self.polygonInstance.setMap(self.placeMapDetailInstance);
          break;
        default:
          for (var j = 0; j < this.currentPlaceDetail.geofence[i].data.length; j++) {
            this.triangleCoords.push({
              'lat': Number(this.currentPlaceDetail.geofence[i].data[j].lat),
              'lng': Number(this.currentPlaceDetail.geofence[i].data[j].lng),
            })
          }
          this.polylineInstance = new google.maps.Polyline({
            id: this.currentPlaceDetail.geofence[i].id,
            path: this.triangleCoords,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 0.5,
            strokeWeight: 3,
            draggable: true,
            editable: true
          });
          var self = this;
          this.polylineList.push(this.polylineInstance);
          self.allOverlayList.push(self.polylineInstance);
          self.triangleCoords =[];
          let polylinePath = this.polylineInstance.getPath();

          
          google.maps.event.addListener(self.polylineInstance, 'dragend', function (evt) {
            let list = [];
            var polylinePath = self.polylineInstance.getPath();
            var path = polylinePath.getArray();
            let index = self.currentPlaceDetail.geofence.findIndex(x => x.id == self.polylineInstance.id);
            if (index != -1) {
              for (var j = 0; j < path.length; j++) {
                list.push({
                  'lat': Number(path[j].lat()),
                  'lng': Number(path[j].lng()),
                })
              }
              self.currentPlaceDetail.geofence[index].data = [];
              self.currentPlaceDetail.geofence[index].data = list;
              console.log(self.currentPlaceDetail.geofence[index].data);
              list = [];
              polylinePath = '';
            }
          })
            google.maps.event.addListener(polylinePath, 'set_at', function (evt) {
              let list = [];
              var polylinePath = self.polylineInstance.getPath();
              var path = polylinePath.getArray();
              let index = self.currentPlaceDetail.geofence.findIndex(x => x.id == self.polylineInstance.id);
              if (index != -1) {
                for (var j = 0; j < path.length; j++) {
                  list.push({
                    'lat': Number(path[j].lat()),
                    'lng': Number(path[j].lng()),
                  })
                }
                self.currentPlaceDetail.geofence[index].data = [];
                self.currentPlaceDetail.geofence[index].data = list;
                list = [];
                polylinePath = '';
              }
            });
            self.polylineInstance.setMap(this.placeMapDetailInstance);
          break;
      }
    }
    this.updateDrwaingType();
  }


  updateDriverInfo() {
    this.userService.updateData(this.currentPlaceDetail, 'updatePlaceInfo').subscribe((data: any) => {
      if (data.message) {
        this.toggleEditForm();
        this.authService.successToast(data.message);
        this.router.navigate(['/user/places/']);
      }
    }, error => {
      this.authService.errorToast(error.error.message);
    })
  }
  /*
    Author:Kapil Soni
    Funcion:updateDrwaingType
    Summary:updateDrwaingType for update type
    Return list
  */
  public allOverlayList = [];
  updateDrwaingType() {
    var selectedDrawLine: any;
    switch (this.currentPlaceDetail.geofence[0].type) {
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
    this.drawingManager = new google.maps.drawing.DrawingManager({
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
        fillColor: "#FF0000",
        fillOpacity: 0.2,
        strokeWeight: 0.2,
        zIndex: 1,
      },
    });
    this.drawingManager.setMap(this.placeMapDetailInstance);

    var self = this;
    self.drawingToolInstance = this.drawingManager;
    self.drawingModeChangedEvent(self.drawingToolInstance);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', function (event: any) {
      var newShape = event.overlay;
      newShape.type = event.type;
      self.allOverlayList.push(event);
      self.selectedShape = newShape;

      if (self.allOverlayList.length == 2) {
        self.deleteMarkr(newShape.type);
      }




      // self.allOverlayList.push(event);
      if (event.type == 'circle') {
        var radius = event.overlay.getRadius();
        let lat = event.overlay.getCenter().lat();
        let lng = event.overlay.getCenter().lng();
        self.selectedLatLngList.push({
          "lat": lat,
          "lng": lng
        })
        self.currentPlaceDetail.geofence.push({
          "type": 'circle',
          "radius": radius,
          "data": self.selectedLatLngList
        })
      }

      if (event.type == 'polygon') {
        const coords = event.overlay.getPath().getArray();
        for (var i = 0; i < coords.length; i++) {
          self.selectedLatLngList.push({
            "lat": coords[i].lat(),
            "lng": coords[i].lng()
          })
        }
        self.currentPlaceDetail.geofence.push({
          "type": event.type,
          "radius": '',
          "data": coords
        })
      }
      if (event.type == 'polyline') {
        const coords = event.overlay.getPath().getArray();
        for (var i = 0; i < coords.length; i++) {
          self.selectedLatLngList.push({
            "lat": coords[i].lat(),
            "lng": coords[i].lng()
          })
        }
        self.currentPlaceDetail.geofence.push({
          "type": 'polyline',
          "radius": '',
          "data": self.selectedLatLngList
        })
      }
      if (event.type == 'rectangle') {
        var bounds = event.overlay.getBounds();
        var start = bounds.getNorthEast();
        var end = bounds.getSouthWest();
        var center = bounds.getCenter();
      }

      // if(self.allOverlayList.length == 2){
      //   self.deleteMarkr(newShape.type);
      // }
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
  drawingModeChangedEvent(drawingManager) {
    var self = this;
    // google.maps.event.addListener(drawingManager, 'drawingmode_changed',  function(event:any) {
    //   for (var i=0; i<self.polylineList.length; i++){                           
    //     self.polylineList[i].setMap(null); 
    //     self.polylineList[i].setVisible(false); 
    //   }
    //   self.currentPlaceDetail.geofence=[];
    // })
  }

  deleteMarkr(type) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        isDelete: true,
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Delete'
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        if (this.allOverlayList[0].overlay) {
          this.allOverlayList[0].overlay.setMap(null);
        } else {
          this.allOverlayList[0].setMap(null);
        }
        this.allOverlayList.splice(0, 1);
        this.currentPlaceDetail.geofence.splice(0, 1);
        this.selectedLatLngList = [];
      }
    });
  }

  updateCompany(value) {
    let matched = this.companyList.find(x => x.companyName == value);
    if (matched.id) {
      this.currentPlaceDetail.company = matched;
    }
  }

  search(value: string) { 
    let filter = value.toLowerCase();
   let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
    return this.companyList= list;
  }
}
