import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Dashboard01Component } from './dashboard01/dashboard01.component';
import { Dashboard02Component } from './dashboard02/dashboard.component';
import { DriverRoutingModule } from './driver-routing.module';
import { DriverComponent } from './driver.component';
import { SharedModule } from '../../shared/module/shared.module';
import { LayoutModule } from '../../core/layout/layout.module';


@NgModule({
  declarations: [DashboardComponent,Dashboard01Component,Dashboard02Component, DriverComponent],
  imports: [
    CommonModule,
    DriverRoutingModule,
    SharedModule,
    LayoutModule
  ]
})
export class DriverModule { 
}
