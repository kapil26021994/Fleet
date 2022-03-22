import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGroupComponent } from './user-group.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { UserGroupDetailComponent } from './user-group-detail/user-group-detail.component';


const routes: Routes = [
  { path: '',  component: UserGroupComponent },
  { path: 'group', component: UserGroupComponent },
  { path: 'detail', component: UserGroupDetailComponent },
]
@NgModule({
  declarations: [UserGroupComponent, UserGroupDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class UserGroupModule { }
