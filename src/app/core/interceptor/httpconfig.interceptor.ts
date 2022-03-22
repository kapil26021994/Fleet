import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import{map} from 'rxjs/operators';
import{AuthenticationService} from '../../core/services/authentication/authentication.service';
import{LoaderService} from '../../core/services/loader/loader.service';
import { finalize } from "rxjs/operators";

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(public authService:AuthenticationService,public loaderService:LoaderService){
    }
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken()
        if(token) {
             request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + this.authService.getToken()) });
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
         }
        return next.handle(request).pipe(map((event: HttpEvent<any>) => {
            if(event instanceof HttpResponse) {
            }
            return event;
        }));
    }
}
  