import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DriverRoutingModule } from './driver-routing.module';
import { DriverComponent } from './driver.component';
import { SharedModule } from '../../shared/module/shared.module';
import { LayoutModule } from '../../core/layout/layout.module';

@NgModule({
  declarations: [DashboardComponent, DriverComponent],
  imports: [
    CommonModule,
    DriverRoutingModule,
    SharedModule,
    LayoutModule
  ]
})
export class DriverModule { 
}
