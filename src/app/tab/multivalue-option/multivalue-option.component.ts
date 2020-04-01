import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/data.service';
import { Role } from 'src/app/model/roles';
import { Service } from 'src/app/model/services';
import { DefaultConfig } from 'src/app/model/defaultConfig';
import { MappingRolesServices } from 'src/app/model/mappingRolesServices';
import { UtilsService } from 'src/app/shared/utils.service';

@Component({
  selector: 'app-multivalue-option',
  templateUrl: './multivalue-option.component.html',
  styleUrls: ['./multivalue-option.component.css']
})
export class MultivalueOptionComponent implements OnInit {

  messages: any[] = [];
  subscription: Subscription;
  data: any;
  roleList: Array<Role> = [];
  serviceList: Array<Service> = [];

  selected_role_default_config: string[] = [];
  selected_role_default_config_selected: string[] = [];
  selected_role_additional_config_value_multi: string[] = [];
  
  error_additionalRole_multivalue = '';
  error_map_role_multivalue = '';
  error_map_service_multivalue = '';

  additionalConfigMulti = new DefaultConfig('',[]);
  additionalConfigMultiUpdateFlag = false;
  service_default_config: string[] = [];
  mapRoleService_additional_config_multi: Array<MappingRolesServices> = [];
  
  constructor(private _data: DataService, private _utils: UtilsService) { }

  ngOnInit() {
    
    this.roleList = this.data.role;
    this.serviceList = this.data.service;
    
    this.selected_role_default_config = [];
    this.service_default_config = [];

    if(this.roleList !== undefined) {
      if(this.roleList !== null && this.roleList.length > 0) {
        for (let index = 0; index < this.roleList.length; index++) {
          const element = this.roleList[index];
            this.selected_role_default_config.push(element['name']);
        }
      }
    }

    if(this.serviceList !== undefined) {
      if(this.serviceList !== null && this.serviceList.length > 0) {
        for (let index = 0; index < this.serviceList.length; index++) {
          const element = this.serviceList[index];
          this.service_default_config.push(element['name']);
        }
      }
    }

    if(this.mapRoleService_additional_config_multi !== undefined) {
      if(this.mapRoleService_additional_config_multi !== null && this.mapRoleService_additional_config_multi.length > 0) {
        for (let index = 0; index < this.mapRoleService_additional_config_multi.length; index++) {
          const element = this.mapRoleService_additional_config_multi[index];
          this.selected_role_additional_config_value_multi.push(element.role_id);
        }
      }
    }

    this.subscription = this._data.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
        // this.finalJson = JSON.parse(message.text);
        // console.log('Hi', message.text);
      } else {
        // clear messages when empty message received
        this.messages = [];
      }
    });
  }

  onChangeSelectedRoleAdditionalConfigMulti(event) {
    if(event.isUserInput) {
      if(this.selected_role_additional_config_value_multi === null) {
        this.selected_role_additional_config_value_multi = [];
        this.selected_role_default_config_selected = [];
      }
      if(event.source.selected) {
        this.selected_role_additional_config_value_multi.push(event.source.value);
        this.selected_role_default_config_selected = this.selected_role_default_config
      } else {
        var index = this.selected_role_additional_config_value_multi.indexOf(event.source.value);
        this.selected_role_additional_config_value_multi.splice(index, 1);
      }
    }
  }

  onChangeRoleServiceMapAdditionalConfigMulti(event) {
    if(!this.additionalConfigMultiUpdateFlag)
    {
      if(event.source.selected) {
        this.additionalConfigMulti = new DefaultConfig(event.source.value, []);
        this.additionalConfigMultiUpdateFlag = false;
      }
    }
  }

  onMapRoleServiceAdditionalConfigMulti() {
    if(this.selected_role_additional_config_value_multi === null || this.selected_role_additional_config_value_multi.length === 0) {
      this._utils.openSnackBar('Please select Additional Role', '');
      return;
    }

    if(this.additionalConfigMulti.role === null || this.additionalConfigMulti.role.trim() === '') {
      this._utils.openSnackBar('Please select Role', '');
      // this.error_map_role_multivalue = 'Please select Role';
      return;
    }
    if(this.additionalConfigMulti.service === null || this.additionalConfigMulti.service.length === 0) {
      this._utils.openSnackBar('Please select Service', '');
      // this.error_map_service_multivalue = 'Please select Service';
      return;
    }
    if(this.mapRoleService_additional_config_multi === null) {
      this.mapRoleService_additional_config_multi = new Array<MappingRolesServices>();
    }
    var x = 0; var flag = false;
    if(!this.additionalConfigMultiUpdateFlag) {
      if(this.mapRoleService_additional_config_multi != null && this.mapRoleService_additional_config_multi.length > 0){
        for (let i = 0; i < this.mapRoleService_additional_config_multi.length; i++) {
          const element = this.mapRoleService_additional_config_multi[i];
          if(element.role_id === this.additionalConfigMulti.role){
            this._utils.openSnackBar(`Role \'${element.role_id}\' already added`, '');
            flag = true;
            break;
          }    
        }
      }
      if(!flag) {
        this.mapRoleService_additional_config_multi.push(<MappingRolesServices>{ role_id: this.additionalConfigMulti.role, service_ids: this.additionalConfigMulti.service  });
        this.additionalConfigMulti = new DefaultConfig('',[]);
        this.additionalConfigMultiUpdateFlag = false;
      }
    } else {
      var index = -1;
      if(this.mapRoleService_additional_config_multi != null && this.mapRoleService_additional_config_multi.length > 0){
        for (let i = 0; i < this.mapRoleService_additional_config_multi.length; i++) {
          const element = this.mapRoleService_additional_config_multi[i];
          if(element.role_id === this.additionalConfigMulti.role){
            flag = true;
            index = i;
            break;
          }    
        }
      }
      if(flag) {
        if(index > -1) {
          this.mapRoleService_additional_config_multi[index].service_ids = this.additionalConfigMulti.service;
          this.additionalConfigMulti = new DefaultConfig('',[]);
          this.additionalConfigMultiUpdateFlag = false;
        }
      }
      this.additionalConfigMultiUpdateFlag = false;
    }
  }

  onEditAdditionalConfigMulti(item) {
    this.additionalConfigMultiUpdateFlag = true;
    this.additionalConfigMulti = new DefaultConfig(item.role_id, item.service_ids);
  }

  onDeleteAdditionalConfigMulti(item) {
    var index = this.mapRoleService_additional_config_multi.indexOf(item);
    if(index > -1) {
      this.mapRoleService_additional_config_multi.splice(index, 1);
    }
  }

}
