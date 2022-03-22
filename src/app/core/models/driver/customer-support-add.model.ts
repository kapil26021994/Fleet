import{CompanyAddModel} from './company/company-add.model';
import{UserManagmentListModel} from 'src/app/core/models/driver/user-managment-list.model';

export class CustomerSupportAddModel {
    company: CompanyAddModel;
    user:UserManagmentListModel;
    subject:string;
    email: string;
    contactNumber: string;
    description: string;
    problemType: string;
    status :any;
}