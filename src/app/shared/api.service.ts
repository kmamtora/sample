import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StatusNew } from '../model/status-new';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  _url = environment.api;

  constructor(private _httpClient: HttpClient) { }

  // to get status of the image
  public getImageStatus() : Observable<StatusNew> {
    // return this._httpClient.get<Array<StatusNew>>('./assets/data/api/status.json')
    return this._httpClient.get<StatusNew>(`${this._url}status`)
  }

  // to get md file template
  public getMDFile() {
    return this._httpClient.get('./assets/data/api/md.txt', {responseType: 'text'});
  }

  private extractData(res: Response) {
    let body = res;
    return body || { };
  }

  public getJson(): Observable<any> {
    return this._httpClient.get(`${this._url}generatejson`, httpOptions);
  }

  public postJson(formData): Observable<any> {
    return this._httpClient.post(`${this._url}generatejsonpost`, formData);
  }

  fnBuild(filepath) {
    return this._httpClient.post(`${this._url}build`, {fileName: filepath},
      {
          observe: 'events',
          reportProgress: true,
          responseType: 'text'
      });
  }

  /*
  * Working upload logo with events
  */
  fnUploadLogoEvent(formData) {
    return this._httpClient.post(`${this._url}logoupload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  /*
  * Workign upload logo with events
  */
  fnUploadLogo(formData) {
    return this._httpClient.post(`${this._url}logoupload`, formData);
  }

  fnUploadMdFile(formData) {
    return this._httpClient.post(`${this._url}mdfileupload`, formData);
  }

  fnGetMDFileFromServer() {
    return this._httpClient.get(`${this._url}mdfiledownload`);
  }

  fnGetJSONFile(formData) {
    return this._httpClient.post(`${this._url}readjsonfile`, formData);
  }

  fnGetWorkspace() {
    return this._httpClient.get(`${this._url}getworkspace`);
  }

  

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log(message);
  }

}
