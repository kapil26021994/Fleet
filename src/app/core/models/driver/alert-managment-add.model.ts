import{CompanyAddModel} from './company/company-add.model';
import{UserGroupListModel} from 'src/app/core/models/driver/user-group-list.model';
import { VehicleAdd } from "./vehicle-add.model";

export class AlertManagmentAddModel {
    company: CompanyAddModel;
    vehicle:VehicleAdd;
    email: string;
    phoneNumber: string;
    isActive :any;
    emailAlert:boolean;
    smsAlert:boolean;
    popup:boolean;
}