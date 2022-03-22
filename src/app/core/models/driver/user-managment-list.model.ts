import{CompanyAddModel} from './company/company-add.model';
export class UserManagmentListModel {
    company: CompanyAddModel;
    groupName: string;
    isActive :string;
    addPermissions: any= [];
    id:string;
    assignGroup:any;
}