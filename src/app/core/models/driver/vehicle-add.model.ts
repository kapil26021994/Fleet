import{CompanyAddModel} from './company/company-add.model';
export class VehicleAdd {
    vehicleNumber: string;
    id:string;
    vehicleType: string;
    modelName: string;  
    vehicleManufacturingCompanyName:string;
    companyName: string;
    maxSpeed : string;
    fuelType:string;
    tankCapacity: string;l
    purchaseYear : string;
    sele: string;
    idleMileage: string;
    insuranceRenewalDate:string;
    pucRenewalDate:string;
    servicingPeriod:string;
    lastServicingDate:string;
    averageRunningLimitPerDay:string;
    chasisNumber:string;
    enginNumber:string;
    company: CompanyAddModel;
    isActive:string;
    deviceType:string;
    device:any;
    geofence:any;
    geofencePlace:any = [];
}
