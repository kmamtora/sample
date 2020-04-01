import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-editor-json-dialog',
  templateUrl: './editor-json-dialog.component.html',
  styleUrls: ['./editor-json-dialog.component.css']
})
export class EditorJsonDialogComponent  {
  public editorOptions: JsonEditorOptions;
  public data1: any;
  @ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;
 
  constructor(public dialogRef: MatDialogRef<EditorJsonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

      this.editorOptions = new JsonEditorOptions()
      // this.editorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
      this.editorOptions.mode = 'code'; //set only one mode
      this.editorOptions.mainMenuBar = false;
      // this.editorOptions.enableSort = false;      
      // this.editorOptions.enableTransform = false;      
      // this.editorOptions.search = false;      
      // this.editorOptions.escapeUnicode = false;      
      // this.editorOptions.expandAll = false;      
      // this.editorOptions.sortObjectKeys = false;      
      this.data1 =  data;
     }

    /**
     * @description on dialog close
     */
    onNoClick(): void {
      this.dialogRef.close();
    }

}
