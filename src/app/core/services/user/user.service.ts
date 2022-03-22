import { Injectable } from '@angular/core';
import{HttpClient} from   '@angular/common/http';
import{Observable,Subject,forkJoin } from  'rxjs';
import { environment } from '../../../../environments/environment';
import{AuthenticationService} from '../../../core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(public http:HttpClient,public authService:AuthenticationService) { 
  }

  uploadRegime(fileToUpload: File): Observable<any> {
      const formData: FormData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('user_id', this.authService.getUserId());
      return this.http.post(environment.baseUrl+'addRegime', formData);
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

  getMulipleAPIDataViaUrl(url1,url2,url3){
    let driverApi = this.http.get(environment.baseUrl+url1);
    let vehicleApi = this.http.get(environment.baseUrl+url2);
    let companyApi = this.http.get(environment.baseUrl+url3);
    return forkJoin([vehicleApi, driverApi,companyApi]);
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
}
