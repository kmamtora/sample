import { Type } from '@angular/core';
import { Role } from '../model/roles';
import { Service } from '../model/services';
import { MappingRolesServices } from '../model/mappingRolesServices';

export class Tab {
  public id: number;
  public title: string;
  public tabData: any;
  public mapRoleService_additional_config_multi: Array<MappingRolesServices> = [];
  public active: boolean;
  public component: Type<any>;

  constructor(component: Type<any>, title: string, tabData: any, mapRoleService_additional_config_multi: Array<MappingRolesServices>) {
    this.tabData = tabData;
    this.component = component;
    this.title = title;
    this.mapRoleService_additional_config_multi = mapRoleService_additional_config_multi;
  }
}