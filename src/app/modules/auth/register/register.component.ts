import { Component, OnInit } from '@angular/core';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import {Router } from '@angular/Router';
import{UserService} from 'src/app/core/services/user/user.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  public submitted      : boolean  = false;
  public isLoadingData : boolean  = false;
  public systemIpAddress :any;
  public userRoleList = [];

  constructor(
    public authService:AuthenticationService,
    public userService:UserService,
    public router:Router) { }

  ngOnInit(): void {
    this.getAllRoleList();
  }

  onSubmit(valid) {
    this.submitted = true;

    let postData	 = {
      "username"      :this.model.username,
     "email"         : this.model.email,
     "password"      : this.model.password,
     "role"          : ["mod","user"]
   }
    this.isLoadingData = true;

    //below we call postData function for get data...
    this.userService.storeDataToDb(postData,'api/auth/signup').subscribe(data=>{
      if(data.success){
        this.router.navigateByUrl('/auth/login');
         this.isLoadingData = false;
      } else{
          this.authService.errorToast(data.message);
          this.isLoadingData = false;          
      }
    },  error => {
      this.isLoadingData = false; 
        this.authService.errorToast(error.error.message);
      })
  }

  public selectedRoleList = [];
  changeRole(event,value){
    if(event){
      this.selectedRoleList.push(event);
    }else{
      let index = this.selectedRoleList.findIndex(x=>x.value == value);
      this.selectedRoleList.splice(index,1)
    }
  }

  getAllRoleList(){
    this.userService.getDataByUrl('home/showAllRoles').subscribe((data:any)=>{
      if(data.length>0){
        this.userRoleList = data;
      }
    })
  }
}
