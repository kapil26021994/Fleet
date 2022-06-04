import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModule } from '../../core/layout/layout.module';
import { SpinnerComponent } from '../spinner/spinner.component';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTableModule } from '@angular/material/table'  
import {MatSortModule} from '@angular/material/sort';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {MatPaginatorModule } from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'
import {MatBadgeModule} from '@angular/material/badge';
import { ToastrModule } from 'ngx-toastr';
import { HttpConfigInterceptor } from '../../core/interceptor/httpconfig.interceptor';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MapComponent } from '../components/map/map.component';
import { DownloadContentComponent } from '../components/download-content/download-content.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatTableExporterModule } from 'mat-table-exporter';
import { ConfirmationDialog } from '../components/confirmation-dialog/confirmation-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { IsDisabledPipePipe } from '../pipe/is-disabled-pipe.pipe';

@NgModule({
  declarations: [SpinnerComponent,MapComponent,DownloadContentComponent,ConfirmationDialog,IsDisabledPipePipe],
  entryComponents: [ConfirmationDialog],
  imports: [
    RouterModule,
    NgbModule,
    CommonModule,
    LayoutModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatSlideToggleModule,
    HttpClientModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,    
    MatNativeDateModule,
    MatDialogModule,
    MatTooltipModule,    
    MatChipsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    MatTableExporterModule
  ],
  exports:[SpinnerComponent,FormsModule,MatInputModule,
    HttpClientModule,
    MatPaginatorModule ,
    MatSortModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MapComponent,
    DownloadContentComponent,
    CommonModule,
    MatDatepickerModule,    
    MatTooltipModule,
    MatTableExporterModule,
    MatDialogModule,
    ConfirmationDialog,
    MatChipsModule,
    MatNativeDateModule, 
    IsDisabledPipePipe,  
    ReactiveFormsModule],
    providers: [
      DatePipe,
     { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
    ]
})
export class SharedModule { }
