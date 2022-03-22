import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionManagmentComponent } from './permission-managment.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PermissioManagmentDetailComponent } from './permission-managment-detail/permission-managment-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: PermissionManagmentComponent },
  { path: 'detail', component: PermissioManagmentDetailComponent },
]
@NgModule({
  declarations: [PermissionManagmentComponent, PermissioManagmentDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PermissionManagmentModule { }
