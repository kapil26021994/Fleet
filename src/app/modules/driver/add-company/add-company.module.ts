import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddCompanyComponent } from './add-company.component';
import{SharedModule} from '../../../shared/module/shared.module'

const routes: Routes = [
  { path: '',component:AddCompanyComponent},
]

@NgModule({
  declarations: [AddCompanyComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AddCompanyModule { }
