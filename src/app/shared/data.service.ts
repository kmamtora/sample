import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Final } from '../model/final/final';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private subject = new Subject<any>();

  sendMessageFinal(message: Final) {
    this.subject.next({ text: message });
  }

  clearMessages() {
      this.subject.next();
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }
}
