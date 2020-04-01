import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription, from, config } from 'rxjs';
import { StepImageDetailComponent } from '../step-image-detail/step-image-detail.component';
import { StepServiceRoleComponent } from '../step-service-role/step-service-role.component';
import { StepConfigChoiceComponent } from '../step-config-choice/step-config-choice.component';
import { StepContainerAppConfigComponent } from '../step-container-app-config/step-container-app-config.component';
import { MatStepper } from '@angular/material/stepper';
import { DataService } from 'src/app/shared/data.service';
import { UtilsService } from 'src/app/shared/utils.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/shared/api.service';
import {Final} from '../../model/final/final';
import {catalog} from '../../model/final/catalog';
import { service } from 'src/app/model/final/services';
import { role } from 'src/app/model/final/role';
import { LogService, LogLevel } from 'src/app/shared/log.service';

@Component({
  selector: 'app-build-custom-image',
  templateUrl: './build-custom-image.component.html',
  styleUrls: ['./build-custom-image.component.css'],
})
export class BuildCustomImageComponent implements OnInit {

  messages: any[] = [];
  subscription: Subscription;
  loading = false;


  final = new Final();

  selectedIndex = 0;
  previousSelectedIndex = 0;

  wbTemplate: any;
  finalJsonPath = '';

  key_selectedIndex = "stepperIndex";

  mdFilePath = '';

  jsonfilename = 'sample.json';
  key_jsonfilename = "jsonfile";



  @ViewChild(StepImageDetailComponent, { static: false }) stepImageDetailComponent: StepImageDetailComponent;
  @ViewChild(StepServiceRoleComponent, { static: false }) stepServiceRoleComponent: StepServiceRoleComponent;
  @ViewChild(StepConfigChoiceComponent, { static: false }) stepConfigChoiceComponent: StepConfigChoiceComponent;
  @ViewChild(StepContainerAppConfigComponent, { static: false }) stepContainerAppConfigComponent: StepContainerAppConfigComponent;
  @ViewChild("stepper", { static: true }) myStepper: MatStepper;


  constructor(private _data: DataService, private _utils: UtilsService,
    private route: Router, private api: ApiService, private log: LogService) { }

  /**
   * @description handle any additional initialization tasks
   */
  ngOnInit() {
    this.log.write(LogLevel.Debug, 'BuildCustomImageComponent');
    this.selectedIndex = sessionStorage.getItem(this.key_selectedIndex) === null ? 0 : Number.parseInt(sessionStorage.getItem(this.key_selectedIndex));
    // this.selectedIndex = 0;
    let promise =  this.api.getJson().toPromise();
    promise.then((data)=>{
      if(data['status'] === 201) {
          this.final = data['data'];
          this.jsonfilename = data['message'];
          sessionStorage.setItem(this.key_jsonfilename, this.jsonfilename);
          this._data.sendMessageFinal(this.final);
        }
      if(data['status'] === 400) {
        // console.log(data['message']);
        sessionStorage.setItem(this.key_jsonfilename, this.jsonfilename);
      }
    }).catch((error)=>{
    });
  }

