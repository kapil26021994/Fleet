import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DriverComponent } from './driver.component';
import { MapComponent } from '../../shared/components/map/map.component';
import { UserAuthGuard } from 'src/app/core/guards/user-auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: DriverComponent,
    canActivate:[UserAuthGuard],
    canActivateChild:[UserAuthGuard],
    children:[
      {path:'',redirectTo:'dashboard',pathMatch:'full'},
      {path:'dashboard',component:DashboardComponent},
      {path:'company',loadChildren: () => import('./company-managment/company-managment.module').then(m => m.CompanyManagmentModule)},
      { path: 'driver', loadChildren: () => import('./driver-list/driver.module').then(m => m.DriverDemoModule) },
      { path: 'vehicle', loadChildren: () => import('./vehicle-list/vehicle.module').then(m => m.VehicleDemoModule) },
      { path: 'places', loadChildren: () => import('./places-list/places-list.module').then(m => m.PlacesListModule) },
      { path: 'route', loadChildren: () => import('./trip-list/trip-list.module').then(m => m.TripListModule) },
      { path: 'trip', loadChildren: () => import('./trip/trip.module').then(m => m.TripModule) },
      { path: 'sim', loadChildren: () => import('./sim-card/sim-card.module').then(m => m.SimCardModule) },
      { path: 'device', loadChildren: () => import('./device-managment/device-managment.module').then(m => m.DeviceManagmentModule) },
      { path: 'group', loadChildren: () => import('./user-group/user-group.module').then(m => m.UserGroupModule) },
      { path: 'management', loadChildren: () => import('./user-managment/user-managment.module').then(m => m.userManagmentModule) },
      { path: 'alert', loadChildren: () => import('./alert-managment/alert-managment.module').then(m => m.AlertManagmentModule) },
      { path: 'permission', loadChildren: () => import('./permission-managment/permission-managment.module').then(m => m.PermissionManagmentModule) },
      { path: 'customer-support', loadChildren: () => import('./customer-support/customer-support.module').then(m => m.CustomerSupportModule) },
      { path: 'map', component:MapComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
