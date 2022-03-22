import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { FormGroup,FormGroupDirective,FormControl  } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import{UserService} from 'src/app/core/services/user/user.service';
import{UserGroupAddModel} from 'src/app/core/models/driver/user-group-add.model';
import{UserGroupListModel} from 'src/app/core/models/driver/user-group-list.model';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';
import{Router} from '@angular/router';
import{DataSharingService} from 'src/app/core/services/data-sharing.service';
import {MatDialog} from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'app-user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.scss']
})
export class UserGroupComponent implements OnInit {
  vehicleAddForm : FormGroup;
  displayedColumns: any[] = ['select', 'createDateTime','groupName', 'companyName','isActive','action'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginatorTop') paginatorTop: MatPaginator;
  public submitted :boolean = false;
  public groupAdd = new UserGroupAddModel();
  public groupList = new UserGroupListModel();
  public isLoadingData : boolean = false;
  public vehicleForm :any;
  @ViewChild("f", { static: true }) formRef: ElementRef;
public isLoading = false;

  checked = false;
  indeterminate = false;
  companyList= [];
  statusList :string[]=["active","inActive"];
  public permissionList = [];

  vehicleNumberList = [];
  public vehicleTypeList = [];
positionFilter = new FormControl();
filteredValues =  {groupName: '',isActive:[],companyName: '',company: ''};
selectedPermission = [];

 // form group
 filterForm = new FormGroup({
  groupName: new FormControl(),
  isActive: new FormControl(),
  companyName: new FormControl()
});

get groupName() {
  return this.filterForm.get('groupName');
}
get isActive() {
  return this.filterForm.get('isActive');
}
get companyName() {
  return this.filterForm.get('companyName');
}

  constructor(public userService:UserService,
    public dialog:MatDialog,
    public authService:AuthenticationService,
    public router:Router,
    public dataShare:DataSharingService) { }

  ngOnInit() {
    this.vehicleTypeList =  JSON.parse(localStorage.getItem('vehicleTypeList'));
    this.getAllGroupList();
    this.getAllMultpleDataViaURL();
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    if(this.dataSource.data){
      this.selection.select(...this.dataSource.data);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  toggleDialog(event) {
    if(event){
      event.preventDefault();
     }
    document.getElementById('addGroup').classList.toggle('show-dailog');
    this.getAllMultpleDataViaURL();
  }

   /*
    Author:Kapil Soni
    Funcion:getAllVehicleList
    Summary:getAllVehicleList for get vehicle list
    Return list
  */
  getAllGroupList() {
    this.isLoading = true;
    (<any>this.groupAdd).isActive= true;
    this.userService.getDataByUrl('showAllUserGroupData').subscribe((data:any)=>{
      if(data.length>0){
        this.groupList = data;
        this.dataSource = new MatTableDataSource(<any>this.groupList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       this.isLoading = false;

       //inistialze the fitlers
       this.formSubscribe();
       this.getFormsValue();
      } else{
        this.isLoading = false;
        (<any>this).groupList= [];
      }
    },  error => {
      (<any>this).groupList = [];
      this.isLoading = false;
      this.authService.errorToast(error.error.message);
    })
  }

     /*
      Author:Kapil Soni
      Funcion:getAllMultpleDataViaURL
      Summary:getAllMultpleDataViaURL for get vehicle list
      Return list
    */
      getAllMultpleDataViaURL() {
      this.userService.getMulipleAPIDataViaUrl('company/showAllCompanyData','showAllPermissionData','').subscribe((data:any)=>{
        if(data[1].length > 0 && data[0].length > 0){
          this.companyList = data[1];
          this.permissionList = data[0];
        } else{
          this.companyList= [];
        }
      },  error => {
        this.authService.errorToast(error.error.message);
      })
    }


   /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    addVehicle(form:any){
      this.vehicleForm = form;
      if(form.form.valid){
        this.submitted = true;
        this.isLoadingData = true;
        if(this.groupAdd.isActive){
          this.groupAdd.isActive='active';
        }else{
          this.groupAdd.isActive='inActive';
        }
        this.userService.storeDataToDb(<any>this.groupAdd,'saveUserGroup').subscribe((data:any)=>{
          if(data.message){
            this.isLoadingData = false;
            form.resetForm();
             form.reset();

             //dismiss dlalog and get all list
             this.toggleDialog('');
             this.getAllGroupList();
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

    updateDataViaKey(value,key):void{
      if(value){
        let data =  this.companyList.find(x=>x.companyName == value);
        this.groupAdd.company = data;
      }
    }

 /*
      Author:Kapil Soni
      Funcion:getAllCompanyData
      Summary:getAllCompanyData for get vehicle list
      Return list
    */
    resetData(){
      if(this.vehicleForm){
        this.vehicleForm.reset();
       this.vehicleForm.resetForm();
    } 
      this.getAllGroupList();
    }

    isAllSelected() {
      const numSelected = this.selection.selected.length;
      if(this.dataSource){
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
      }
    }

    applyFilter(filterValue: string) {
      if(this.dataSource){
      this.dataSource.filter = filterValue.trim().toLowerCase();
        this.dataSource.filter = filterValue;   
      }
    }

     /*
      Author:Kapil Soni
      Funcion:deleteVehicle
      Summary:deleteVehicle for get delete vehicle
      Return list
    */
    deleteVehicle(value){
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        panelClass: 'custom-dialog-container',
        data: {
          message: 'Are you sure want to delete?',
          buttonText: {
            ok: 'Save',
            cancel: 'No',
          },
        },
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
		   if(confirmed &&  value.id){
          this.userService.deleteDataFromDb(value.id,'deleteUserGroupByID').subscribe((data:any)=>{
            if(data.message){
              this.authService.successToast(data.message);
              const index = this.dataSource.data.findIndex(x=>x.id == value.id);
              this.dataSource.data.splice(index, 1);
              this.dataSource._updateChangeSubscription();
            }
          },  error => {
              this.isLoadingData = false;
              this.authService.errorToast(error.error.message);
          })
        }
      });
    }


    getCurrentVehicleDetail(detail:any,exporter){
      this.dataShare.updatedData.next(exporter);
      this.router.navigate(['/user/group/detail'], <any>{state: {data: detail,permission:detail.addPermissions}});
    }

    formSubscribe() {
      this.groupName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['groupName'] = positionValue;
        this.filteredValues['company'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.isActive.valueChanges.subscribe((positionValue) => {
        this.filteredValues['isActive'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
      this.companyName.valueChanges.subscribe((positionValue) => {
        this.filteredValues['companyName'] = positionValue;
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });
    }
  
    getFormsValue() {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
            let searchString = JSON.parse(filter);
            let isPositionAvailable = false;
            let isStatusAvailable = false;
            if (searchString.companyName &&  searchString.companyName.length) {
              for (const d of searchString.companyName) {
                if (data.company.companyName.trim() === d) {
                  isPositionAvailable = true;
                }
              }
            } else {
              isPositionAvailable = true;
            }
            if (searchString.isActive &&  searchString.isActive.length) {
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
              (data.groupName.toString().trim().toLowerCase().indexOf(searchString.groupName != null ? searchString.groupName.toLowerCase() : '') !== -1 ||
              data.company.companyName.toString().trim().toLowerCase().indexOf(searchString.company != null ? searchString.company.toLowerCase() : '') !== -1);
              ;
            return resultValue;
          };
          this.dataSource.filter = JSON.stringify(this.filteredValues);
      }

        // Reset table filters
  resetFilters() {
    this.getAllGroupList();
    this.selectedPermission=[];
    this.userService.resetFilter(this.filterForm);
  }

  public selectedPermissionList :any = [];
  public selectedPermissionCloneList = [];
  public currentItemData = [];
  optionSelected(event,value,permission) {
    if(event.source._selected){
      let matched  =this.selectedPermissionList.find(x=>x.name == event.source.group.label);
      let matchedItem =  this.selectedPermissionList.find(x=>x.name == permission.name);
      if(matchedItem == undefined){
        this.currentItemData = [];
      }
      if(matched == undefined && matchedItem == undefined){
        let data = {
          "lable": value,
          "value": value
        };
        this.currentItemData.push(data);
        this.selectedPermissionList.push({
          'name':event.source.group.label,
          'items':this.currentItemData
        });
      }else{
        let index = this.selectedPermissionList.findIndex(x=>x.name == event.source.group.label);
        if(index != -1){
          let data = {
            "lable": value,
            "value": value
          };
          this.selectedPermissionList[index].name = event.source.group.label;
          this.selectedPermissionList[index].items.push(data);
        }
      }
    }else{
      let matched =this.selectedPermissionList.find(x=>x.name == event.source.group.label);
      if(matched){
        let index = matched.items.findIndex(x=>x == value);
        matched.items.splice(index,1);
      }

      let matchedcloneData =this.selectedPermissionCloneList.find(x=>x.name == event.source.group.label);
      if(matchedcloneData){
        let data = {
          "lable": value,
          "value": value
        };
        let index = matchedcloneData.items.findIndex(x=>x == data.value);
        matchedcloneData.items.splice(index,1);
      }
      
    }
    //delete (<any>this.groupAdd).companyName;
    this.groupAdd.addPermissions=this.selectedPermissionList;
  }
}
