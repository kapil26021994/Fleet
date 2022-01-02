import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModule } from '../../core/layout/layout.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    LayoutModule
  ]
})
export class SharedModule { }
