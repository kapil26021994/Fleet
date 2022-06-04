import { Component, OnInit } from '@angular/core';
import { SimCardListModel } from 'src/app/core/models/driver/sim-card-list.model';
import { UserService } from 'src/app/core/services/user/user.service'
import { AuthenticationService } from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sim-card-detail',
  templateUrl: './sim-card-detail.component.html',
  styleUrls: ['./sim-card-detail.component.scss']
})
export class SimCardDetailComponent implements OnInit {
  public data = [];
  public currentSimDetail :any =  new SimCardListModel();
  public isEdit: boolean = false;
  public exporterInstance: any;
  public isEditData = false;
  public simProviderList =[];
  public companyList =[];
public companyCloneList =[];
  constructor(
    public userService: UserService,
    public dataShare: DataSharingService,
    public dialog: MatDialog,
    public auth: AuthenticationService, public router: Router) {
  }

  ngOnInit(): void {
    this.companyList =  JSON.parse(localStorage.getItem('companyList'));
    this.companyCloneList =this.companyList; 
    if (history.state.data) {
      this.currentSimDetail = history.state.data;
      if(<any>this.currentSimDetail.company){
        this.currentSimDetail.companyName = <any>this.currentSimDetail.company.companyName;
      }
      this.simProviderList = history.state.providerList;
      this.currentSimDetail.isActive == 'active' ? this.isEditData = true : this.isEditData = false;
      this.data = [history.state.data];
      localStorage.setItem('currentPageData', JSON.stringify(history.state.data))
    } else {
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
    if (this.isEditData) {
      this.currentSimDetail.isActive = 'active';
    } else {
      this.currentSimDetail.isActive = 'inActive';
    }
    let matched = this.companyList.find(x=>x.companyName == this.currentSimDetail.companyName);
    if(matched){
      this.currentSimDetail.company = matched;
    }
    this.userService.updateData(this.currentSimDetail, 'updateSimCardInfo').subscribe((data: any) => {
      if (data.message) {
        this.toggleEditForm();
        this.auth.successToast(data.message);
        this.router.navigate(['/user/sim/']);
      }
    }, error => {
      this.auth.errorToast(error.error.error);
    })
  }

  toggleEditForm() {
    this.isEdit = this.isEdit ? false : true;
  }

  /*
Author:Kapil Soni
Funcion:deleteDriver
Summary:deleteDriver for get delete driver
Return list
*/
  deleteSimCard(value) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      panelClass: 'custom-dialog-container',
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Delete',
          cancel: 'No',
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.currentSimDetail.id) {
        this.userService.deleteDataFromDb(this.currentSimDetail.id, 'deleteSimCardByID').subscribe((data: any) => {
          if (data.message) {
            this.router.navigate(['/user/sim/']);
          }
        }, error => {
          this.auth.errorToast(error.error.message);
        })
      }
    });
  }

  
  search(value: string) { 
    let filter = value.toLowerCase();
   let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
    return this.companyList= list;
  }
}
