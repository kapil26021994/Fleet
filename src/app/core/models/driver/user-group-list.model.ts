import{CompanyAddModel} from './company/company-add.model';
export class UserGroupListModel {
    company: CompanyAddModel;
    groupName: string;
    id:string;
    isActive :string;
    addPermissions: any =[];
}