  /**
   * @description executes this event when the instance is destroyed
   */
  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    // this.subscription.unsubscribe();
  }

  /**
   * @description Stepper - on next click get all the data from the 4 pages and creates dictionary
   * @param stepper
   */
  fnNext(stepper: MatStepper) {
    this.selectedIndex = stepper.selectedIndex;
    var _flag = false;
    this.stepContainerAppConfigComponent.openDialogFlag = false;

    // TODO: Image Details
    if(stepper.selectedIndex === 0) {
      if(!this.stepImageDetailComponent.form.valid) {
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent');
        this.stepImageDetailComponent.form.markAllAsTouched()
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent invalid form');
        _flag = false;
        if(this.stepImageDetailComponent.categoryList === null || this.stepImageDetailComponent.categoryList.length === 0) {
          this.stepImageDetailComponent.categoryVisible = true;
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent categoryList is 0');
          _flag = false;
          return;
        }
        return;
      } else {
        if(this.stepImageDetailComponent.categoryList.length == 0) {
          this.stepImageDetailComponent.categoryVisible = true;
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent categoryList is 0');
          _flag = false;
          return;
        } else {
          this.stepImageDetailComponent.categoryVisible = false;
          _flag = true;

          let formData = new FormData();
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent valid form');
          formData.append('data', JSON.stringify(this.fnGenerateFinal()));
          formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
          let promise = this.api.postJson(formData).toPromise();
          promise.then((data)=>{
            if(data['status'] === 201) {

              this.final = data['data'];
              this._data.clearMessages();
              this._data.sendMessageFinal(this.final);
              _flag = true;

              stepper.next();
              sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex + 1).toString());
            }
          }).catch((error)=>{
            _flag = false;
          });
        }
      }
    }

    // TODO: Service & Roles
    if(stepper.selectedIndex === 1) {
      this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent');
      if(this.stepServiceRoleComponent.mServiceDataSource1 !== undefined) {
        if(this.stepServiceRoleComponent.mServiceDataSource1 !== null && this.stepServiceRoleComponent.mServiceDataSource1.length > 0) {
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mServiceDataSource1 is 0');

          _flag = true;
        } else {
          _flag = false;
          this._utils.openSnackBar('Please add serivce', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mServiceDataSource1 is 0', 'Please add serivce');
          return;
        }
      }

      if(this.stepServiceRoleComponent.mRoleDataSource1 !== undefined) {
        if(this.stepServiceRoleComponent.mRoleDataSource1 !== null && this.stepServiceRoleComponent.mRoleDataSource1.length > 0) {
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mRoleDataSource1 is 0');
          _flag = true;
        } else {
          _flag = false;
          this._utils.openSnackBar('Please add role', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mRoleDataSource1 is 0', 'Please add role');
          return;
        }
      }


      if(_flag) {
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent valid form');
        let formData = new FormData();
        formData.append('data', JSON.stringify(this.fnGenerateFinal()));
        formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
        let promise = this.api.postJson(formData).toPromise();
        promise.then((data)=>{
          if(data['status'] === 201) {
            _flag = true;
            this.final = data['data'];
            this._data.clearMessages();
            this._data.sendMessageFinal(this.final);
            sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex + 1).toString());
            setTimeout(() => stepper.next(), 200);
          }
        }).catch((error)=>{
          _flag = false;
        });
      }

    }

    // TODO: Config Choice
    if(stepper.selectedIndex === 2) {
      _flag = false;

      if(this.stepConfigChoiceComponent.selected_role_default_config_value !== null && this.stepConfigChoiceComponent.selected_role_default_config_value.length >0) {
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepConfigChoiceComponent is invalid form');
        _flag = true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please select selected roles', '');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepConfigChoiceComponent', 'Please select selected roles');
        return;
      }
      if(this.stepConfigChoiceComponent.mapRoleService_default_config !== null && this.stepConfigChoiceComponent.mapRoleService_default_config.length > 0) {
        _flag =true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please add role to serivce mapping', '');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepConfigChoiceComponent', 'Please add role to serivce mapping');
        return;
      }

      if(_flag) {
        let formData = new FormData();
        formData.append('data', JSON.stringify(this.fnGenerateFinal()));
        formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
        let promise = this.api.postJson(formData).toPromise();
        promise.then((data)=>{
          if(data['status'] === 201) {
            //console.log(data);
            // this.finalJson = JSON.parse(data['data']);
            this.final = data['data'];
            this._data.clearMessages();
            this._data.sendMessageFinal(this.final);
            sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex + 1).toString());
            // stepper.selected.completed = true;
            stepper.next();
            // this.myStepper.next();
          }
        }).catch((error)=>{
        });
      }
    }

    // TODO: Container Image App Config
    if(stepper.selectedIndex === 3) {
      this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent');
      if(this.stepServiceRoleComponent.mRoleDataSource1 !== undefined) {
        if(this.stepServiceRoleComponent.mRoleDataSource1 !== null && this.stepServiceRoleComponent.mRoleDataSource1.length > 0) {
        var cntBuild = 0;
        var cntRegistery = 0;
        var cntNone = 0;

          for(let i = 0; i < this.stepServiceRoleComponent.mRoleDataSource1.length; i++) {
            var item = this.stepServiceRoleComponent.mRoleDataSource1[i];
            if(item.image === undefined || item.image === null || (item.image.build === undefined && item.image.build === null && item.image.load === undefined && item.image.load === null)) {
              cntNone = cntNone + 1;
            }
            if((item.image.build === undefined && item.image.build === null && item.image.load === undefined && item.image.load === null)) {
              cntNone = cntNone + 1;
            }
            if((item.image.build === undefined && item.image.load === undefined)) {
              cntNone = cntNone + 1;
            }
            if(item.image.build === undefined || item.image.build === null) {
              cntBuild = cntBuild + 1;
            }
            if(item.image.load === undefined || item.image.load === null) {
              cntRegistery = cntRegistery + 1;
            }

          }

        }
      }

      if(cntNone > 0 && this.stepContainerAppConfigComponent.selected_container_value === 'None') {
              this._utils.openSnackBar('Please select container image', '');
              this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'None', 'Please select container image');
              return;
      }

      if(this.stepContainerAppConfigComponent.selected_container_value === 'Build an image') {
        if(this.stepContainerAppConfigComponent.build_base_dir === '') {
          this._utils.openSnackBar('Please browse docker file path','');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Build an image', 'Please browse docker file path');
          return;
        }
        if(this.stepContainerAppConfigComponent.build_repo_tag === '') {
          this._utils.openSnackBar('Please enter image repo tag', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Build an image', 'Please enter image repo tag');
          return;
        }
        if(this.stepContainerAppConfigComponent.build_os_type_value === '') {
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Build an image', 'Please select os type');
          this._utils.openSnackBar('Please select os type', '');
          return;
        }
      }

      if(this.stepContainerAppConfigComponent.selected_container_value === 'Pull from registry') {
        if(this.stepContainerAppConfigComponent.registry_repo_tag === '') {
          this._utils.openSnackBar('Please enter image repo tag', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Pull from registry', 'Please enter image repo tag');
          return;
        }
        if(this.stepContainerAppConfigComponent.registry_os_type_value === '') {
          this._utils.openSnackBar('Please select os type', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Pull from registry', 'Please select os type');
          return;
        }
        if(this.stepContainerAppConfigComponent.url === '') {
          this._utils.openSnackBar('Please enter url', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Pull from registry', 'Please enter url');
          return;
        }
      }

      if( this.stepContainerAppConfigComponent.appConfigPath !== "") {
        _flag = true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please browse app config path','');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Please browse app config path');
        return;
      }

      if( this.stepContainerAppConfigComponent.imagePreview !== "") {
        _flag = true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please browse logo file','');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Please browse logo file');
        return;
      }
      this.stepContainerAppConfigComponent.openDialogFlag = false;
      if(_flag) {
        let formData = new FormData();
        formData.append('data', JSON.stringify(this.fnGenerateFinal()));
        formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
        let promise1 = this.api.postJson(formData).toPromise();
        promise1.then((data)=>{
          if(data['status'] === 201) {
            _flag = true;

            this.final = data['data'];
            this._data.clearMessages();
            this._data.sendMessageFinal(this.final);
            sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex + 1).toString());
            stepper.next();
          }
        }).catch((error)=>{
          _flag = false;
        });
      }
    }
  }


  /**
   * @description read the pages form data and creates the desired dictionary
   */
  fnGenerateFinal() {
    var tmpFinal = new Final();

    // IMAGE DETAIL
    var  _catalog = new catalog();
    _catalog.name = this.stepImageDetailComponent.form.value.appName;
    _catalog.description = this.stepImageDetailComponent.form.value.appDescription;
    _catalog.version = this.stepImageDetailComponent.form.value.appVersion;
    _catalog.distroid = this.stepImageDetailComponent.form.value.appDistroID;
    _catalog.categories = this.stepImageDetailComponent.categoryList;
    tmpFinal.catalog = _catalog;

    // SERVICES
    var _services: service[] = [];
    for(let i = 0; i < this.stepServiceRoleComponent.mServiceDataSource1.length; i++) {
      _services.push(this.stepServiceRoleComponent.mServiceDataSource1[i]);
    }
    tmpFinal.services = _services;

    // ROLES
    var _roles: role[] = [];
    for(let i = 0; i < this.stepServiceRoleComponent.mRoleDataSource1.length; i++) {
      _roles.push(this.stepServiceRoleComponent.mRoleDataSource1[i]);
    }
    tmpFinal.roles = _roles;

    // CONFIGKEYS
    if(this.stepConfigChoiceComponent.mConfigMeta !== null && this.stepConfigChoiceComponent.mConfigMeta.length > 0) {
      let configmetadata = {};
      for(let i = 0; i < this.stepConfigChoiceComponent.mConfigMeta.length; i++) {
        var configMeta = this.stepConfigChoiceComponent.mConfigMeta[i];
        configmetadata[configMeta.name] = configMeta.value;
      }
      // console.log(configmetadata);
      tmpFinal.configkeys = configmetadata;
    }

    // DEFAULT
    let type_default_str = '';
    if(this.stepConfigChoiceComponent.mapRoleService_default_config !== null && this.stepConfigChoiceComponent.mapRoleService_default_config.length > 0) {
      let type_default = {};
      type_default['id'] = "default";
      type_default['type'] = "default";
       let role_services_default = {};
      for(let i = 0; i < this.stepConfigChoiceComponent.mapRoleService_default_config.length; i++) {
        let type_default_single = this.stepConfigChoiceComponent.mapRoleService_default_config[i];

        let services = [];
        for(let s in type_default_single.service_ids) {
          let exist_service = _services.find(x=>x.name === type_default_single.service_ids[s]);
          if(exist_service != undefined) {
            services.push(type_default_single.service_ids[s]);
          }
        }
        let exist_role = _roles.find(x=>x.name === type_default_single.role_id);
        if(exist_role != undefined) {
          role_services_default[type_default_single.role_id] = services;
        }

      }
      type_default['role_services'] = role_services_default;
      type_default_str = JSON.stringify(type_default);
    }

    // STRING
    let type_string_str = '';
    if(this.stepConfigChoiceComponent.mConfigChoices_String !== null && this.stepConfigChoiceComponent.mConfigChoices_String.length > 0) {
      for(let i=0; i<this.stepConfigChoiceComponent.mConfigChoices_String.length; i++) {
        let type_string_single = this.stepConfigChoiceComponent.mConfigChoices_String[i];
        let type_string = {};
        type_string['id'] = type_string_single['id'];
        type_string['type'] = "string";
        type_string['name'] = type_string_single['name'];
        if(i === this.stepConfigChoiceComponent.mConfigChoices_String.length - 1) {
          type_string_str = type_string_str + JSON.stringify(type_string);
        } else {
          type_string_str = type_string_str + JSON.stringify(type_string) + ", " ;
        }
      }
    }

    // PASSWORD
    let type_pwd_str = '';
    if(this.stepConfigChoiceComponent.mConfigChoices_Password !== null && this.stepConfigChoiceComponent.mConfigChoices_Password.length > 0) {

      for(let i=0; i<this.stepConfigChoiceComponent.mConfigChoices_Password.length; i++) {
        let type_pwd_single = this.stepConfigChoiceComponent.mConfigChoices_Password[i];
        let type_pwd = {};
        type_pwd['id'] = type_pwd_single['id'];
        type_pwd['type'] = "password";
        type_pwd['name'] = type_pwd_single['name'];
        if(i === this.stepConfigChoiceComponent.mConfigChoices_Password.length - 1) {
          type_pwd_str = type_pwd_str + JSON.stringify(type_pwd);
        } else {
          type_pwd_str = type_pwd_str + JSON.stringify(type_pwd) + ", " ;
        }
      }
    }

    // BOOLEAN
    let type_boolean_str = '';
    if(this.stepConfigChoiceComponent.additionalConfigBooleanArr !== null && this.stepConfigChoiceComponent.additionalConfigBooleanArr.length > 0) {

      for(let i=0; i<this.stepConfigChoiceComponent.additionalConfigBooleanArr.length; i++) {
        let type_boolean_single = this.stepConfigChoiceComponent.additionalConfigBooleanArr[i];
        let type_boolean = {};
        type_boolean['id'] = type_boolean_single['_id'];
        type_boolean['type'] = 'boolean';
        type_boolean['label'] = type_boolean_single['name'];

        let opt = {};
        opt['option'] = true;
        let tmp = type_boolean_single['map'];
        let role_services = {};
        for(let j =0; j<tmp.length; j++) {
          let services = [];
          for(let rs in tmp[j]['service_ids']) {
            services.push(tmp[j]['service_ids'][rs]);
          }
          // role_services[tmp[j]['role_id']] = services;

          let services_filtered = [];
          for(let s in services) {
            let exist_service = _services.find(x=>x.name === services[s]);
            if(exist_service != undefined) {
              services_filtered.push(services[s]);
            }
          }
          let exist_role = _roles.find(x=>x.name === tmp[j]['role_id']);
          if(exist_role != undefined) {
            role_services[tmp[j]['role_id']] = services_filtered;
          }

        }

        opt['role_services'] = role_services;
        type_boolean['options'] = opt;

        if(i === this.stepConfigChoiceComponent.additionalConfigBooleanArr.length - 1) {
          type_boolean_str = type_boolean_str + JSON.stringify(type_boolean);
        } else {
          type_boolean_str = type_boolean_str + JSON.stringify(type_boolean) + ",";
        }
      }
    }

     // MUTIVALUE
     let type_multi_str = '';
     if(this.stepConfigChoiceComponent.additionalConfigMultiArr_TabOption1 !== null && this.stepConfigChoiceComponent.additionalConfigMultiArr_TabOption1.length > 0) {
       let type_multi1 = {};
       let opt1 = {};
       let opts1 = [];
       for(let i=0; i<this.stepConfigChoiceComponent.additionalConfigMultiArr_TabOption1.length; i++) {
        let type_multi_single = this.stepConfigChoiceComponent.additionalConfigMultiArr_TabOption1[i];
        if(type_multi_single['nameSpan'] > 0) {
          if(opts1.length > 0) {
            type_multi1['options'] = opts1;
            type_multi_str = type_multi_str + JSON.stringify(type_multi1);
          }
          type_multi1 = {};
          type_multi1['id'] = type_multi_single['_id'];
          type_multi1['type'] = 'multi';
          type_multi1['label'] = type_multi_single['name'];
          opts1 = [];
        }
        opt1 = {};
        opt1['option'] = type_multi_single['option'];
        let tmp = type_multi_single['map'];
        let role_services = {};
        for(let j =0; j<tmp.length; j++) {
          let services = [];
          for(let rs in tmp[j]['service_ids']) {
            services.push(tmp[j]['service_ids'][rs]);
          }
          // role_services[tmp[j]['role_id']] = services;

          let services_filtered = [];
          for(let s in services) {
            let exist_service = _services.find(x=>x.name === services[s]);
            if(exist_service != undefined) {
              services_filtered.push(services[s]);
            }
          }
          let exist_role = _roles.find(x=>x.name === tmp[j]['role_id']);
          if(exist_role != undefined) {
            role_services[tmp[j]['role_id']] = services_filtered;
          }
        }

        opt1['role_services'] = role_services;

        opts1.push(opt1);

        if(i === this.stepConfigChoiceComponent.additionalConfigMultiArr_TabOption1.length - 1) {
          if(opts1.length > 0) {
            type_multi1['options'] = opts1;
            type_multi_str = type_multi_str + JSON.stringify(type_multi1);
          }
        }
       }
       type_multi_str = type_multi_str.split("}{").join("},{");
     }

    //  CONFIG CHOICES
    let configchoices = [];
    let configchoices_str = '';
    if(type_default_str.length > 0) {
      configchoices_str = configchoices_str + type_default_str;
    }
    if(type_string_str.length > 0) {
      configchoices_str = configchoices_str + "," + type_string_str;
    }
    if(type_pwd_str.length > 0) {
      configchoices_str = configchoices_str + "," + type_pwd_str;
    }
    if(type_boolean_str.length > 0) {
      configchoices_str = configchoices_str + "," + type_boolean_str;
    }
    if(type_multi_str.length > 0) {
      configchoices_str = configchoices_str + "," + type_multi_str;
    }
    configchoices_str = "["+configchoices_str+"]";

    configchoices = JSON.parse(configchoices_str);
    tmpFinal.clusterconfig = configchoices;

    // APP CONFIG
    tmpFinal.appconfig = { basedir: this.stepContainerAppConfigComponent.appConfigPath };
    tmpFinal.document = { filepath: this.stepContainerAppConfigComponent.mdFilePath };
    tmpFinal.logo = { filepath: this.stepContainerAppConfigComponent.imagePreview };

    // IMAGE
    if(this.stepContainerAppConfigComponent.selected_container_value === 'None') {
      tmpFinal.image = null;
    }
    if(this.stepContainerAppConfigComponent.selected_container_value === 'Build an image') {
      // tmpJson.container = 'build';
      var build1 = {};
      build1['basedir'] = this.stepContainerAppConfigComponent.build_base_dir;
      build1['repotag'] = this.stepContainerAppConfigComponent.build_repo_tag;
      build1['os'] = this.stepContainerAppConfigComponent.build_os_type_value;
      tmpFinal.image = { build: build1 };
    }

    if(this.stepContainerAppConfigComponent.selected_container_value === 'Pull from registry') {
      // tmpJson.container = 'load';
      var load1 = {};
      load1['repotag'] = this.stepContainerAppConfigComponent.registry_repo_tag;
      load1['os'] = this.stepContainerAppConfigComponent.registry_os_type_value;
      let registry = {};
      registry['url'] = this.stepContainerAppConfigComponent.url;
      registry['contentTrust'] = this.stepContainerAppConfigComponent.contentTrust;
      registry['authentication'] = this.stepContainerAppConfigComponent.authentication;
      load1['registry'] = registry;
      tmpFinal.image = { load: load1 };
    }

    // console.log(tmpFinal);
    this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnGenerateFinal', JSON.stringify(tmpFinal));
    return tmpFinal;
  }

