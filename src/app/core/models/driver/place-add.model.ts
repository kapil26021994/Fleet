import{GeofenceModel} from './geofence.model';

export class PlaceAddModel {
    placeName: string;
    description: string;
    address: string;
    geofence : any = [];
    phoneNumber: string;
    createDateTime: string;
    updateDateTime:string;
    isActive:string;
    company:string;
    notification :string;
}
