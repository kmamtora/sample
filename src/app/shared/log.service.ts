import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private http: HttpClient) { }
  
  logStatement = "";

  public write(level: LogLevel, message: any, ...optionalParams: any[]) {
    let tmp = '';
    let SEPARATOR = " | ";
    for (let i = 0; i < optionalParams.length; i++) {
      const item = optionalParams[i];
      tmp = tmp + SEPARATOR + item;
    }
    this.logger(level, message + tmp);
  }

  getCurrentDate () {
    let now = new Date();
    return "[" + now.toLocaleString() + "]";
  }

  createLogStatement (level, message) {
    let SEPARATOR = " ";
    let date = this.getCurrentDate();
    return date + SEPARATOR + "[" + level + "]" + SEPARATOR + message;
  }

  logger(level, message) {
    this.logStatement = this.createLogStatement(level, message);
    // console.log(this.logStatement)
    let formData = new FormData();
    formData.append('data', this.logStatement);
    this.post(formData);
    // switch (level) {
    //   case 'debug' : {
    //     console.debug(this.logStatement);
    //     break;
    //   }
    //   case 'warning' : {
    //     console.warn(this.logStatement);
    //     break;
    //   }
    //   case 'info' : {
    //     console.info(this.logStatement);
    //     break;
    //   }
    //   case 'error' : {
    //     console.error(this.logStatement);
    //     break;
    //   }
    // }
  }

  public post(formData) {
    return this.http.post('/api/logs', formData).subscribe();
  }

}

export enum LogLevel {
  Debug = 'Debug',
  Info = 'Info',
  Warn = 'Warn',
  Error = 'Error',
}
