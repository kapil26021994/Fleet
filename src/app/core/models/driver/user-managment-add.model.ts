import{CompanyAddModel} from './company/company-add.model';
import{UserGroupListModel} from 'src/app/core/models/driver/user-group-list.model';

export class UserManagmentAddModel {
    company: CompanyAddModel;
    firstName: string;
    lastName: string;
    email: string;
    username:string;
    password: string;
    phoneNumber: string;
    address: string;
    assignGroup:UserGroupListModel;
    addPermissions:[];
    isActive :any;
    roles:any = [];
}