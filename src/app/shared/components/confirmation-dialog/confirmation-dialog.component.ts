import { Component, Inject } from '@angular/core';
import {MatDialog,MAT_DIALOG_DATA,MatDialogRef} from '@angular/material/dialog';
import {Router } from '@angular/router';

@Component({
  selector: 'confirmation-dialog.component',
  templateUrl: 'confirmation-dialog.component.html',
})
export class ConfirmationDialog {
  message: string = "Are you sure?"
  confirmButtonText = "Yes"
  cancelButtonText = "Cancel"
  public isDelete = false;
  public isBlockedUser = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public router:Router,
    private dialogRef: MatDialogRef<ConfirmationDialog>) {
      if(data){
        this.message = data.message || this.message;
        if(data.buttonText) {

          if(this.router.url != '/auth/login'){
            this.isBlockedUser = false
            if(data.isDelete){
              this.isDelete =data.isDelete;
            }else{
              this.isDelete =data.isDelete != undefined ? true : false;
            }
          }else{
            this.isBlockedUser = true;
          }

      
          this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
          this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
        }
      }
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

}