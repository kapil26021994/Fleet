import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isDisabledPipe'
})
export class IsDisabledPipePipe implements PipeTransform {
  public finalPermissionList = [];
  transform(value,key) {
    let userLevelPermissions = JSON.parse(localStorage.getItem('user-data')).addPermissions;
    // if permission exist..
    if(userLevelPermissions != null && userLevelPermissions.length >0){
      if(userLevelPermissions.length >0 && JSON.parse(localStorage.getItem('user-data')).roles !=  'user'){
        let filteredPermissionList =  userLevelPermissions.concat(JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions).filter(x=>x.name == value);
        if(filteredPermissionList[0].items.length > 0){
          let filteredItemList = filteredPermissionList[0].items.filter(x=>x.lable == key);
          if(filteredItemList.length == 0){
            return false;
          }else{
            return true;
          }
        } else{
          return true;
        }
      }else{
          return true;
      }
     }else{
       if(JSON.parse(localStorage.getItem('user-data')).assignGroup != null && JSON.parse(localStorage.getItem('user-data')).roles !=  'user'){
          let ugroupLevelPermissions =JSON.parse(localStorage.getItem('user-data')).assignGroup.addPermissions;
          if(ugroupLevelPermissions[0].items.length > 0){
            let filteredItemList = ugroupLevelPermissions[0].items.filter(x=>x.lable == key);
            if(filteredItemList.length == 0){
              return false;
            }else{
              return true;
            }
          } else{
            return true
          }
       }else{
        return true;
       }
     }
  }
}
