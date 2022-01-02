import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Dashboard01Component } from './dashboard01/dashboard01.component';
import { Dashboard02Component } from './dashboard02/dashboard.component';
import { DriverComponent } from './driver.component';

const routes: Routes = [
  { 
    path: '', 
    component: DriverComponent,
    children:[
      {path:'',component:DashboardComponent},
      {path:'dashboard',component:DashboardComponent},
      { path: 'dashboard01', component: Dashboard01Component },
      { path: 'dashboard02', component: Dashboard02Component },
      { path: 'driver', loadChildren: () => import('./driver-list/driver.module').then(m => m.DriverDemoModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
