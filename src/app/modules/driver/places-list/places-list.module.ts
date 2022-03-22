import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PlacesListComponent } from './places-list.component';
import { PlacesDetailComponent } from './places-detail/places-detail.component';
import{SharedModule} from '../../../shared/module/shared.module'
const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: PlacesListComponent },
  { path: 'detail', component: PlacesDetailComponent }
]
@NgModule({
  declarations: [PlacesListComponent, PlacesDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class PlacesListModule { }
