import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { ContentAnimateDirective } from './shared/directives/content-animate.directive';
import{LayoutModule} from './core/layout/layout.module';
import{SharedModule} from './shared/module/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    ContentAnimateDirective
  ],
  imports: [
    AppRoutingModule,
    ChartsModule,
    LayoutModule,
    SharedModule,
    BrowserAnimationsModule,
    BrowserModule
  ],
  providers: [ThemeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
