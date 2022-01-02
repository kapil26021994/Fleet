import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { LayoutModule } from './core/layout/layout.module';
import { SharedModule } from './shared/module/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    LayoutModule,
    SharedModule
  ],
  providers: [ThemeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
