import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import{HttpClient} from   '@angular/common/http';
import{BehaviorSubject} from  'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public dataSource = new BehaviorSubject<any>(this.getLoggedInUser());
  constructor(
    public http:HttpClient,
    public toastr: ToastrService) { }

  successToast(message) {
    this.toastr.success(message);
  }

  errorToast(message) {
    this.toastr.error(message);
  }

   getLoggedInUser() {
        const data = localStorage.getItem('user-data');
        return JSON.parse(data);
    }

    getToken(){
      const userData = this.getLoggedInUser();
      return userData && userData['accessToken'];
    }
    
    getUserId(){
      const userData = this.getLoggedInUser();
      return userData && userData['id'];
    }

    saveDataInSession(data) {
      localStorage.setItem('user-data',JSON.stringify(data));
  }
}
