import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertManagmentComponent } from './alert-managment.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AlertManagmentDetailComponent } from '../alert-managment/alert-managment-detail/alert-managment-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: AlertManagmentComponent },
  { path: 'detail', component: AlertManagmentDetailComponent },
]
@NgModule({
  declarations: [AlertManagmentComponent, AlertManagmentDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AlertManagmentModule { }
