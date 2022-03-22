import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagmentComponent } from './user-managment.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { UserManagmentDetailComponent } from '../user-managment/user-managment-detail/user-managment-detail.component';

const routes: Routes = [
  { path: '',  component: UserManagmentComponent },
  { path: 'group', component: UserManagmentComponent },
  { path: 'detail', component: UserManagmentDetailComponent },
]
@NgModule({
  declarations: [UserManagmentComponent, UserManagmentDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class userManagmentModule { }
