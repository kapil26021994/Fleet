import { Component, OnInit ,ViewChild} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{PlaceListModel} from 'src/app/core/models/driver/place-list.model';
import{PlaceAddModel} from 'src/app/core/models/driver/place-add.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

declare var google;
@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss']
})
export class PlacesListComponent implements OnInit {

  contactForm : FormGroup;
  public placesList = new PlaceListModel();
  public placesAddModel = new PlaceAddModel();
  displayedColumns: string[] = ['placeName', 'description', 'address','action'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel(true, []);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public isLoading :boolean = false;
  public submitted : boolean = false;
  public geoFenceList = [];
  public startLocation :any;
  public endLocation :any;
  public allOverlayList =[];
  public placeMapInstance:any;
  public circleInstance :any;
  public selectedLatLngList =[];
  drwaingTypeList  = ['Polygon','Reactangle','Circle','Polyline']

  toggleDialog(event) {
    this.resetData();
    document.getElementById('addPlaceForm').classList.toggle('show-dailog');
  }
  checked = false;
  indeterminate = false;
  types:any = ["Car", "Truck", "Bus"];
  filteredValues =  {placeName: '',geoFence:[]};

  public driverForm : any;
  public selectedShape :any;
  public drawingToolInstance :any;
 // form group
 placeListForm = new FormGroup({
  placeName: new FormControl(),
  geoFence: new FormControl()
});


get placeName() {
  return this.placeListForm.get('placeName');
}

get geoFence() {
  return this.placeListForm.get('geoFence');
}

  constructor(public userService:UserService,
    public dialog:MatDialog,
    public authService:AuthenticationService,public router:Router,public dataShare:DataSharingService) { }

  ngOnInit() {
    this.getAllPlacesList();
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

    /*
      Author:Kapil Soni
      Funcion:loadGoogleMap
      Summary:loadGoogleMap for get load map
      Return list
    */
    loadGoogleMap() {
      if(document.getElementById("googleMapPlace") != null){
        this.placeMapInstance = new google.maps.Map(document.getElementById("googleMapPlace"), {
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
        this.updateDrwaingType();
      }
    } 

      /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
    getAllPlacesList() {
      this.isLoading = true;
      this.userService.getDataByUrl('showAllPlaceData').subscribe((data:any)=>{
        if(data.length>0){
          this.placesList = data;
          this.dataSource = new MatTableDataSource(<any>this.placesList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
          let geoFenceList = this.dataSource.filteredData.map(x=>x.geoFence);
          this.geoFenceList =  Array.from(new Set(geoFenceList));
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
      addNewPlace(form:any){
        this.driverForm = form;
        this.submitted = true;
        if(form.form.valid){
          this.isLoading = true;
          if(this.placesAddModel.isActive){
            this.placesAddModel.isActive='active';
          }else{
            this.placesAddModel.isActive='inActive';
          }
          this.userService.storeDataToDb(<any>this.placesAddModel,'savePlace').subscribe((data:any)=>{
            if(data.message){
              this.isLoading = false;
              form.resetForm();
                form.reset();
  
                //dismiss dlalog and get all list
                this.toggleDialog('');
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
      Funcion:resetData
      Summary:resetData for reset Data
      Return list
    */
      resetData(){
        this.deleteAllShape();
        this.deleteSelectedShape();
        if(this.driverForm){
          this.driverForm.resetForm();
          this.driverForm.reset();
        }
      }

      /*
      Author:Kapil Soni
      Funcion:getCurrentPlaceDetail
      Summary:getCurrentPlaceDetail for get place detail
      Return list
    */
      getCurrentPlaceDetail(detail:any,exporter){
        this.dataShare.updatedData.next(exporter);  
        this.router.navigate(['/user/places/detail'], <any>{state: {data: detail}});
      }

      /*
      Author:Kapil Soni
      Funcion:deletePlace
      Summary:deletePlace for delete vehicle
      Return list
    */
      deletePlace(value){
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
          this.userService.deleteDataFromDb(value.id,'deletePlaceByID').subscribe((data:any)=>{
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

    formSubscribe() {
      this.placeName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['placeName'] = positionValue;
        this.filteredValues['address'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.geoFence.valueChanges.subscribe((positionValue) => {
        this.filteredValues['geoFence'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        let searchString = JSON.parse(filter);
        let isPositionAvailable = false;
        if (searchString.geoFence && searchString.geoFence.length) {
          for (const d of searchString.geoFence) {
            if (data.geoFence.trim() === d) {
              isPositionAvailable = true;
            }
          }
        } else {
          isPositionAvailable = true;
        }
        const resultValue =
          isPositionAvailable  &&
          data.placeName.toString().trim().toLowerCase().indexOf(searchString.placeName != null ? searchString.placeName.toLowerCase() : '') !== -1 ||
          data.address.toString().trim().toLowerCase().indexOf(searchString.address != null ? searchString.address.toLowerCase() : '') !== -1;;
        return resultValue;
      };
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    }

  fetchStartLocation(){
    var self = this;
    var  autocomplete = new google.maps.places.Autocomplete((document.getElementById('placeAutocomplete')),{ types: ['geocode'] });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {

        var place = autocomplete.getPlace();
        self.startLocation = place.geometry.location.lat();
        self.endLocation = place.geometry.location.lng();
          self.placesAddModel.address =autocomplete.getPlace().formatted_address;
          self.drwapMarker();
      });
    }

    drwapMarker(){
      var self =this;
      var infowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();
          var position = new google.maps.LatLng(self.startLocation, self.endLocation);
        let mapMarker = new google.maps.Marker({
          position: position,
          strokeColor: '#40710C',
          map: self.placeMapInstance,  
          title: 'HI!! HI´M HERE!',
        });
      self.placeMapInstance.setCenter(position);
    }

  deleteAllShape() {
    for (var i = 0; i < this.allOverlayList.length; i++) {
      this.allOverlayList[i].overlay.setMap(null);
    }
    this.allOverlayList = [];
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

    var selectedDrawLine :any;
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
        strokeWeight: 0.2
      },
    });
    drawingManager.setMap(this.placeMapInstance);

    var self = this;
    self.drawingToolInstance=drawingManager;
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event:any) {
      var newShape = event.overlay;
      newShape.type = event.type;
      self.selectedShape= newShape;
      self.allOverlayList.push(event);

      if(self.allOverlayList.length == 2){
        self.deleteMarkr(newShape.type);
      }
      
      if (event.type == 'circle') {
        var bounds = event.overlay.getBounds();
        let lat  = event.overlay.getCenter().lat();
        let lng = event.overlay.getCenter().lng();
        self.assignSelectedDataInArray(event,'Circle',event.overlay.getRadius(),lat,lng);
      }
    
      if(event.type == 'polygon') {
        const coords = event.overlay.getPath().getArray();
        for(var i=0;i<coords.length;i++){
          self.selectedLatLngList.push({ 
            "lat": coords[i].lat(),
            "lng": coords[i].lng()
          })
        }
        self.placesAddModel.geofence.push({
          "type":event.type,
          "radius": '',
          "data": coords
        })
        console.log(this.placesAddModel.geofence)
      }

      if(event.type == 'polyline') {
        const coords = event.overlay.getPath().getArray();
        for(var i=0;i<coords.length;i++){
          self.selectedLatLngList.push({ 
            "lat": coords[i].lat(),
            "lng": coords[i].lng()
          })
        }
        self.placesAddModel.geofence.push({
          "type":'polyline',
          "radius": '',
          "data": self.selectedLatLngList
        })
        console.log(this.placesAddModel.geofence)
      }
      if(event.type == 'rectangle') {
        var boundsReact = event.overlay.getBounds();
        self.selectedLatLngList.push({ 
          "lat": self.startLocation,
          "lng": self.endLocation
        })
        let bounds = {
          north: boundsReact.getNorthEast().lat(),
          south: boundsReact.getNorthEast().lng(),
          east: boundsReact.getSouthWest().lat(),
          west: boundsReact.getSouthWest().lng()
        };
        
        self.placesAddModel.geofence.push({
          "type":'rectangle',
          "radius": '',
          "data": self.selectedLatLngList,
          "bounds": [bounds]
        })
      }

        // Add an event listener that selects the newly-drawn shape when the user
      // mouses down on it.
      var newShape = event.overlay;
      newShape.type = event.type;
    });
  }


   deleteSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
    }
  }

   /*
      Author:Kapil Soni
      Funcion:assignSelectedDataInArray
      Summary:assignSelectedDataInArray for holde arrray
      Return list
    */
  assignSelectedDataInArray(event,type,radius,lat,lng){
    this.selectedLatLngList.push({ 
      "lat":lat,
      "lng": lng
    })
    this.placesAddModel.geofence.push({
      "type":type,
      "radius": radius,
      "data": this.selectedLatLngList
    })
  }

  deleteMarkr(type){
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        isDelete:true,
        message: 'Previous shape will be erased',
        buttonText: {
          ok: 'Erase'
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if(confirmed){
        this.allOverlayList[0].overlay.setMap(null);
        this.allOverlayList.splice(0,1);
        this.placesAddModel.geofence.splice(0,1);
        this.selectedLatLngList=[];
      }
    });
  }
}


