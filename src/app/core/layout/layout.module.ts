import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [NavbarComponent,FooterComponent,SidebarComponent],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    NgbDropdownModule
  ],
  exports:[
    NavbarComponent,FooterComponent,SidebarComponent
  ]
})
export class LayoutModule { }
