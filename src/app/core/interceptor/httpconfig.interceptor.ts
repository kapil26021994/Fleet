import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import{map} from 'rxjs/operators';
import{AuthenticationService} from '../../core/services/authentication/authentication.service';
import{LoaderService} from '../../core/services/loader/loader.service';
import { finalize } from "rxjs/operators";
import{Router} from '@angular/router';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(public authService:AuthenticationService,public loaderService:LoaderService,public router:Router){
    }
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken()
        if(token) {
            //const Id =   this.authService.getLoggedInUser() != null ?  this.authService.getLoggedInUser().id.toString() : '';
             request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + this.authService.getToken()) });
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
            // request = request.clone({ headers: request.headers.set('userId', Id)}); 
         }
        return next.handle(request).pipe(map((event: HttpEvent<any>) => {
            if(event instanceof HttpResponse) {
            }
            return event;
        }));
    }
}
  