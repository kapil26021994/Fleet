import { VehicleAdd } from "./vehicle-add.model";
import{DiverListModel} from 'src/app/core/models/driver/driver-list.model';

export class TripAddModel {
    vehicle:VehicleAdd;
    driver:DiverListModel;
    createDateTime: string;
    updateDateTime:string;
    startPoint:string;
    endPoint:string;
    startDate:string;
    addNewLocation:any = [];
    isActive:string;
    endDate:string;
    tripGeofence:any = [];
    tripLatLong:any=[];
}
