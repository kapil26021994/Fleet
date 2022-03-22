import { NgModule } from '@angular/core';
import { FormGroup,FormGroupDirective ,FormControl  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompanyManagmentComponent } from './company-managment.component';
import{SharedModule} from '../../../shared/module/shared.module';
import { RouterModule, Routes } from '@angular/router';

import { CompanyManagmentDetailComponent } from '../company-managment/company-managment-detail/company-managment-detail.component';

const routes: Routes = [
  { path: '',  component: CompanyManagmentComponent },
  { path: 'company', component: CompanyManagmentComponent },
  { path: 'detail', component: CompanyManagmentDetailComponent },
]
@NgModule({
  declarations: [CompanyManagmentComponent, CompanyManagmentDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers:[FormGroupDirective]
})
export class CompanyManagmentModule { }
