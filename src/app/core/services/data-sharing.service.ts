import { Injectable } from '@angular/core';  
import { Subject } from 'rxjs';  
  
@Injectable({  
  providedIn: 'root'  
})  
export class DataSharingService {  
  
  updatedData = new Subject();  
  constructor() { }  
}