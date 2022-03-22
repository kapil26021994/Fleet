import{CompanyAddModel} from './company/company-add.model';
export class CompanyManagmentListModel {
    id:string;
    companyName: CompanyAddModel;
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
}