import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/shared/api.service';
import { StatusNew } from 'src/app/model/status-new';
import { LogService, LogLevel } from 'src/app/shared/log.service';

@Component({
  selector: 'app-image-status',
  templateUrl: './image-status.component.html',
  styleUrls: ['./image-status.component.css']
})
export class ImageStatusComponent implements OnInit {

  key_selectedIndex = "stepperIndex";
  mStatusDataSource: StatusNew;

  constructor(private router: Router, 
    private api: ApiService, private log: LogService) { }

  ngOnInit() {
    this.log.write(LogLevel.Info, 'ImageStatusComponent', 'ngOnInit');
    this.log.write(LogLevel.Info, 'ImageStatusComponent', 'api executed getImageStatus');
    let promise =  this.api.getImageStatus().toPromise();
    promise.then((res) => {
      this.mStatusDataSource = JSON.parse(res['data']);
    }).catch((err) => {
      this.log.write(LogLevel.Error, 'ImageStatusComponent', 'api executing getImageStatus failed', err);
    });
    sessionStorage.setItem(this.key_selectedIndex, "0");
  }
}
