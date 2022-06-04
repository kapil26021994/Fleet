import { Component, OnInit } from '@angular/core';
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import {Router } from '@angular/router';
import{UserService} from 'src/app/core/services/user/user.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  //delcares variables here..
  loginData: any = {};
  forgotPassword :any ={};
  public submitted      : boolean  = false;
  public isLoadingData : boolean  = false;
  public systemIpAddress :any;
  public currentCompanyLogo :any;
  public isLoading : boolean  = false;
  public isFirstTimeLogin : boolean  = false;
  public isChangePasswordView : boolean  = false;
  public userEmail :any;
  public changePassword:any ={};
  
  constructor(
    public authService:AuthenticationService,
    public _service:UserService,
    public dialog:MatDialog,
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
          //move to chage pwd screen if role is user...
          if(data.loginCount == 0 && data.roles[0] == 'USER'){
            this.isFirstTimeLogin = true;
            this.isLoadingData = false;
            return false;
          }
          if(data.roles[0] == 'USER' && data.userPermissionStatus == 'false'){
            this.isLoadingData = false;
            const dialogRef = this.dialog.open(ConfirmationDialog, {
              panelClass: 'custom-dialog-container',
              data: {
                message: 'User is not assigned any persmissons/ Roles hence not able to login. Please ask your administrator to allocate appropriate role/permissions.',
                buttonText: {
                  ok: 'OK',
                },
              },
            });
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
              if(confirmed){
            
              }
            })
            return false;
          }else{
            this.authService.saveDataInSession(data);
            this.router.navigate(['/user/']);
            this.isLoadingData = false;
          }
        } else{
            this.authService.errorToast(data.message);
            this.isLoadingData = false;          
        }
    },error=>{
      this.authService.errorToast(error.error.message);  

      this.isLoadingData = false; 
    })
  }


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

  public  changePasswordAPIURL :any;
  resetUserPassword(form_status){
    if(form_status){
      this.isLoadingData = true;
      this.submitted = true;
      //below we call postData function for get data...
      this._service.storeFormDataValue(this.forgotPassword.email,'superAdmin/forgot-password').subscribe(data=>{
        if(data['message'] != 'Invalid email id'){
          this.changePasswordAPIURL = data['message'];
          this.isLoadingData = false;
          this.forgotPassword.email='';
          this.isFirstTimeLogin = false;
          this.isChangePasswordView = true;
        }else{
          this.authService.errorToast(data.message);
          this.isLoadingData = false;
        }
      })
    }
  }

  updatePasswordINDB(form_status){
    if(form_status){
      this.isLoadingData = true;
      this.submitted = true;
      //below we call postData function for get data...
      this._service.storeFormDataValueViaPut(this.changePassword.password,this.changePasswordAPIURL).subscribe(data=>{
        if(data.message){
          this.changePassword.password='';
          this.authService.successToast(data.message);
          this.isChangePasswordView = false;
          this.isLoadingData = false;
          this.isFirstTimeLogin = false;
        }else{
          this.isLoadingData = false;
        }
      })
    }
  }
}
