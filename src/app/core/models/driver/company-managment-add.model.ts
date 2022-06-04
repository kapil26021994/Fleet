import{CompanyAddModel} from './company/company-add.model';
import{UserGroupListModel} from 'src/app/core/models/driver/user-group-list.model';

export class CompanyManagmentAddModel {
    companyName: string;
    companyEmail: string;
    companyContactNumber: string;
    addressLine1:string;
    addressLine2:string
    city: string;
    state: string;
    country:string;
    pincode: string;
    gstNumber: string;
    companyDomain:string;
    selectTimezone:string;
    isActive :string;
    image:string;
}