import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserReportComponent } from './user-report.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { StoppageReportComponent } from './stoppage-report/stoppage-report.component';
import { RawDetailComponent } from './raw-detail/raw-detail.component';
import { SpeedReportComponent } from './speed-report/speed-report.component';
import { VehiclePerformanceComponent } from './vehicle-performance/vehicle-performance.component';
import { VehicleLogComponent } from './vehicle-log/vehicle-log.component';
import { TripSummaryComponent } from './trip-summary/trip-summary.component';
import { TripSummaryTimeComponent } from './trip-summary-time/trip-summary-time.component';
import { EventLogComponent } from './event-log/event-log.component';
import { KmsSummaryReportComponent } from './kms-summary-report/kms-summary-report.component';

const routes: Routes = [
  { path: '', redirectTo: '/user/report/stoppage-report',
  pathMatch: 'full'},
  { path: 'raw-Details',  component: UserReportComponent },
  { path: 'stoppage-report',  component: StoppageReportComponent },
  { path: 'speed-report',  component: SpeedReportComponent },
  { path: 'vehicle-performance',  component: VehiclePerformanceComponent },
  { path: 'vehicle-log',  component: VehicleLogComponent },
  { path: 'trip-summary',  component: TripSummaryComponent },
  { path: 'trip-summary-time',  component: TripSummaryTimeComponent },
  { path: 'event-log',  component: EventLogComponent },
  { path: 'kms-summary-report',  component: KmsSummaryReportComponent },
]
@NgModule({
  declarations: [UserReportComponent, StoppageReportComponent, RawDetailComponent, SpeedReportComponent, VehiclePerformanceComponent, VehicleLogComponent, TripSummaryComponent, TripSummaryTimeComponent, EventLogComponent, KmsSummaryReportComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class UserReportModule { }
