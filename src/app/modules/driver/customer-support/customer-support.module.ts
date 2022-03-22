import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerSupportComponent } from './customer-support.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CustomerSupportDetailComponent } from '../customer-support/customer-support-detail/customer-support-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: CustomerSupportComponent },
  { path: 'detail', component: CustomerSupportDetailComponent },
]
@NgModule({
  declarations: [CustomerSupportComponent, CustomerSupportDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class CustomerSupportModule { }
