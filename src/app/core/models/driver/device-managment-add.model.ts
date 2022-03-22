import{SimCardListModel} from 'src/app/core/models/driver/sim-card-list.model';
export class DeviceManagmentAddModel {
    deviceType: string;
    deviceName: string;
    assignSim:SimCardListModel;
    stationaryLat: string;
    stationaryLong   : string;
    issueDate: string;
    activationDate: string;
    createDateTime: string;
    updateDateTime: string;
    deviceImei:string;
}