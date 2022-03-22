import { VehicleAdd } from "./vehicle-add.model";
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';
export class RouteListModel {
    id: string;
    vehicle:VehicleAdd;
    driver:DiverListModel;
    createDateTime: string;
    updateDateTime:string;
    startPoint:string;
    endpoint:string;
    vehicleNumber:string;
    routeGeofence:any=[];
    firstName:String;
}