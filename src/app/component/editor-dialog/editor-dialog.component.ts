import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-editor-dialog',
  templateUrl: './editor-dialog.component.html'
})
export class EditorDialogComponent {


  constructor(public dialogRef: MatDialogRef<EditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    /**
     * @description on dialog close 
     */
    onNoClick(): void {
      this.dialogRef.close();
    }

}
