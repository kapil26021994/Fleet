import { Component, OnInit } from '@angular/core';

declare var google;
@Component({
  selector: 'app-vehicle-location',
  templateUrl: './vehicle-location.component.html',
  styleUrls: ['./vehicle-location.component.scss']
})
export class VehicleLocationComponent implements OnInit {
  public currentVehicleLocation :any;
  constructor() { }

  ngOnInit(): void {
    if(history.state.data){
      this.currentVehicleLocation = history.state.data;
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      this.currentVehicleLocation = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }
  
//   ngAfterViewInit(): void {
//     this.loadGoogleMap();
//   }

// loadGoogleMap() {
//   var mapProp= {
//     center:new google.maps.LatLng(20.5937,-78.9629),
//     zoom:5,
//   };
//   var map = new google.maps.Map(document.getElementById("vehicleLocation"),mapProp);
// }
}
