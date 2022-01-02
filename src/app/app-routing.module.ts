import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: '/user', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: 'user', loadChildren: () => import('./modules/driver/driver.module').then(m => m.DriverModule) },
  // { path: 'dashboard', component: DashboardComponent },
  // { path: 'dashboard01', component: Dashboard01Component },
  // { path: 'dashboard02', component: Dashboard02Component },
  // { path: 'driver', loadChildren: () => import('./driver-list/driver.module').then(m => m.DriverDemoModule) },
  
  // theme URLs
  // { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsDemoModule) },
  // { path: 'forms', loadChildren: () => import('./forms/form.module').then(m => m.FormModule) },
  // { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  // { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
  // { path: 'general-pages', loadChildren: () => import('./general-pages/general-pages.module').then(m => m.GeneralPagesModule) },
  // { path: 'user-pages', loadChildren: () => import('./user-pages/user-pages.module').then(m => m.UserPagesModule) },
  // { path: 'error-pages', loadChildren: () => import('./error-pages/error-pages.module').then(m => m.ErrorPagesModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
