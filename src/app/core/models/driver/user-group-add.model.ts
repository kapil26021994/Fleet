import{CompanyAddModel} from './company/company-add.model';
export class UserGroupAddModel {
    company: CompanyAddModel;
    groupName: string;
    isActive :string;
    addPermissions:[];
}