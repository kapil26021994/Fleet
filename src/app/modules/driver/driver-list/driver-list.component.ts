import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/core/services/user/user.service';
import { DiverListModel } from 'src/app/core/models/driver/driver-list.model';
import { DiverAddModel } from 'src/app/core/models/driver/driver-add.model';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/core/services/data-sharing.service';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss'],
})
export class DriverlistComponent implements OnInit {
  //declare all gloabl variables...
  displayedColumns: any[] = ['name', 'email', 'Number', 'status', 'joinedDate', 'licenceNumber', 'action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public submitted: boolean = false;
  public driverList: any = new DiverListModel();
  public driverAddModel: any = new DiverAddModel();
  public isLoadingData: boolean = false;
  public vehicleForm: any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
  public isLoading = false;
  public vehicleList = [];
  public deviceList = [];
  public vehicleCloneList = [];
  public driverForm: any;
  public companyList = [];
  public companyCloneList = [];

  statusList: string[] = ["active", "inActive"];
  filteredValues = { firstName: '', isActive: [], companyDomain: '', vehicleType: [], email: '', licenceNumber: '' };
  // form group
  driverFilterForm = new FormGroup({
    vehicleType: new FormControl(),
    isActive: new FormControl(),
    firstName: new FormControl()
  });
  constructor(public userService: UserService,
    public dialog: MatDialog, public authService: AuthenticationService, public router: Router, public dataShare: DataSharingService) { }

  get vehicleType() {
    return this.driverFilterForm.get('vehicleType');
  }

  get isActive() {
    return this.driverFilterForm.get('isActive');
  }
  get firstName() {
    return this.driverFilterForm.get('firstName');
  }
  toggleDialog(event) {
    this.isLoading = false;
    document.getElementById('addDriver').classList.toggle('show-dailog');
    this.resetData();
  }

  ngOnInit() {
    this.companyList = this.userService.getCompanyList();
    this.companyCloneList = this.companyList;
    this.vehicleList = JSON.parse(localStorage.getItem('vehicleTypeList'));
    this.getAllDriverList();
  }



  /*
  Author:Kapil Soni
  Funcion:getAllVehicleList
  Summary:getAllVehicleList for get vehicle list
  Return list
*/
  getAllDriverList() {
    this.driverAddModel.isActive = true;
    this.isLoading = true;
    this.userService.getDataByUrl('showAllDriverData').subscribe((data: any) => {
      if (data.length > 0) {
        this.driverList = data;
        this.dataSource = new MatTableDataSource(this.driverList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;

        this.formSubscribe();
        this.getFormsValue();
      } else {
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
      this.authService.errorToast(error.error.message);
    })
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    if (this.dataSource) {
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
  }

  /*
   Author:Kapil Soni
   Funcion:addDriver
   Summary:addDriver for add driver
   Return list
 */
  addDriver(form: any) {
    this.driverForm = form;
    this.submitted = true;
    if (form.form.valid) {
      this.isLoadingData = true;
      if (this.driverAddModel.isActive) {
        this.driverAddModel.isActive = 'active';
      } else {
        this.driverAddModel.isActive = 'inActive';
      }
      this.userService.storeDataToDb(<any>this.driverAddModel, 'saveDriver').subscribe((data: any) => {
        if (data.message) {
          this.isLoadingData = false;
          form.resetForm();
          form.reset();

          //dismiss dlalog and get all list
          this.toggleDialog('');
          this.getAllDriverList();
        } else {
          this.isLoadingData = false;
        }
      }, error => {
        this.isLoadingData = false;
        this.authService.errorToast(error.error.message);
      })
    }
  }

  /*
   Author:Kapil Soni
   Funcion:getAllCompanyData
   Summary:getAllCompanyData for get vehicle list
   Return list
 */
  resetData() {
    if (this.driverForm) {
      this.driverForm.resetForm();
      this.driverForm.reset();
    }
    this.submitted ? this.getAllDriverList() : '';
  }

  /*
    Author:Kapil Soni
    Funcion:getCurrentDriverDetail
    Summary:getCurrentDriverDetail for get driver detail
    Return list
  */
  getCurrentDriverDetail(detail: any, exporter) {
    this.dataShare.updatedData.next(exporter);
    this.router.navigate(['/user/driver/edit'], <any>{ state: { data: detail } });
  }

  /*
  Author:Kapil Soni
  Funcion:deleteVehicle
  Summary:deleteVehicle for get delete vehicle
  Return list
*/
  deleteDriver(value) {
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
      if (confirmed && value.id) {
        this.userService.deleteDataFromDb(value.id, 'deleteDriverByID').subscribe((data: any) => {
          if (data.message) {
            this.authService.successToast(data.message);
            const index = this.dataSource.data.indexOf(value.id);
            this.dataSource.data.splice(index, 1);
            this.dataSource._updateChangeSubscription();
          }
        }, error => {
          this.isLoadingData = false;
          this.authService.errorToast(error.error.message);
        })
      }
    });
  }

  formSubscribe() {
    this.vehicleType.valueChanges.subscribe((positionValue) => {
      this.filteredValues['vehicleType'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.isActive.valueChanges.subscribe((positionValue) => {
      this.filteredValues['isActive'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.firstName.valueChanges.subscribe((positionValue) => {
      this.filteredValues['firstName'] = positionValue;
      this.filteredValues['email'] = positionValue;
      this.filteredValues['number'] = positionValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
  }

  getFormsValue() {
    this.dataSource.filterPredicate = (data, filter: string): boolean => {
      let searchString = JSON.parse(filter);
      let isPositionAvailable = false;
      let isStatusAvailable = false;
      if (searchString.vehicleType && searchString.vehicleType.length) {
        for (const d of searchString.vehicleType) {
          if (data.vehicleType.trim() === d) {
            isPositionAvailable = true;
          }
        }
      } else {
        isPositionAvailable = true;
      }
      if (searchString.isActive && searchString.isActive.length) {
        for (const d of searchString.isActive) {
          if (data.isActive === d) {
            isStatusAvailable = true;
          }
        }
      } else {
        isStatusAvailable = true;
      }
      const resultValue =
        isPositionAvailable && isStatusAvailable &&
        (data.firstName.toString().trim().toLowerCase().indexOf(searchString.firstName != null ? searchString.firstName.toLowerCase() : '') !== -1 ||
          data.email.toString().trim().toLowerCase().indexOf(searchString.email != null ? searchString.email.toLowerCase() : '') !== -1 ||
          data.phoneNumber.toString().trim().toLowerCase().indexOf(searchString.number != null ? searchString.number.toLowerCase() : '') !== -1);
      return resultValue;
    };
    this.dataSource.filter = JSON.stringify(this.filteredValues);
  }

  resetFilters() {
    this.getAllDriverList();
    this.userService.resetFilter(this.driverFilterForm);
  }

  getVehicleListByCompanyId(value) {
    if (value.id) {
      this.isLoading = true;
      this.userService.getDataByUrl('showVehicleByCompanyId/' + value.id).subscribe((data: any) => {
        if (data.length > 0) {
          this.vehicleList = data;
          this.isLoading = false;
          this.vehicleCloneList = this.vehicleList;
        } else {
          this.isLoading = false;
          this.vehicleList = [];
        }
      })
    }
  }

  search(value: string, key) {
    if (key == 'company') {
      const companyList = this.companyCloneList.filter(item => item.companyName.toLowerCase().search(value.toLowerCase()) > -1);
      return this.companyList = companyList;
    } else {
      const vehicleList = this.vehicleCloneList.filter(item => item.vehicleNumber.toLowerCase().search(value.toLowerCase()) > -1);
      return this.vehicleList = vehicleList;
    }
  }
}
