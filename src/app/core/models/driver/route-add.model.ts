import { VehicleAdd } from "./vehicle-add.model";
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';

export class RouteAddModel {
    vehicle:VehicleAdd;
    driver:DiverListModel;
    createDateTime: string;
    updateDateTime:string;
    startPoint:string;
    endpoint:string;
    startDate:string;
    isActive:string;
    routeName :string
    endDate:string;
    routeGeofence:any = [];
}
