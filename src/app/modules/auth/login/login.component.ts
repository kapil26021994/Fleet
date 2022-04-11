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
  public submitted      : boolean  = false;
  public isLoadingData : boolean  = false;
  public systemIpAddress :any;
  public currentCompanyLogo :any;
  public isLoading : boolean  = false;
  
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
}
