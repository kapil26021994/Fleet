import { Component, OnInit } from '@angular/core';
import { DeviceManagmentListModel } from 'src/app/core/models/driver/device-managment-list.model';
import { UserService } from 'src/app/core/services/user/user.service'
import { AuthenticationService } from 'src/app/core/services/authentication/authentication.service';
import { Router } from '@angular/router';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DataSharingService } from 'src/app/core/services/data-sharing.service';

@Component({
  selector: 'app-device-managment-detail',
  templateUrl: './device-managment-detail.component.html',
  styleUrls: ['./device-managment-detail.component.scss']
})
export class DeviceManagmentDetailComponent implements OnInit {

  public currentDeviceDetail = new DeviceManagmentListModel();
  public isEdit: boolean = false;
  public exporterInstance: any;
  public companyList = [];
  public simCardList = [];
  public data = [];
  public selectedSimCard: any;
  public isEditData: boolean = false;
  public deviceTypeList: any = [];
  public companyCloneList = [];
  constructor(
    public userService: UserService,
    public dataShare: DataSharingService,
    public dialog: MatDialog,
    public auth: AuthenticationService, public router: Router) {
  }

  ngOnInit(): void {
    if (history.state.data) {
      this.currentDeviceDetail = history.state.data;
      this.getDeviceTypeList();
      this.data = [history.state.data];
      (<any>this.currentDeviceDetail).isActive == 'active' ? this.isEditData = true : this.isEditData = false;
      this.companyList = JSON.parse(localStorage.getItem('companyList'));
      this.companyCloneList = this.companyList;
      (<any>this.currentDeviceDetail.company).companyName = (<any>this.currentDeviceDetail.company).companyName;

      //if assignSim null in such case we set default lable....
      if (this.currentDeviceDetail.assignSim != null) {
        this.selectedSimCard = (<any>this.currentDeviceDetail.assignSim).callingNumber;
      } else {
        this.selectedSimCard = 'No-SIM-card';
      }
      localStorage.setItem('currentPageData', JSON.stringify(history.state.data))
      this.getSimListByCompany((<any>this.currentDeviceDetail.company.companyName));
    } else {
      this.currentDeviceDetail = JSON.parse(localStorage.getItem('currentPageData'));
    }
  }

  /*
  Author:Kapil Soni
  Funcion:getAllVehicleList
  Summary:getAllVehicleList for get vehicle list
  Return list
*/
  getSimListByCompany(value) {
    const matched = this.companyList.find(x => x.companyName == value);
    if (matched.id) {
      this.userService.getDataByUrl('showAllUnusedSimCardByCompanyId/' + matched.id).subscribe((data: any) => {
        if (data.length > 0) {
          this.simCardList = data;
        }
      }, error => {
      })
    }
  }

  /*
Author:Kapil Soni
Funcion:updateDriverInfo
Summary:updateDriverInfo for update driver info
Return list
*/
  updateDriverInfo() {
    //if device exist or not if not exist in such case we set null....
    if(this.simCardList.length>0){
      let simCardData = this.simCardList.find(x => x.callingNumber == this.selectedSimCard);
      if (simCardData) {
        this.currentDeviceDetail.assignSim = simCardData;
      } else {
        this.currentDeviceDetail.assignSim = null;
      }
    }

    if (this.isEditData) {
      this.currentDeviceDetail.isActive = 'active';
    } else {
      this.currentDeviceDetail.isActive = 'inActive';
    }
    //check company name in array...
    let matchedCompany = this.companyList.find(x => x.companyName == this.currentDeviceDetail.company.companyName);
    if (matchedCompany) {
      this.currentDeviceDetail.company = matchedCompany;
    }
    this.userService.updateData(this.currentDeviceDetail, 'updateDeviceInfo').subscribe((data: any) => {
      if (data.message) {
        this.toggleEditForm();
        this.auth.successToast(data.message);
        this.router.navigate(['/user/device/']);
      }
    }, error => {
      this.auth.errorToast(error.error.message);
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
  deleteDevice(value) {
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
      if (confirmed && this.currentDeviceDetail.id) {
        this.userService.deleteDataFromDb(this.currentDeviceDetail.id, 'deleteDeviceByID').subscribe((data: any) => {
          if (data.message) {
            this.router.navigate(['/user/device/']);
            this.auth.successToast(data.message);
          }
        }, error => {
          this.auth.errorToast(error.error.message);
        })
      }
    });
  }


  updateSim(value) {
    if(this.simCardList.length>0){
      let matched = this.simCardList.find(x => x.callingNumber == value);
      if (matched) {
        this.currentDeviceDetail.assignSim = matched;
        this.currentDeviceDetail.deviceName = 'Dev_' + matched.callingNumber;
      }
    }
    value == 'No-SIM-card' ? this.currentDeviceDetail.deviceName = '' : this.currentDeviceDetail.deviceName;
  }

  updateDevice(value): void {
    let data = this.deviceTypeList.find(x => x.deviceType == value);
    if (data) {
      (<any>this.currentDeviceDetail).device = data;
    }
  }


  search(value: string) {
    let filter = value.toLowerCase();
    let list = this.companyCloneList.filter(option => option.companyName.toLowerCase().startsWith(filter));
    return this.companyList = list;
  }

  getDeviceTypeList() {
    this.userService.getDataByUrl('showAllDeviceType').subscribe((data: any) => {
      if (data.length > 0) {
        this.deviceTypeList = data
      }
    })
  }
}
