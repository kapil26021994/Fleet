import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss'],
})
export class DriverlistComponent implements OnInit {

  toggleDialog(event) {
    console.log("123");
    event.preventDefault();
    document.getElementById('addDriver').classList.toggle('show-dailog');
  }

  constructor() { }

  ngOnInit() {
  }

  date: Date = new Date();

}
