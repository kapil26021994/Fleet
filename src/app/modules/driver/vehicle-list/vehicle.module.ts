import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { VehiclelistComponent } from './vehicle-list.component';
import { EditVehicleComponent } from './edit-vehicle/edit-vehicle.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { VehicleLocationComponent } from './vehicle-location/vehicle-location.component'

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: VehiclelistComponent },
  { path: 'detail', component: EditVehicleComponent },
  { path: 'location', component: VehicleLocationComponent },
]

@NgModule({
  declarations: [VehiclelistComponent, EditVehicleComponent, VehicleLocationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ChartsModule,
    SharedModule
  ],
  
})
export class VehicleDemoModule { }
