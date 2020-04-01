import { Injectable } from '@angular/core';
import { Http, ResponseContentType, RequestOptions } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: Http) { }

  download(url) {
    const options = new RequestOptions({
        responseType: ResponseContentType.Blob
    });
    return this.http.get(url, options);
  }
}
