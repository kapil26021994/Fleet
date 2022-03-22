import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceManagmentComponent } from './device-managment.component';
import { RouterModule, Routes } from '@angular/router';
import{SharedModule} from '../../../shared/module/shared.module';
import { DeviceManagmentDetailComponent } from './device-managment-detail/device-managment-detail.component'

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: DeviceManagmentComponent },
  { path: 'detail', component: DeviceManagmentDetailComponent }
]
@NgModule({
  declarations: [DeviceManagmentComponent, DeviceManagmentDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class DeviceManagmentModule { }
