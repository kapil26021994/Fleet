import { Component, OnInit } from '@angular/core';
import{UserService} from 'src/app/core/services/user/user.service';
import{CompanyAddModel} from 'src/app/core/models/driver/company/company-add.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {

  model: any = {};

  public submitted : boolean = false;
  public isLoadingData : boolean = false;
  public companyAddData = new CompanyAddModel();
  constructor(public userService:UserService,public authService:AuthenticationService) { }

  ngOnInit(): void {
  }

  addCompany(form:any) {
    this.submitted = true;
    if(form){
   // below we call postData function for get data...
      this.userService.storeDataToDb(this.companyAddData,'company/signup').subscribe(data=>{
        if(data.message){
          this.isLoadingData = false;
          this.authService.successToast(data.message);
          form.resetForm();
          form.reset();
        } else{
            this.authService.errorToast(data.message);
            this.isLoadingData = false;          
        }
      },  error => {
          this.isLoadingData = false; 
          this.authService.errorToast(error.error.message);
        })
      }
    }
}