/**
 * @description on every previous click event is executed
 * @param stepper
 */
  fnPrevious(stepper: MatStepper) {
    this.selectedIndex = stepper.selectedIndex - 1;
    sessionStorage.setItem(this.key_selectedIndex, this.selectedIndex.toString());
    this.selectedIndex = sessionStorage.getItem(this.key_selectedIndex) === null ? 0 : Number.parseInt(sessionStorage.getItem(this.key_selectedIndex));

    // stepper.previous();
    this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnPrevious');

    var _flag = false;
    this.stepContainerAppConfigComponent.openDialogFlag = false;

    // TODO: Image Details
    if(stepper.selectedIndex === 0) {
      if(!this.stepImageDetailComponent.form.valid) {
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent');
        this.stepImageDetailComponent.form.markAllAsTouched()
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent invalid form');
        _flag = false;
        if(this.stepImageDetailComponent.categoryList === null || this.stepImageDetailComponent.categoryList.length === 0) {
          this.stepImageDetailComponent.categoryVisible = true;
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent categoryList is 0');
          _flag = false;
          return;
        }
        return;
      } else {
        if(this.stepImageDetailComponent.categoryList.length == 0) {
          this.stepImageDetailComponent.categoryVisible = true;
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent categoryList is 0');
          _flag = false;
          return;
        } else {
          this.stepImageDetailComponent.categoryVisible = false;
          _flag = true;

          let formData = new FormData();
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepImageDetailComponent valid form');
          formData.append('data', JSON.stringify(this.fnGenerateFinal()));
          formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
          let promise = this.api.postJson(formData).toPromise();
          promise.then((data)=>{
            if(data['status'] === 201) {

              this.final = data['data'];
              this._data.clearMessages();
              this._data.sendMessageFinal(this.final);
              _flag = true;

              stepper.previous();
              sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex - 1).toString());
            }
          }).catch((error)=>{
            _flag = false;
          });
        }
      }
    }

    // TODO: Service & Roles
    if(stepper.selectedIndex === 1) {
      this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent');
      if(this.stepServiceRoleComponent.mServiceDataSource1 !== undefined) {
        if(this.stepServiceRoleComponent.mServiceDataSource1 !== null && this.stepServiceRoleComponent.mServiceDataSource1.length > 0) {
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mServiceDataSource1 is 0');

          _flag = true;
        } else {
          _flag = false;
          this._utils.openSnackBar('Please add serivce', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mServiceDataSource1 is 0', 'Please add serivce');
          return;
        }
      }

      if(this.stepServiceRoleComponent.mRoleDataSource1 !== undefined) {
        if(this.stepServiceRoleComponent.mRoleDataSource1 !== null && this.stepServiceRoleComponent.mRoleDataSource1.length > 0) {
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mRoleDataSource1 is 0');
          _flag = true;
        } else {
          _flag = false;
          this._utils.openSnackBar('Please add role', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent mRoleDataSource1 is 0', 'Please add role');
          return;
        }
      }


      if(_flag) {
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepServiceRoleComponent valid form');
        let formData = new FormData();
        formData.append('data', JSON.stringify(this.fnGenerateFinal()));
        formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
        let promise = this.api.postJson(formData).toPromise();
        promise.then((data)=>{
          if(data['status'] === 201) {
            _flag = true;
            this.final = data['data'];
            this._data.clearMessages();
            this._data.sendMessageFinal(this.final);
            sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex - 1).toString());
            setTimeout(() => stepper.previous(), 200);
          }
        }).catch((error)=>{
          _flag = false;
        });
      }

    }

    // TODO: Config Choice
    if(stepper.selectedIndex === 2) {
      _flag = false;

      if(this.stepConfigChoiceComponent.selected_role_default_config_value !== null && this.stepConfigChoiceComponent.selected_role_default_config_value.length >0) {
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepConfigChoiceComponent is invalid form');
        _flag = true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please select selected roles', '');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepConfigChoiceComponent', 'Please select selected roles');
        return;
      }
      if(this.stepConfigChoiceComponent.mapRoleService_default_config !== null && this.stepConfigChoiceComponent.mapRoleService_default_config.length > 0) {
        _flag =true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please add role to serivce mapping', '');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepConfigChoiceComponent', 'Please add role to serivce mapping');
        return;
      }

      if(_flag) {
        let formData = new FormData();
        formData.append('data', JSON.stringify(this.fnGenerateFinal()));
        formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
        let promise = this.api.postJson(formData).toPromise();
        promise.then((data)=>{
          if(data['status'] === 201) {
            //console.log(data);
            // this.finalJson = JSON.parse(data['data']);
            this.final = data['data'];
            this._data.clearMessages();
            this._data.sendMessageFinal(this.final);
            sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex - 1).toString());
            // stepper.selected.completed = true;
            stepper.previous();
            // this.myStepper.next();
          }
        }).catch((error)=>{
        });
      }
    }

    // TODO: Container Image App Config
    if(stepper.selectedIndex === 3) {
      this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent');
      if(this.stepServiceRoleComponent.mRoleDataSource1 !== undefined) {
        if(this.stepServiceRoleComponent.mRoleDataSource1 !== null && this.stepServiceRoleComponent.mRoleDataSource1.length > 0) {
        var cntBuild = 0;
        var cntRegistery = 0;
        var cntNone = 0;

          for(let i = 0; i < this.stepServiceRoleComponent.mRoleDataSource1.length; i++) {
            var item = this.stepServiceRoleComponent.mRoleDataSource1[i];
            if(item.image === undefined || item.image === null || (item.image.build === undefined && item.image.build === null && item.image.load === undefined && item.image.load === null)) {
              cntNone = cntNone + 1;
            }
            if((item.image.build === undefined && item.image.build === null && item.image.load === undefined && item.image.load === null)) {
              cntNone = cntNone + 1;
            }
            if((item.image.build === undefined && item.image.load === undefined)) {
              cntNone = cntNone + 1;
            }
            if(item.image.build === undefined || item.image.build === null) {
              cntBuild = cntBuild + 1;
            }
            if(item.image.load === undefined || item.image.load === null) {
              cntRegistery = cntRegistery + 1;
            }

          }

        }
      }

      if(cntNone > 0 && this.stepContainerAppConfigComponent.selected_container_value === 'None') {
              this._utils.openSnackBar('Please select container image', '');
              this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'None', 'Please select container image');
              return;
      }

      if(this.stepContainerAppConfigComponent.selected_container_value === 'Build an image') {
        if(this.stepContainerAppConfigComponent.build_base_dir === '') {
          this._utils.openSnackBar('Please browse docker file path','');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Build an image', 'Please browse docker file path');
          return;
        }
        if(this.stepContainerAppConfigComponent.build_repo_tag === '') {
          this._utils.openSnackBar('Please enter image repo tag', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Build an image', 'Please enter image repo tag');
          return;
        }
        if(this.stepContainerAppConfigComponent.build_os_type_value === '') {
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Build an image', 'Please select os type');
          this._utils.openSnackBar('Please select os type', '');
          return;
        }
      }

      if(this.stepContainerAppConfigComponent.selected_container_value === 'Pull from registry') {
        if(this.stepContainerAppConfigComponent.registry_repo_tag === '') {
          this._utils.openSnackBar('Please enter image repo tag', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Pull from registry', 'Please enter image repo tag');
          return;
        }
        if(this.stepContainerAppConfigComponent.registry_os_type_value === '') {
          this._utils.openSnackBar('Please select os type', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Pull from registry', 'Please select os type');
          return;
        }
        if(this.stepContainerAppConfigComponent.url === '') {
          this._utils.openSnackBar('Please enter url', '');
          this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Pull from registry', 'Please enter url');
          return;
        }
      }

      if( this.stepContainerAppConfigComponent.appConfigPath !== "") {
        _flag = true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please browse app config path','');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Please browse app config path');
        return;
      }

      if( this.stepContainerAppConfigComponent.imagePreview !== "") {
        _flag = true;
      } else {
        _flag = false;
        this._utils.openSnackBar('Please browse logo file','');
        this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnNext', 'stepContainerAppConfigComponent', 'Please browse logo file');
        return;
      }
      this.stepContainerAppConfigComponent.openDialogFlag = false;
      if(_flag) {
        let formData = new FormData();
        formData.append('data', JSON.stringify(this.fnGenerateFinal()));
        formData.append('fileName', sessionStorage.getItem(this.key_jsonfilename));
        let promise1 = this.api.postJson(formData).toPromise();
        promise1.then((data)=>{
          if(data['status'] === 201) {
            _flag = true;

            this.final = data['data'];
            this._data.clearMessages();
            this._data.sendMessageFinal(this.final);
            sessionStorage.setItem(this.key_selectedIndex, (this.selectedIndex - 1).toString());
            stepper.previous();
          }
        }).catch((error)=>{
          _flag = false;
        });
      }
    }
  }

  /**
   * @description redirects page to main page / home page
   */
  fnMain() {
    this.log.write(LogLevel.Debug, 'BuildCustomImageComponent', 'fnMain', '/index');
    this.route.navigateByUrl('/index');
  }

}
