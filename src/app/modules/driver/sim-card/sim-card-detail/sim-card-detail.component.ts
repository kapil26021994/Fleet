import { Component, OnInit } from '@angular/core';
import{SimCardListModel} from 'src/app/core/models/driver/sim-card-list.model';
import{UserService} from 'src/app/core/services/user/user.service'
import{AuthenticationService} from 'src/app/core/services/authentication/authentication.service';
import { Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
@Component({
  selector: 'app-sim-card-detail',
  templateUrl: './sim-card-detail.component.html',
  styleUrls: ['./sim-card-detail.component.scss']
})
export class SimCardDetailComponent implements OnInit {
  public data = [];
  public currentSimDetail = new SimCardListModel();
  public isEdit :boolean = false;
  public exporterInstance :any;

  constructor(
    public userService :UserService,
    public dataShare :  DataSharingService,
    public auth:AuthenticationService,public router:Router) {
      this.dataShare.updatedData.subscribe((res: any) => { 
        if(res){ 
          this.exporterInstance = res;
        }
      }) 
     }

  ngOnInit(): void {
    if(history.state.data){
      this.currentSimDetail = history.state.data;
      this.data  = [history.state.data];
      localStorage.setItem('currentPageData',JSON.stringify(history.state.data))
    }else{
      this.currentSimDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

      /*
    Author:Kapil Soni
    Funcion:updateDriverInfo
    Summary:updateDriverInfo for update driver info
    Return list
  */
    updateDriverInfo() {
      this.userService.updateData(this.currentSimDetail ,'updateSimCardInfo').subscribe((data:any)=>{
        if(data.message){
          this.toggleEditForm();
          this.auth.successToast(data.message);
          this.router.navigate(['/user/sim/']);
        } 
      },  error => {
        this.auth.errorToast(error.error.message);
      })
    }

    toggleEditForm() {
      this.isEdit = this.isEdit?false:true;
    }
}
