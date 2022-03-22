import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { DriverlistComponent } from './driver-list.component';
import { EditDriverComponent } from './edit-driver/edit-driver.component';
import{SharedModule} from '../../../shared/module/shared.module'
const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: DriverlistComponent },
  { path: 'edit', component: EditDriverComponent }
]

@NgModule({
  declarations: [DriverlistComponent, EditDriverComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ChartsModule,
    SharedModule
  ]
})
export class DriverDemoModule { }
