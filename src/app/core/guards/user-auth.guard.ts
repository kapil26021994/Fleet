import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild,Router } from '@angular/router';
import{AuthenticationService} from '../../core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserAuthGuard implements CanActivate,CanActivateChild {
  constructor(public _authService: AuthenticationService,public router:Router){
  }

  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot) {
    return this.checkUserIsLoggedInOrNot();
  }

  canActivateChild(route: ActivatedRouteSnapshot,state: RouterStateSnapshot) {
    return this.checkUserIsLoggedInOrNot();
  }

  checkUserIsLoggedInOrNot(){
    const isLogin = this._authService.getToken();
    if(isLogin){
      return  true;
    }else{
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
