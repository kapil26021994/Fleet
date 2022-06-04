import { Component, OnInit ,ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{RouteListModel} from 'src/app/core/models/driver/route-list.model';
import{RouteAddModel} from 'src/app/core/models/driver/route-add.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';
import{VehicleAdd} from 'src/app/core/models/driver/vehicle-add.model';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';


declare var google;
@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss']
})
export class TripListComponent implements OnInit {
  displayedColumns: string[] = ['createDateTime', 'startPoint', 'endPoint','active','action'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel(true, []);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  types:any = ["Car", "Truck", "Bus"];
  filteredValues =  {startPoint: '',endpoint:''};
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
  public tripAddModel = new RouteAddModel();
  public tripList :any =  new RouteListModel();
  public driverList = new DiverListModel();
  public vehicleList : [] ;
  public driver :string;
  public directionsDisplay :any;
  public endPointLocation:any;
  public startPointLocation :any;
  public mapMarkerList =[];
  public wayPointList =[];
  public currentRouteMapInstance :any;
 // form group
 routeListForm = new FormGroup({
    placeName: new FormControl()
  });

  get placeName() {
    return this.routeListForm.get('placeName');
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
      gestureHandling: 'greedy'
    };
    this.currentRouteMapInstance = new google.maps.Map(document.getElementById("googleMap"),mapProp);
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
      this.userService.getDataByUrl('showAllRouteData').subscribe((data:any)=>{
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
          this.userService.storeDataToDb(<any>this.tripAddModel,'saveRoute').subscribe((data:any)=>{
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

    public dynamicallyWaypoints =[];
    fetchLocationViaKey(pageId){
      var self = this;
      let wayPointList = [];
      var  autocomplete = new google.maps.places.Autocomplete((document.getElementById(pageId)),{ types: ['geocode'] });
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          //hold location via type
          if(pageId == 'autocomplete'){
            self.startPointLocation=autocomplete.getPlace().formatted_address;
            self.tripAddModel.startPoint =self.startPointLocation;

            //startPointLocation exist or not...
            if(self.startPointLocation == undefined){
              self.startPointLocation=autocomplete.getPlace().formatted_address;
            }else{
              self.startPointLocation = '';
              self.resetData();
              self.startPointLocation=autocomplete.getPlace().formatted_address;
            }
          } else if(pageId  == 'autocomplete1'){
            var place = autocomplete.getPlace();
            
            //startPointLocation exist or not...
            if(self.endPointLocation == undefined){
              self.endPointLocation=autocomplete.getPlace().formatted_address;
            }else{
              self.endPointLocation = '';
              self.resetData();
              self.endPointLocation=autocomplete.getPlace().formatted_address;
            }

            self.tripAddModel.endpoint =self.endPointLocation;
          } else{
            var place = autocomplete.getPlace();
            let addMoreAddress = autocomplete.getPlace().formatted_address;
          }
            self.drwaLineBetweenLocation();
        });
      }

          /*
      Author:Kapil Soni
      Funcion:resetData
      Summary:resetData for reset Data
      Return list
    */
      resetData(){
        this.resetAllMarkerData();
        this.resetDirectionalLine();
        if(this.tripForm){
          this.tripForm.resetForm();
          this.tripForm.reset();
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
      
          var request = {
            origin:self.startPointLocation, 
            destination:self.endPointLocation,
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

         /*
          Author:Kapil Soni
          Funcion:getCurrentPlaceDetail
          Summary:getCurrentPlaceDetail for get place detail
          Return list
        */
      getCurrentTripDetail(detail:any,exporter){
        this.dataShare.updatedData.next(exporter);  
        this.router.navigate(['/user/route/detail'], <any>{state: {data: detail,vehicleList: this.vehicleList,driverList: this.driverList}});
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
          this.userService.deleteDataFromDb(value.id,'deleteRouteByID').subscribe((data:any)=>{
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

    formSubscribe() {
      this.placeName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['placeName'] = positionValue;
        this.filteredValues['startPoint'] = positionValue;
        this.filteredValues['endPoint'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        let searchString = JSON.parse(filter);
        const resultValue =
        data.startPoint.toString().trim().toLowerCase().indexOf(searchString.startPoint != null ? searchString.startPoint.toLowerCase() : '') !== -1 ||
        data.endpoint.toString().trim().toLowerCase().indexOf(searchString.endPoint != null ? searchString.endPoint.toLowerCase() : '') !== -1;
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
        strokeWeight: 0.2
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
          "lat":lat,
          "lng": lng
        })
        self.tripAddModel.routeGeofence.push({
          "type":'Circle',
          "radius": event.overlay.getRadius(),
          "data": self.selectedLatLngList
        })
        self.selectedLatLngList =[];
      }
      if(event.type == 'polygon') {
        var coords = event.overlay.getPath().getArray();
        for(var i=0;i<coords.length;i++){
          let list=[];
          list.push({ 
            "lat": coords[i].lat(),
            "lng": coords[i].lng()
          })
          console.log(list);
        }
          for(var i=0;i<coords.length;i++){
            let matched =self.selectedLatLngList.find(x=>x.lat == coords[i].lat() && x.lng == coords[i].lng());
            if(matched == undefined){
              self.selectedLatLngList.push({ 
                "lat": coords[i].lat(),
                "lng": coords[i].lng()
              })
            }
            console.log(self.selectedLatLngList);
          }
          self.tripAddModel.routeGeofence.push({
            "type":event.type,
            "radius": '',
            "data": self.selectedLatLngList
          })
          coords =[];
          self.selectedLatLngList =[];
      }
      if(event.type == 'polyline') {
        var polylineCoords = event.overlay.getPath().getArray();
        for(var i=0;i<polylineCoords.length;i++){
          self.selectedLatLngList.push({ 
            "lat": polylineCoords[i].lat(),
            "lng": polylineCoords[i].lng()
          })
        }
        self.tripAddModel.routeGeofence.push({
          "type":'polyline',
          "radius": '',
          "data": self.selectedLatLngList
        })
        self.selectedLatLngList=[];
        polylineCoords =[];
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
}
