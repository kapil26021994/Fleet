import { Injectable } from '@angular/core';
import{HttpClient} from   '@angular/common/http';
import{Observable,Subject,forkJoin } from  'rxjs';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';    
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public sideMenuEmitter$ = new BehaviorSubject<any>(''); 
  constructor(public http:HttpClient,public authService:AuthenticationService) { 
  }

  uploadDataToDb(fileToUpload: File,url:string): Observable<any> {
      const formData: FormData = new FormData();
      formData.append('file', fileToUpload);
      return this.http.post(environment.baseUrl+url, formData);
  }

  storeDataToDb(data:any,url:string): Observable<any> {
    console.log(environment.baseUrl+url)
    return this.http.post(environment.baseUrl+url, data);
  }

  getDataByUrl(url){
     return this.http.get(environment.baseUrl+url);
  }

  deleteDataFromDb(value:any,url): Observable<any> {
   return this.http.request('delete',environment.baseUrl+url+'/'+value)
  }

  updateData(data:any,url): Observable<any> {
     return this.http.put(environment.baseUrl+url, data);
  }

   getCalenderRoadMapData(startDate:any,endDate:any){
     return this.http.get(environment.baseUrl+'getCalendarRoadmaps?&user_id='+this.authService.getUserId()+'&start_date='+startDate+'&end_date='+endDate);
  }

  getMulipleAPIData(){
    let driverApi = this.http.get(environment.baseUrl+'showAllDriverData');
    let vehicleApi = this.http.get(environment.baseUrl+'showAllVehicleData');
    return forkJoin([vehicleApi, driverApi]);
  }

  getMulipleAPIDataViaUrl(url1,url2,url3,url4){
    let driverApi = this.http.get(environment.baseUrl+url1);
    let vehicleApi = this.http.get(environment.baseUrl+url2);
    let companyApi = this.http.get(environment.baseUrl+url3);
    let vehicleList = this.http.get(environment.baseUrl+url4);
    return forkJoin([vehicleApi, driverApi,companyApi,vehicleList]);
  }


  resetFilter(value){
    value.reset();
  }

  resetFormErors(value){
    value.resetForm();
    value.reset();
      Object.keys(value.controls).forEach(key =>{
        value.controls[key].setErrors(null);
      });
  }

  getToday(): string {
      const now =new Date();
      return new Date().toISOString().split('T')[0];
    }
}
