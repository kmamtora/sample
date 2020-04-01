import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EditorJsonDialogComponent } from '../editor-json-dialog/editor-json-dialog.component';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/data.service';
import { ApiService } from 'src/app/shared/api.service';
import { LogService, LogLevel } from 'src/app/shared/log.service';
import { HttpDownloadProgressEvent, HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { FileService } from 'src/app/file.service';

@Component({
  selector: 'app-step-build',
  templateUrl: './step-build.component.html',
  styleUrls: ['./step-build.component.css']
})
export class StepBuildComponent implements OnInit {

  lbl_status = '';
  consoleOutput = '';
  jsonfilename = 'sample.json';
  key_jsonfilename = "jsonfile";
  messages: any[] = [];
  subscription: Subscription;
  jsonStr: any;
  constructor(public _dialog: MatDialog, private _data: DataService, private api: ApiService,
    private log: LogService, private fileService: FileService) { }

  /**
   * @description handle any additional initialization tasks
   */
  ngOnInit() {
    this.log.write(LogLevel.Debug, 'StepBuildComponent');
    this.subscription = this._data.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
        // this.finalJson = JSON.parse(JSON.stringify(message.text));
      } else {
        // clear messages when empty message received
        this.messages = [];
      }
    });
  }

  /**
   * @description app starts building when build button is clicked
   */
  fnBuild() {
    this.download();
    
    return;
    this.log.write(LogLevel.Debug, 'StepBuildComponent', 'fnBuild');
    this.lbl_status = 'Building...';
    this.api.fnBuild(sessionStorage.getItem(this.key_jsonfilename)).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          let progressEvent = event as HttpDownloadProgressEvent;
          if (progressEvent.partialText) {
            console.log("-----RESPONSE-----");
            console.log(progressEvent.partialText);
            this.consoleOutput = progressEvent.partialText;
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.lbl_status = 'Failed!';
      },
      complete: () => {
        console.log("-----COMPLETE-----");
        this.consoleOutput += "\n" + "BUILD COMPLETED"
        this.lbl_status = 'Completed.';
      },
    });
  }

  download() {
    this.fileService.download("/api/download").subscribe(
      res => {
          const blob = new Blob([res.blob()], { type : 'application/binary' });
          const file = new File([blob], 'test.bin', { type: 'application/binary' });
          console.log('success', res);
          saveAs(file);
      },
      res => {
          // notify error
          console.log('err', res);
      }
    );
  }

  /**
   * @description executes this event when the instance is destroyed
   */
  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  /**
   * @description Open's the dialog for JSON View
   */
  openDialogEditor() {
    this.log.write(LogLevel.Debug, 'StepBuildComponent', 'openDialogEditor');
    let dialogRef = null;
    // api
    let formData = new FormData();
    formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
    let promise =  this.api.fnGetJSONFile(formData).toPromise();
    promise.then((data)=>{
      if(data['status'] === 201) {
        this.jsonStr = JSON.parse(data['data']);
        dialogRef = this._dialog.open(EditorJsonDialogComponent, {
          hasBackdrop: true,
          width: '750px',
          data: { jsonData:  this.jsonStr}
        });
      }
    }).catch((error)=>{
    });

    if(dialogRef === undefined) {
      dialogRef.afterClosed().subscribe(result => {
        if(result !== undefined) {
        }
      });
    }
    this.log.write(LogLevel.Debug, 'StepBuildComponent', 'openDialogEditor', JSON.stringify(this.jsonStr));
  }

  /**
   * @description Download the JSON
   */
  fnDownloadJson() {
    this.log.write(LogLevel.Debug, 'StepBuildComponent', 'fnDownloadJson');
    let formData = new FormData();
    formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
    let promise =  this.api.fnGetJSONFile(formData).toPromise();
    promise.then((data)=>{
      if(data['status'] === 201) {
        this.jsonStr = data['data'];
        var sJson = data['data'];
        var element = document.createElement('a');
        element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
        element.setAttribute('download', sessionStorage.getItem(this.key_jsonfilename));
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click(); // simulate click
        document.body.removeChild(element);
      }
    }).catch((error)=>{
    });
  }
}
