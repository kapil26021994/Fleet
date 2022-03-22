import { Component, OnInit } from '@angular/core';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import {Router } from '@angular/router';
import{UserService} from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  //delcares variables here..
  loginData: any = {};
  public submitted      : boolean  = false;
  public isLoadingData : boolean  = false;
  public systemIpAddress :any;
  public currentCompanyLogo :any;
  public isLoading : boolean  = false;
  
  constructor(
    public authService:AuthenticationService,
    public _service:UserService,
    public router : Router) { 
  }

  ngOnInit(): void {
    this.getLogo();
  }

  doLogin(valid) {
    this.submitted = true;
    //sent post data here...
     let postData	 = {
       "username"      :this.loginData.username,
      "password"      : this.loginData.password
    }
    this.isLoadingData = true;

    //below we call postData function for get data...
    this._service.storeDataToDb(postData,'superAdmin/signin').subscribe(data=>{
      if(data.accessToken){
        this.authService.saveDataInSession(data);
         this.router.navigate(['/user/']);
        this.isLoadingData = false;
      } else{
          this.authService.errorToast(data.message);
          this.isLoadingData = false;          
      }
    },error=>{
      this.authService.errorToast(error.error.message);  

      this.isLoadingData = false; 
    })
  }

  // updateRememberMe(checked:any) {
  //   if(checked){
  //     localStorage.setItem('email', this.loginData.email);
  //       localStorage.setItem('password', this.loginData.password);
  //     localStorage.setItem('RememberMe', JSON.stringify(checked));
  //   }else{  
  //       localStorage.removeItem('email');
  //       localStorage.removeItem('password');
  //       localStorage.removeItem('RememberMe');
  //   }
  // }

  // isRememberMeCheckedOrNot(){
  //   if(localStorage.getItem('RememberMe')){
  //     this.loginData.acceptTerms = true;
  //     this.loginData.email       =  localStorage.getItem('email');
  //     this.loginData.password    =  localStorage.getItem('password');
  //   }
  // }



  getLogo() {
    this.isLoading = true;
    //below we call postData function for get data...
    this._service.getDataByUrl('image/getImage/logo.jpeg').subscribe((data:any)=>{
      if(data.name){
        this.isLoading = false;
        this.currentCompanyLogo = 'data:image/jpeg;base64,' + data.picByte;
        localStorage.setItem('logo',this.currentCompanyLogo);
      }
    },error=>{
      this.currentCompanyLogo ='';
      this.isLoading = false;
    })
  }
}
