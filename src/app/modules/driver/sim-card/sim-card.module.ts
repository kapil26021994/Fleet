import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimCardComponent } from './sim-card.component';
import { RouterModule, Routes } from '@angular/router';
import{SharedModule} from '../../../shared/module/shared.module';
import { SimCardDetailComponent } from './sim-card-detail/sim-card-detail.component'

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: SimCardComponent },
  { path: 'detail', component: SimCardDetailComponent }
]
@NgModule({
  declarations: [SimCardComponent, SimCardDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class SimCardModule { }
