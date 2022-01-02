import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'demo1';

  showSidebar: boolean = true;
  showNavbar: boolean = true;
  showFooter: boolean = true;
  isLoading: boolean;

  constructor(private router: Router) {
  }



  ngOnInit() {
    // Scroll to top after route change
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });
  }
}
