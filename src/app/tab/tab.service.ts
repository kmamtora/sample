import { Injectable } from '@angular/core';
import { Tab } from './tab.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabService {

  constructor() { }

  public tabs: Tab[] = [];

  public tabSub = new BehaviorSubject<Tab[]>(this.tabs);

  // TAB START
  public removeTab(index: number) {
    this.tabs.splice(index, 1);
    if (this.tabs.length > 0) {
      this.tabs[this.tabs.length - 1].active = true;
    }
    this.tabSub.next(this.tabs);
  }

  public clearTab() {
    this.tabs = [];
    this.tabSub.next(this.tabs);
  }
  
  public addTab(tab: Tab) {
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].active === true) {
        this.tabs[i].active = false;
      }
    }
    tab.id = this.tabs.length + 1;
    tab.active = false;
    this.tabs.push(tab);
    this.tabSub.next(this.tabs);
  }
  // TAB END
}
