import { Component, OnInit ,ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{DriverTripListModel} from 'src/app/core/models/driver/driver-trip-list.model';
import{TripAddModel} from 'src/app/core/models/driver/trip-add.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';
import{VehicleAdd} from 'src/app/core/models/driver/vehicle-add.model';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';


declare var google;
@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss']
})
export class TripComponent implements OnInit {
  displayedColumns: string[] = ['select', 'createDateTime', 'tripName', 'driverName','vehicleNumber','active','action'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel(true, []);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  types:any = ["Car", "Truck", "Bus"];
  filteredValues =  {tripName: '',driverName:'',vehicleNumer:''};
  public selectedLatLngList =[];
  public selectedShape :any;
  public drawingToolInstance :any;
  public allOverlayList :any = [];
  public icons = {
    start: new google.maps.MarkerImage(
      // URL
      'http://maps.google.com/mapfiles/ms/micons/blue.png',
      // (width,height)
      new google.maps.Size(44, 32),
      // The origin point (x,y)
      new google.maps.Point(0, 0),
      // The anchor point (x,y)
      new google.maps.Point(22, 32)),
    end: new google.maps.MarkerImage(
      // URL
      'http://maps.google.com/mapfiles/ms/micons/green.png',
      // (width,height)
      new google.maps.Size(44, 32),
      // The origin point (x,y)
      new google.maps.Point(0, 0),
      // The anchor point (x,y)
      new google.maps.Point(22, 32))
  };
  public isLoading = false;
  public tripForm :any;
  public submitted : boolean = false;
  public tripAddModel = new TripAddModel();
  public tripList :any =  new DriverTripListModel();
  public driverList = new DiverListModel();
  public vehicleList : [] ;
  public driver :string;
  public directionsDisplay :any;
  public endPointLocation:any;
  public startPointLocation :any;
  public mapMarkerList =[];
  public wayPointList =[];
  public currentRouteMapInstance :any;
  public newLocation :any;
  public addNewLocatonLat :any;
  public addNewLocatonLng :any;
  public isAddNewLocation  = false;
  public selectedAddressList = [];
 // form group
 tripListForm = new FormGroup({
  driverTripName: new FormControl()
  });

  get driverTripName() {
    return this.tripListForm.get('driverTripName');
  }

  constructor(public userService:UserService,
    public dataShare :DataSharingService,
    public dialog:MatDialog,
    public authService:AuthenticationService,public router:Router) { }

  ngOnInit() {
    this.getAllPlacesList();
    this.getDriverAndVehicleList();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadGoogleMap();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  loadGoogleMap() {
    var mapProp= {
      center: new google.maps.LatLng(21.7679, 78.8718),
      zoom:5,
      streetViewControl: false,
      fullscreenControl: true,
      draggable : true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.currentRouteMapInstance = new google.maps.Map(document.getElementById("googleMap_trip"),mapProp);
    this.updateDrwaingType();
  }

  toggleDialog() {
 
    this.resetData();
    document.getElementById('addVehicle').classList.toggle('show-dailog');
  }


     /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
    getAllPlacesList() {
      this.isLoading = true;
      this.userService.getDataByUrl('showAllTripData').subscribe((data:any)=>{
        if(data.length>0){
          this.tripList = data;
          this.dataSource = new MatTableDataSource(this.tripList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
         this.isLoading = false;
             //inistialze the fitlers
        this.formSubscribe();
        this.getFormsValue();
        } else{
          this.isLoading = false;
        }
      },  error => {
        this.isLoading = false;
        this.authService.errorToast(error.error.message);
      })
    }


       /*
      Author:Kapil Soni
      Funcion:addDriver
      Summary:addDriver for add driver
      Return list
    */
      addNewTrip(form:any){
        this.tripForm = form;
        this.submitted = true;
          if(form.form.valid){
            if(this.tripAddModel.isActive){
              this.tripAddModel.isActive='active';
            }else{
              this.tripAddModel.isActive='inActive';
            }
            this.isLoading = true;
            console.log(this.tripAddModel);
            this.userService.storeDataToDb(<any>this.tripAddModel,'saveTrip').subscribe((data:any)=>{
              if(data.message){
          
                this.isLoading = false;
                  form.resetForm();
                  form.reset();
                  this.resetDirectionalLine();

                  //dismiss dlalog and get all list
                  this.toggleDialog();
                  this.getAllPlacesList();
              } else{
                this.isLoading = false;
              }
            },  error => {
              this.isLoading = false;
              this.authService.errorToast(error.error.message);
            })
        }
    }

    /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
    getDriverAndVehicleList() {
      this.userService.getMulipleAPIData().subscribe((data:any)=>{
        if(data.length>0){
          this.vehicleList = data[0];
          this.driverList = data[1];
        } else{
          this.isLoading = false;
        }
      },  error => {
        this.isLoading = false;
        this.authService.errorToast(error.error.message);
      })
    }


    updateDataViaKey(value,key):void{
      if(this.vehicleList.length>0){
        if(key == 'vehicle'){
          let data =  (<any>this.vehicleList).find(x=>x.vehicleNumber == value);
          this.tripAddModel.vehicle = data;
        }else{
          let data =  (<any>this.driverList).find(x=>x.firstName == value);
          this.tripAddModel.driver = data;
        }
      }
    }


    public addMoreAddress :any;
    fetchLocationViaKey(pageId){
      var self = this;
      let wayPointList = [];
      var  autocomplete = new google.maps.places.Autocomplete((document.getElementById(pageId)),{ types: ['geocode'] });
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          //hold location via type
          if(pageId == 'autocomplete'){
            self.startPointLocation=autocomplete.getPlace().formatted_address;
            self.tripAddModel.startPoint =self.startPointLocation;


            self.tripAddModel.tripLatLong.push({
              "stop_address":'start',
              "address": self.startPointLocation,
              "destiationLat": autocomplete.getPlace().geometry.location.lat(),
              "destiationLng": autocomplete.getPlace().geometry.location.lng()
            });
          } else if(pageId  == 'autocomplete1'){
            var place = autocomplete.getPlace();
            self.endPointLocation=autocomplete.getPlace().formatted_address;
            self.tripAddModel.endPoint =self.endPointLocation;

            self.tripAddModel.tripLatLong.push({
              "stop_address":'end',
              "address": self.endPointLocation,
              "destiationLat": autocomplete.getPlace().geometry.location.lat(),
              "destiationLng": autocomplete.getPlace().geometry.location.lng()
            });
          } else{
            self.addMoreAddress = autocomplete.getPlace().formatted_address;
            self.addNewLocatonLat = autocomplete.getPlace().geometry.location.lat();
            self.addNewLocatonLng  =  autocomplete.getPlace().geometry.location.lng();
            //check data exist or not..
            let exist = self.tripAddModel.tripLatLong.find(x=>x.address == self.addMoreAddress);
            if(exist == undefined){
              self.tripAddModel.tripLatLong.push({
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
      Funcion:resetData
      Summary:resetData for reset Data
      Return list
    */
      resetData(){
        this.resetDirectionalLine();
        this.resetAllMarkerData();
        this.mapMarkerList=[];
        if(this.tripForm){
          this.tripForm.resetForm();
          this.tripForm.reset();
          this.tripListForm.reset();
        }
        this.submitted ? this.getAllPlacesList() : '';
      }


      drwaLineBetweenLocation(){
        var self = this;
        var directionsService = new google.maps.DirectionsService();
        self.directionsDisplay = new google.maps.DirectionsRenderer();
        self.directionsDisplay.setOptions();
          var myOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
          }
          self.directionsDisplay.setMap(self.currentRouteMapInstance);
          let startLocation = self.tripAddModel.tripLatLong[0].address;
          let endLocation = self.tripAddModel.tripLatLong[self.tripAddModel.tripLatLong.length - 1].address;

         //create the array for lat lng and generate polyline......
         self.selectedAddressList = new Array();
         for(var i=0;i<self.tripAddModel.tripLatLong.length;i++) {
           if(self.tripAddModel.tripLatLong[i].address != startLocation  && self.tripAddModel.tripLatLong[i].address != endLocation) {
             var first = 
               new google.maps.LatLng(Number(self.tripAddModel.tripLatLong[i].destiationLat), Number(self.tripAddModel.tripLatLong[i].destiationLng));
               self.selectedAddressList.push({
                 location: first
               });
           }
         }
         if(self.startPointLocation){
          var request = {
            origin:self.startPointLocation, 
            destination:self.addMoreAddress,
            waypoints: self.selectedAddressList,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
          };
          directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              var leg = response.routes[ 0 ].legs[ 0 ];
              self.directionsDisplay.setDirections(response);
            }
          });
        }
       }

       removeSelectedLocation(location){
        let index = this.tripAddModel.tripLatLong.findIndex(x=>x.address == location.address);
        if(index != -1){
          this.tripAddModel.tripLatLong.splice(index,1);
          this.selectedAddressList.splice(index,1);
          this.drwaLineBetweenLocation();
        }
       }

         /*
          Author:Kapil Soni
          Funcion:getCurrentPlaceDetail
          Summary:getCurrentPlaceDetail for get place detail
          Return list
        */
      getCurrentTripDetail(detail:any,exporter){
        this.dataShare.updatedData.next(exporter);  
        this.router.navigate(['/user/trip/detail'], <any>{state: {data: detail,vehicleList: this.vehicleList,driverList: this.driverList}});
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
        if(confirmed && value.id){
          this.userService.deleteDataFromDb(value.id,'deleteTripByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              const index = this.dataSource.data.findIndex(x=>x.id == value.id);
              this.dataSource.data.splice(index, 1);
              this.dataSource._updateChangeSubscription();
            }
          }, error => {
            this.isLoading = false;
            this.authService.errorToast(error.error.message);
          })
        }
      });
    }

    resetDirectionalLine(){
      // Clear past routes
      if(this.directionsDisplay != null) {
        this.directionsDisplay.setMap(null);
        this.directionsDisplay = null;
      }
    }

    // makeMarker(position, icon, title, map) {
    // var marker :any;
    //   if(this.dynamicallyWaypoints.length > 0){
    //      marker   = new google.maps.Marker({
    //       position:position,
    //       map:map,
    //     })
    //   }else{
    //     marker =  new google.maps.Marker({
    //       position: position,
    //       map: map,
    //       icon: icon,
    //       title: title
    //     });
    //   }
    //   this.mapMarkerList.push(marker);
    //     marker.addListener("click", () => {
    //     map.setCenter(marker.getPosition());

    //     var geocoder = geocoder = new google.maps.Geocoder();
    //     var latlng = new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
    //     geocoder.geocode({ 'latLng': latlng }, function (results, status) {
    //         if (status == google.maps.GeocoderStatus.OK) {
    //             if (results[1]) {
    //                 var infowindow = new google.maps.InfoWindow();
    //                 infowindow.setContent( results[1].formatted_address);
    //                 infowindow.open( results[1].formatted_address, marker);
    //             }
    //         }
    //     });
    //   });
    // }


    formSubscribe() {
      this.driverTripName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['tripName'] = positionValue;
        this.filteredValues['driverName'] = positionValue;
        this.filteredValues['vehicleNumer'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        const firstName = data.driver.firstName;
       const vehicleNumber =  data.vehicle.vehicleNumber;
        let searchString = JSON.parse(filter);
        const resultValue =
          data.tripName.toString().trim().toLowerCase().indexOf(searchString.tripName != null ? searchString.tripName.toLowerCase() : '') !== -1
          firstName.toString().trim().toLowerCase().indexOf(searchString.driverName != null ? searchString.driverName.toLowerCase() : '') !== -1 ||
          vehicleNumber.toString().indexOf(searchString.vehicleNumer != null ? searchString.vehicleNumer : '') !== -1;
        return resultValue;
      };
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

        /*
    Author:Kapil Soni
    Funcion:updateDrwaingType
    Summary:updateDrwaingType for update type
    Return list
  */
  updateDrwaingType(){
    this.deleteAllShape();
    this.deleteSelectedShape();
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
        fillColor: "#FF0000",
        fillOpacity: 0.2,
        strokeWeight: 0.2,
        zIndex: 1,
      },
    });
    drawingManager.setMap(this.currentRouteMapInstance);

    var self = this;
    self.drawingToolInstance = drawingManager;
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
        self.tripAddModel.tripGeofence.push({
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
        self.tripAddModel.tripGeofence.push({
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
        self.tripAddModel.tripGeofence.push({
          "type":'polyline',
          "radius": '',
          "data": self.selectedLatLngList
        })
      }
    });
  }

  resetAllMarkerData(){
      this.deleteAllShape();
      this.deleteSelectedShape();
  }

  deleteAllShape() {
    for (let i = 0; i < this.mapMarkerList.length; i++) {
      this.mapMarkerList[i].setMap(null);
    }
    for (var i = 0; i < this.allOverlayList.length; i++) {
      this.allOverlayList[i].overlay.setMap(null);
    }
    this.allOverlayList = [];
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

  addLocation(){
     this.drwaLineBetweenLocation();
  }
}
