import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { Service } from 'src/app/model/services';
import { Role } from 'src/app/model/roles';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription, of, from } from 'rxjs';
import { MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent, MatSlideToggleChange, MatRadioChange, MatDialog } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map, delay } from 'rxjs/operators';
import { UtilsService } from 'src/app/shared/utils.service';
import { DataService } from 'src/app/shared/data.service';
import { ApiService } from 'src/app/shared/api.service';
import { BrowseDialogComponent } from '../browse-dialog/browse-dialog.component';
import { ParentNode } from 'src/app/model/parent-node';
import { Final } from 'src/app/model/final/final';
import { role } from 'src/app/model/final/role';
import { service } from 'src/app/model/final/services';
import { imagebuild } from 'src/app/model/final/image-build';
import { images } from 'src/app/model/final/image';
import { imageload, registry } from 'src/app/model/final/image-load';
import { LogService, LogLevel } from 'src/app/shared/log.service';

@Component({
  selector: 'app-step-service-role',
  templateUrl: './step-service-role.component.html',
  styleUrls: ['./step-service-role.component.css']
})
export class StepServiceRoleComponent implements OnInit, OnDestroy  {
  pnode: ParentNode[] = [];

  final = new Final();

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  secondFormGroupService: FormGroup;
  secondFormGroupRoleNew: FormGroup;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  mServiceDataSource1: Array<service> = [];
  mService1 = new service();

  mRoleDataSource1: Array<role> = [];
  mRole1 = new role();

  mServiceDataSource: Array<Service> = [];
  mRoleDataSource: Array<Role> = [];
  mService = new Service();
  mRole = new Role();
  displayPath = false;
  cardinalitySingle = false;
  lblAntiAffinity = false;
  lblDockerRegisteryLocal = false;
  useDefaultAntiaffinity = false;
  editmodeService = false;
  editmodeRole = false;

  errorBaseDirectory = false;
  displayLabelBaseDirectory: string = '';
  local_repo_tag = '';
  local_base_dir = '';
  local_base_dir_file: File;
  registry_repo_tag = '';
  selected_local_os_type_arr = ['rhel7','ubuntu18','centos7'];
  selected_registry_os_type_arr = ['rhel7','ubuntu18','centos7'];
  local_os_type_value = '';
  registry_os_type_value = '';
  url = '';
  contentTrust = false;
  authentication = false;
  dockerRegisteryLocal = 0;
  repoTagPattern = '^[a-zA-Z0-9][a-zA-Z0-9_.-/:]+$'

  messages: any[] = [];
  subscription: Subscription;

  error_role_name_exists = '';

  isShownPath: boolean = false ; // hidden by default


  constructor(private _formBuilder: FormBuilder, private _utils: UtilsService,
    private _data: DataService, private _api: ApiService,public _dialog: MatDialog,
    private log: LogService) {
    this.filteredCar = this.carCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) => item ? this._filterCar(item) : this.allCar.slice()));
  }

  /**
   * @description handle any additional initialization tasks
   */
  ngOnInit() {
    this.log.write(LogLevel.Info, 'StepServiceRoleComponent');
    this.onClearService();
    this.onClearRole();
    this.subscription = this._data.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
        // // console.log('services', message.text);
        // this.finalJson = JSON.parse(message.text);
        // this.finalJson = message.text;

        this.final = message.text;
        this.updateView();
      } else {
        // clear messages when empty message received
        this.messages = [];
      }
    });
  }

  /**
   * @description executes this event when the instance is destroyed
   */
  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  /**
   * @description updates the form when json exits in the workspace
   */
  updateView(): void {
    this.log.write(LogLevel.Info, 'StepServiceRoleComponent','updateView', JSON.stringify(this.final));

    if(this.final !== undefined && this.final !== null) {
      if(this.final.services !== undefined &&this.final.services !== null && this.final.services.length > 0) {
        this.mServiceDataSource1 = this.final.services;
      }

      if(this.final.roles !== undefined && this.final.roles !== null && this.final.roles.length > 0) {
        this.mRoleDataSource1 = this.final.roles;
      }
    }
  }

  /**
   * @description Show hide contents on ui when display clicked
   * @param event
   */
  onChangeDisplay(event) {

    if (event.checked === true) {
      this.displayPath = true;
    } else {
      this.displayPath = false;
    }
    this.isShownPath = ! this.isShownPath;
  }



  get _serviceRoles_serviceName() {
    return this.secondFormGroupService.get('serviceName');
  }

  get _serviceRoles_servicePort() {
    return this.secondFormGroupService.get('servicePort');
  }

  get _serviceRoles_servicePath() {
    return this.secondFormGroupService.get('servicePath');
  }

  get _serviceRoles_roleRepoTag() {
    return this.secondFormGroupRoleNew.get('roleRepoTag');
  }

  get _serviceRoles_roleName() {
    return this.secondFormGroupRoleNew.get('roleName');
  }

  get _serviceRoles_roleCardinality() {
    return this.secondFormGroupRoleNew.get('roleCardinality');
  }

  get _serviceRoles_roleCpu() {
    return this.secondFormGroupRoleNew.get('roleCpu');
  }

  get _serviceRoles_roleRam() {
    return this.secondFormGroupRoleNew.get('roleRam');
  }

  /**
   * @description Adds new service is service app
   */
  onAddService() {
    if(this.mServiceDataSource1 === null) {
      this.mServiceDataSource1 = new Array<service>();
    }
    this.mService1 = new service();
    var tmpUId = this.secondFormGroupService.value.serviceName.toLowerCase();
    tmpUId = tmpUId.replace(' ', '_');
    this.mService1.srvcid = tmpUId;
    this.mService1.name = this.secondFormGroupService.value.serviceName;
    this.mService1.port = this.secondFormGroupService.value.servicePort;
    this.mService1.scheme = this.secondFormGroupService.value.serviceSchema;
    this.mService1.isdash = this.secondFormGroupService.value.serviceDisplay;
    this.mService1.path = this.secondFormGroupService.value.servicePath;
    this.mService1.sysctl = this.secondFormGroupService.value.systemd;
    this.mService1.authtoken = this.secondFormGroupService.value.authToken;
    this.mService1.loadbalanced = this.secondFormGroupService.value.loadBalanced;

    let flagServiceExists = false;
    if(this.mServiceDataSource1.length === 0) {
      flagServiceExists = true;
    }
    for (let index = 0; index < this.mServiceDataSource1.length; index++) {
      const element = this.mServiceDataSource1[index];
      if(element.name.toLocaleLowerCase() === this.mService1.name.toLocaleLowerCase()) {
          flagServiceExists = false;
          this.log.write(LogLevel.Info, 'onAddService', `Service Name ${element.name} already exist`);
          this._utils.openSnackBar(`Service Name ${element.name} already exist`, '');
          break;
      }
      if(this.mService1.port !== '') {
        if(element.port === this.mService1.port) {
          this._utils.openSnackBar(`Service Port ${element.port} already exist`, '');
          this.log.write(LogLevel.Info, 'onAddService', `Service Port ${element.port} already exist`);
          flagServiceExists = false;
          break;
        }
      }
      flagServiceExists = true;
    }


    if(this.mService1.name === '') {
      flagServiceExists = false;
      this._serviceRoles_serviceName.markAsTouched();
    }
    if(flagServiceExists) {
        this.mServiceDataSource1.push(this.mService1);
        this.log.write(LogLevel.Info, 'onAddService', JSON.stringify(this.mService1));
        this. onClearService();
    }
  }

  /**
   * @description clears form inpput field
   */
  onClearService() {
    this.secondFormGroupService = this._formBuilder.group({
      service_id: '',
      serviceName: ['', Validators.required],
      servicePort: ['', [Validators.pattern('^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$')]],
      serviceSchema: [''],
      serviceDisplay: [false],

      //servicePath: ['', Validators.pattern('^(?:\.{2})?(?:\/\.{2})*(\/[a-zA-Z0-9]+)+$')],
      servicePath: ['', Validators.pattern('(\/)?(([a-z]+(\/)?)*|[a-z]+\.[a-z]+)$')],
      // servicePath: ['', Validators.pattern('^(.*/)([^/]*)$')],
      systemd: [''],
      authToken: [false],
      loadBalanced: [false],

    });

    this.isShownPath = false;
    this.editmodeService = false;
    this.log.write(LogLevel.Info, 'onClearService');
  }

  /**
   * @description Deletes the serive from the array
   * @param data
   */
  onDeleteService(data: service) {
    let index = this.mServiceDataSource1.indexOf(data);
    if (index !== -1) {
      this.mServiceDataSource1.splice(index, 1);
      this.final.services = this.mServiceDataSource1;
      this.log.write(LogLevel.Info, 'onDeleteService', JSON.stringify(data));
    }
  }

  /**
   * Display's service in the form when a particular service is clicked from table
   * @param data
   */
  onEditService(data: service) {
    this.secondFormGroupService = this._formBuilder.group({
      service_id: data.srvcid,
      serviceName: [data.name, Validators.required],
      servicePort: [data.port, [Validators.pattern('^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$')]],
      serviceSchema: [data.scheme],
      serviceDisplay: [data.isdash],
      // servicePath: [data.path, Validators.pattern('^(?:\.{2})?(?:\/\.{2})*(\/[a-zA-Z0-9]+)+$')],
      servicePath: [data.path, Validators.pattern('^(\/)?(([a-z]+(\/)?)*|[a-z]+\.[a-z]+)$')],
      // servicePath: [data.path, Validators.pattern('^([/]*)*(\/[a-zA-Z0-9]+)+$')],
      systemd: [data.sysctl],
      authToken: [data.authtoken],
      loadBalanced: [data.loadbalanced],

    });

    if(data.isdash) {
      this.displayPath = true;
      this.isShownPath = true;

    } else {
      this.displayPath = false;
      this.isShownPath = false;

    }
    this.editmodeService = true;
    this.log.write(LogLevel.Info, 'onEditService', JSON.stringify(data));
  }

  /**
   * @description Update's the service in the array from the input form
   */
  onUpdateService() {
    if(this.mServiceDataSource1 === null) {
      this.mServiceDataSource1 = new Array<service>();
    }
    this.mService1 = new service();
    this.mService1.srvcid = this.secondFormGroupService.value.service_id;
    this.mService1.name = this.secondFormGroupService.value.serviceName;
    this.mService1.port = this.secondFormGroupService.value.servicePort;
    this.mService1.scheme = this.secondFormGroupService.value.serviceSchema;
    this.mService1.isdash = this.secondFormGroupService.value.serviceDisplay;
    this.mService1.path = this.secondFormGroupService.value.servicePath;
    this.mService1.sysctl = this.secondFormGroupService.value.systemd;
    this.mService1.authtoken = this.secondFormGroupService.value.authToken;
    this.mService1.loadbalanced = this.secondFormGroupService.value.loadBalanced;

    let flagServiceExists = true;
    if(this.mServiceDataSource1.length === 0) {
      flagServiceExists = false;
    }

    // let indextmp = 0
    for (let index = 0; index < this.mServiceDataSource1.length; index++) {
      const element = this.mServiceDataSource1[index];
      if(this.mService1.port !== '') {
        if(element.port === this.mService1.port) {
          let updateItem = this.mServiceDataSource1.find(item => item.srvcid === this.mService1.srvcid);
            if(updateItem.port.toLocaleLowerCase() === this.mService1.port.toLocaleLowerCase()) {
              flagServiceExists = true;
            } else {
              flagServiceExists = false;
              this._utils.openSnackBar('Service Port already exist', 'dismiss');
              break;
            }
        }
      }
      flagServiceExists = true;
    }

    //if(this.mService.name === '' || this.mService.port === '') {
    if(this.mService1.name === '') {
      flagServiceExists = false;
    }
    if(flagServiceExists) {
        // this.mServiceDataSource.push(this.mService);
        let updateItem = this.mServiceDataSource1.find(item => item.srvcid === this.mService1.srvcid);
        let index = this.mServiceDataSource1.indexOf(updateItem);
        this.mServiceDataSource1[index].isdash = this.mService1.isdash;
        this.mServiceDataSource1[index].name = this.mService1.name;
        this.mServiceDataSource1[index].path = this.mService1.path;
        this.mServiceDataSource1[index].port = this.mService1.port;
        this.mServiceDataSource1[index].scheme = this.mService1.scheme;
        this.mServiceDataSource1[index].sysctl = this.mService1.sysctl;
        this.mServiceDataSource1[index].authtoken = this.mService1.authtoken;
        this.mServiceDataSource1[index].loadbalanced = this.mService1.loadbalanced;
        this.log.write(LogLevel.Info, 'onUpdateService', JSON.stringify(this.mService1));
        // sessionStorage.setItem(this.key_services, JSON.stringify(this.mServiceDataSource));
        this.onClearService();
    }

    // this.finalJson.services = this.mServiceDataSource;
  }

  /**
   * @description Clears the service form
   */
  onResetService() {
    this.onClearService();
  }

  /**
   * @description Clears the input field of services
   */
  onClearRole() {
    this.secondFormGroupRoleNew = this._formBuilder.group({
      role_id: '',
      roleName: ['', [Validators.required]],
      roleCpu: ['',Validators.pattern('^[1-9][0-9]*$')],
      roleRam: ['',Validators.pattern('^[1-9][0-9]*$')],
      roleCardinality: ['', Validators.required],
      roleAntiaffinity: false,
      // roleAntiaffinity: ['',Validators.pattern('^[A-Za-z]*$')],
      roleDockerRegisteryLocal: 'None',
      roleBaseDirectory: '',
      roleRepoTag: ['', Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9_.-]+$')],
    });
    this.cardinalitySingle = false;
    this.lblAntiAffinity = false;

    this.displayLabelBaseDirectory = '';
    this.errorBaseDirectory = false;
    if(this.car.length > 0) {
      this.car.slice(0, 1);
      this.carInput.nativeElement.value = '';
      this.carCtrl.setValue(null);
    }
    this.car.pop();
    this.useDefaultAntiaffinity = false;
    this.editmodeRole = false;

    this.local_base_dir = '';
    this.local_repo_tag = '';
    this.local_os_type_value = '';

    this.registry_repo_tag = '';
    this.registry_os_type_value = '';
    this.url = '';
    this.contentTrust = false;
    this.authentication = false;

    this.dockerRegisteryLocal = 0;
    this.log.write(LogLevel.Info, 'onClearRole');
  }

  /**
   * @description Adds new role in array
   */
  onAddRole() {
    if(this.mRoleDataSource1 === null) {
      this.mRoleDataSource1 = new Array<role>();
    }

    if (this.secondFormGroupRoleNew.value.roleName === '') {
      this._serviceRoles_roleName.markAsTouched();
      this.log.write(LogLevel.Info, 'onAddRole', 'Role Name is empty');
      return;
    }

    if (this.secondFormGroupRoleNew.value.roleCardinality === '') {
      this._serviceRoles_roleCardinality.markAsTouched();
      this.log.write(LogLevel.Info, 'onAddRole', 'Cardinality is empty');
      return;
    }

    if(this.car.length === 0) {
      this.cardinalitySingle = true;
      this.secondFormGroupRoleNew.controls['roleCardinality'].markAsTouched();
      this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
      this.log.write(LogLevel.Info, 'onAddRole', 'Cardinality length is 0');
      return;
    }

    if (this.secondFormGroupRoleNew.value.roleCpu.toString().length > 0 && this.secondFormGroupRoleNew.value.roleCpu < 1) {
      this.secondFormGroupRoleNew.controls['roleCpu'].markAsTouched();
      this.secondFormGroupRoleNew.controls['roleCpu'].updateValueAndValidity();
      this.log.write(LogLevel.Info, 'onAddRole', 'CPU length > 0 && RAM < 1');
      return;
    }

    if (this.secondFormGroupRoleNew.value.roleRam.toString().length > 0 && this.secondFormGroupRoleNew.value.roleRam < 1) {
      this.secondFormGroupRoleNew.controls['roleRam'].markAsTouched();
      this.secondFormGroupRoleNew.controls['roleRam'].updateValueAndValidity();
      this.log.write(LogLevel.Info, 'onAddRole', 'RAM length > 0 && RAM < 1');
      return;
    }

    if (this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Local') {
      if(this.local_base_dir === '') {
        this.errorBaseDirectory = true;
        this.log.write(LogLevel.Info, 'onAddRole', 'Local', 'Base Directory is empty');
        return;
      }

      if(this.local_repo_tag === '') {
        this._utils.openSnackBar('Please enter image repo tag', '');
        this.log.write(LogLevel.Info, 'onAddRole', 'Local', 'Image Repo Tag is empty');
        return;
      }

      if(this.local_os_type_value === '') {
        this._utils.openSnackBar('Please select OS Type', '');
        this.log.write(LogLevel.Info, 'onAddRole', 'Local', 'OS Type is empty');
        return;
      }
    }

    if (this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Registry') {
      if(this.registry_repo_tag === '') {
        this._utils.openSnackBar('Please enter image repo tag', '');
        this.log.write(LogLevel.Info, 'onAddRole', 'Registry', 'Image Repo Tag is empty');
        return;
      }

      if(this.registry_os_type_value === '') {
        this._utils.openSnackBar('Please select OS Type', '');
        this.log.write(LogLevel.Info, 'onAddRole', 'Registry', 'OS Type is empty');
        return;
      }

      if(this.url === '') {
        this._utils.openSnackBar('Please enter url', '');
        this.log.write(LogLevel.Info, 'onAddRole', 'Registry', 'URL is empty');
        return;
      }
    }

    this.mRole1 = new role();
    this.mRole1.id = this.secondFormGroupRoleNew.value.roleName.replace(' ','_').toLocaleLowerCase();
    this.mRole1.name = this.secondFormGroupRoleNew.value.roleName;
    this.mRole1.min_cores = this.secondFormGroupRoleNew.value.roleCpu;
    this.mRole1.min_memory = this.secondFormGroupRoleNew.value.roleRam;
    this.mRole1.cardinality = this.secondFormGroupRoleNew.value.roleCardinality;
    this.mRole1.anti_affinity_group_id = this.secondFormGroupRoleNew.value.roleAntiaffinity;
    var image = new images();
    if(this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Local') {
      var build = new imagebuild();
      build.basedir = this.local_base_dir;
      build.repotag = this.local_repo_tag;
      build.os = this.local_os_type_value;
      image.build = build;
    }
    if(this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Registry') {
      var load = new imageload();
      load.repotag = this.registry_repo_tag;
      load.os = this.registry_os_type_value;

      var loadregistry = new registry();
      loadregistry.url = this.url;
      loadregistry.content_trust_enabled = this.contentTrust;
      loadregistry.authentication_enabled = this.authentication;
      load.registry = loadregistry;

      image.load = load;
    }
    this.mRole1.image = image;


    let flagRoleExists = false;
    if(this.mRoleDataSource1.length === 0) {
      flagRoleExists = true;
    }
    for (let index = 0; index < this.mRoleDataSource1.length; index++) {
      const element = this.mRoleDataSource1[index];
      if(element.name.toLocaleLowerCase() === this.mRole1.name.toLocaleLowerCase()) {
        flagRoleExists = false;
        this.log.write(LogLevel.Info, 'onAddRole', 'Role Name exist', element.name);
        break;
      }
      flagRoleExists = true;
    }

    if(this.mRole1.name === '' || this.mRole1.cardinality === '') {
      flagRoleExists = false;
      this.log.write(LogLevel.Info, 'onAddRole', 'Role Name / Cardinality is empty', this.mRole1.name, this.mRole1.cardinality);
      return;
    }

    if(flagRoleExists) {
      this.mRoleDataSource1.push(this.mRole1);
      this.log.write(LogLevel.Info, 'onAddRole', JSON.stringify(this.mRole1));
      this.onClearRole();
    }
  }

  /**
   * @description Removes role from the array
   * @param data
   */
  onRemoveRole(data: role) {
    let index = this.mRoleDataSource1.indexOf(data);
    if (index !== -1) {
      this.mRoleDataSource1.splice(index, 1);
      this.final.roles = this.mRoleDataSource1;
      this.log.write(LogLevel.Info, 'onRemoveRole', JSON.stringify(data));
    }
  }

  /**
   * @description Display's role in the form when a particular role is clicked from table
   * @param data
   */
  onEditRole(data: role) {
    this.log.write(LogLevel.Info, 'onEditRole1', JSON.stringify(data));
    this.secondFormGroupRoleNew = this._formBuilder.group({
      role_id: data.id,
      roleName: [data.name, Validators.required],
      roleCpu: [data.min_cores,Validators.pattern('^[1-9][0-9]*$')],
      roleRam: [data.min_memory,Validators.pattern('^[1-9][0-9]*$')],
      roleCardinality: [data.cardinality, Validators.required],
      roleAntiaffinity: data.anti_affinity_group_id,
      roleDockerRegisteryLocal: this.fnHasKeyBuildOrLoad(data.image),
      roleBaseDirectory: '',
      roleRepoTag: '',
    });


      if(this.fnHasKeyBuildOrLoad(data.image) === "Local") {
        try {
          this.local_os_type_value = data.image.build.os;
          this.local_base_dir = data.image.build.basedir;
          this.local_repo_tag = data.image.build.repotag;
          this.dockerRegisteryLocal = 1;
        } catch (err) {

        }
      }

      if(this.fnHasKeyBuildOrLoad(data.image) === "Registry") {
        try {
          this.local_base_dir = "";
          this.registry_repo_tag = data.image.load.repotag;
          this.registry_os_type_value = data.image.load.os;
          this.url = data.image.load.registry.url;
          this.contentTrust = data.image.load.registry.content_trust_enabled;
          this.authentication = data.image.load.registry.authentication_enabled;
          this.dockerRegisteryLocal = 2;
        } catch (err) {

        }
      }

      // if(data.image === null) {
      //   this.dockerRegisteryLocal = 0;
      //   this.local_base_dir = "";
      // }
    if(this.fnHasKeyBuildOrLoad(data.image) === "None") {
      this.dockerRegisteryLocal = 0;

      this.local_os_type_value = "";
      this.local_base_dir = "";
      this.local_repo_tag = "";

      this.registry_repo_tag = "";
      this.registry_os_type_value = "";
      this.url = "";
      this.contentTrust = false;
      this.authentication = false;
    }

    if(data.anti_affinity_group_id === true) {
      this.lblAntiAffinity = true;
      this.useDefaultAntiaffinity = true;
    }
    if(data.anti_affinity_group_id === false) {
      this.lblAntiAffinity = false;
      this.useDefaultAntiaffinity = false;
    }

    this.car.pop();
    this.car.push(data.cardinality);
    this.editmodeRole = true;
  }

  /**
   * @description Clears the role form
   */
  onResetRole() {
    this.onClearRole();
  }

  /**
   * Update's the role in the array
   */
  onUpdateRole() {
    if(this.mRoleDataSource1 === null) {
      this.mRoleDataSource1 = new Array<role>();
    }

    if (this.secondFormGroupRoleNew.value.roleCpu.toString().length > 0 && this.secondFormGroupRoleNew.value.roleCpu < 1) {
      this.secondFormGroupRoleNew.controls['roleCpu'].markAsTouched();
      this.secondFormGroupRoleNew.controls['roleCpu'].updateValueAndValidity();
      this.log.write(LogLevel.Info, 'onUpdateRole', 'CPU length > 0 && CPU < 1');
      return;
    }

    if (this.secondFormGroupRoleNew.value.roleRam.toString().length > 0 && this.secondFormGroupRoleNew.value.roleRam < 1) {
      this.secondFormGroupRoleNew.controls['roleRam'].markAsTouched();
      this.secondFormGroupRoleNew.controls['roleRam'].updateValueAndValidity();
      this.log.write(LogLevel.Info, 'onUpdateRole', 'RAM length > 0 && RAM < 1');
      return;
    }

    if (this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Local') {
      if(this.local_base_dir === '') {
        this.errorBaseDirectory = true;
        this.log.write(LogLevel.Info, 'onUpdateRole', 'Local', 'Base Directory is empty');
        return;
      }

      if(this.local_repo_tag === '') {
        this._utils.openSnackBar('Please enter image repo tag', '');
        this.log.write(LogLevel.Info, 'onUpdateRole', 'Local', 'Image Repo Tag is empty');
        return;
      }

      if(this.local_os_type_value === '') {
        this._utils.openSnackBar('Please select OS Type', '');
        this.log.write(LogLevel.Info, 'onUpdateRole', 'Local', 'OS Type is empty');
        return;
      }
    }

    if (this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Registry') {
      if(this.registry_repo_tag === '') {
        this._utils.openSnackBar('Please enter image repo tag', '');
        this.log.write(LogLevel.Info, 'onUpdateRole', 'Registry', 'Image Repo Tag is empty');
        return;
      }

      if(this.registry_os_type_value === '') {
        this._utils.openSnackBar('Please select OS Type', '');
        this.log.write(LogLevel.Info, 'onUpdateRole', 'Registry', 'OS Type is empty');
        return;
      }

      if(this.url === '') {
        this._utils.openSnackBar('Please enter url', '');
        this.log.write(LogLevel.Info, 'onUpdateRole', 'Registry', 'URL is empty');
        return;
      }
    }

    this.mRole1 = new role();
    this.mRole1.id = this.secondFormGroupRoleNew.value.role_id;
    this.mRole1.name = this.secondFormGroupRoleNew.value.roleName;
    this.mRole1.min_cores = this.secondFormGroupRoleNew.value.roleCpu;
    this.mRole1.min_memory = this.secondFormGroupRoleNew.value.roleRam;
    this.mRole1.cardinality = this.secondFormGroupRoleNew.value.roleCardinality;
    this.mRole1.anti_affinity_group_id = this.secondFormGroupRoleNew.value.roleAntiaffinity

    var image = new images();
    if(this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Local') {
      var build = new imagebuild();
      build.basedir = this.local_base_dir;
      build.repotag = this.local_repo_tag;
      build.os = this.local_os_type_value;
      image.build = build;
    }
    if(this.secondFormGroupRoleNew.value.roleDockerRegisteryLocal === 'Registry') {
      var load = new imageload();
      load.repotag = this.registry_repo_tag;
      load.os = this.registry_os_type_value;
      var loadregistry = new registry();
      loadregistry.url = this.url;
      loadregistry.content_trust_enabled = this.contentTrust;
      loadregistry.authentication_enabled = this.authentication;
      load.registry = loadregistry;

      image.load = load;
    }
    this.mRole1.image = image;


    let flagRoleExists = false;
    if(this.mRoleDataSource1.length === 0) {
      flagRoleExists = true;
    }
    for (let index = 0; index < this.mRoleDataSource1.length; index++) {
      const element = this.mRoleDataSource1[index];
      if(element.name.toLocaleLowerCase() === this.mRole1.name.toLocaleLowerCase()) {
        let updateItem = this.mRoleDataSource1.find(item => item.id === this.mRole1.id);
          if(updateItem.name.toLocaleLowerCase() === this.mRole1.name.toLocaleLowerCase()) {
            flagRoleExists = true;
          } else {
            flagRoleExists = false;
            this._utils.openSnackBar('Role Name already exist', 'dismiss');
            break;
          }
      }
      flagRoleExists = true;
    }

    if(this.mRole1.name === '' || this.mRole1.cardinality === '') {
      flagRoleExists = false;
      return;
    }

    if(flagRoleExists) {
      let updateItem = this.mRoleDataSource1.find(item => item.id === this.mRole1.id);
        let index = this.mRoleDataSource1.indexOf(updateItem);
        this.mRoleDataSource1[index].name = this.mRole1.name;
        this.mRoleDataSource1[index].min_cores = this.mRole1.min_cores;
        this.mRoleDataSource1[index].min_memory = this.mRole1.min_memory;
        this.mRoleDataSource1[index].cardinality = this.mRole1.cardinality;
        this.mRoleDataSource1[index].anti_affinity_group_id = this.mRole1.anti_affinity_group_id;

        var image = new images();

          if(this.fnHasKeyBuildOrLoad(this.mRole1.image) === "Local") {
            var _imagebuild = new imagebuild();
            _imagebuild.basedir = this.mRole1.image.build.basedir;
            _imagebuild.repotag = this.mRole1.image.build.repotag;
            _imagebuild.os = this.mRole1.image.build.os;
            image.build = _imagebuild;
            image.load = null;
          }

          if(this.fnHasKeyBuildOrLoad(this.mRole1.image) === "Registry") {
            var _imageload = new imageload();
            var _imageloadregistry = new registry();
            _imageloadregistry.url = this.mRole1.image.load.registry.url;
            _imageloadregistry.authentication_enabled = this.mRole1.image.load.registry.authentication_enabled;
            _imageloadregistry.content_trust_enabled = this.mRole1.image.load.registry.content_trust_enabled;
            _imageload.repotag = this.mRole1.image.load.repotag;
            _imageload.os = this.mRole1.image.load.os
            _imageload.registry = _imageloadregistry;
            image.load = _imageload;
            image.build = null;
          }

        this.mRoleDataSource1[index].image = image;
        this.log.write(LogLevel.Info, 'onUpdateRole', JSON.stringify(this.mRole1));
        this.onClearRole();

    }
  }

  /**
   * Check the value/string in numeric
   * @param value
   */
  isNumber(value: string | number): boolean {
    return ((value != null) && !isNaN(Number(value.toString())));
  }


  carCtrl = new FormControl();
  filteredCar: Observable<string[]>;
  car: string[] = [];
  allCar: string[] = ['0+', '1', '1+'];
  @ViewChild('carInput', {static: false}) carInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCar', {static: false}) matAutocomplete: MatAutocomplete;

  /**
   * Add's the cardinality in the array
   * @param event
   */
  addCar(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    //// // console.log("addCar" + event.value);

    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      this.log.write(LogLevel.Info, 'addCar', JSON.stringify(value));
      //// // console.log("if");
      // Add our fruit
      if ((value || '').trim()) {

        // this.car.push(value.trim());
        if (this.car.indexOf(value.trim()) === -1) {
          // value exists in array
          // value does not exists in array
          if(value === '0' || value === '+0' || value.includes('-')) {

          } else {
          //// // console.log("else");
          if(value.includes('+')) {
              var str = value.split('+');
              if(str[0] !== '') {
                if(this.isNumber(+str[0])){
                  var tmp = +str[0] + '+';
                  if(this.car.indexOf(value.trim()) === -1) {
                    if(this.car.length === 0) {
                      this.car.push(tmp);
                      this.cardinalitySingle = false;
                      this.secondFormGroupRoleNew.controls['roleCardinality'].markAsUntouched();
                      this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
                    }
                  }
                }
              }
            } else {
              if(this.isNumber(+value)) {
                var tmp = +value.trim() + '';
                if(this.car.length === 0) {
                  this.car.push(tmp);

                  this.cardinalitySingle = false;
                  this.secondFormGroupRoleNew.controls['roleCardinality'].markAsUntouched();
                  this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
                }
              }
            }
          }
        }
      } else {
        if (this.car.length === 0) {
          this.secondFormGroupRoleNew.controls['roleCardinality'].markAsTouched();
          this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
        }
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.carCtrl.setValue(null);

    } else {
      const input = event.input;
      const value = event.value;

      // // // console.log("if");
      // Add our value
      if ((value || '').trim()) {

        // this.car.push(value.trim());
        if (this.car.indexOf(value.trim()) === -1) {
          // value exists in array
          // value does not exists in array
          if(value === '0' || value === '+0' || value.includes('-')) {

          } else {
          // // // console.log("else");
          if(value.includes('+')) {
              var str = value.split('+');
              if(str[0] !== '') {
                if(this.isNumber(+str[0])){
                  var tmp = +str[0] + '+';
                  if(this.car.indexOf(value.trim()) === -1) {
                    if(this.car.length === 0) {
                      this.car.push(tmp);
                      this.cardinalitySingle = false;
                      this.secondFormGroupRoleNew.controls['roleCardinality'].markAsUntouched();
                      this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
                    }
                  }
                }
              }
            } else {
              if(this.isNumber(+value)) {
                var tmp = +value.trim() + '';
                if(this.car.length === 0) {
                  this.car.push(tmp);
                  this.cardinalitySingle = false;
                  this.secondFormGroupRoleNew.controls['roleCardinality'].markAsUntouched();
                  this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
                }
              }
            }
          }
        }
      } else {
        if (this.car.length === 0) {
          this.secondFormGroupRoleNew.controls['roleCardinality'].markAsTouched();
          this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
        }
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.carCtrl.setValue(null);
    }
  }

  /**
   * Delete's the item from the cardinality array
   * @param item
   */
  removeCar(item: string): void {
    // const index = this.car.indexOf(fruit);
    const index = this.car.length;
    this.log.write(LogLevel.Info, 'removeCar', JSON.stringify(item));
    // if (index >= 0) {
    if (index > 0) {
      // this.car.splice(index, 1);
      this.car.pop();
      this.cardinalitySingle = false;
      this.secondFormGroupRoleNew.controls['roleCardinality'].markAsTouched();
      this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
    }

  }

  /**
   * @description This event executes when user select the cardinality
   * @param event
   */
  selectedCar(event: MatAutocompleteSelectedEvent): void {
    // // // console.log("selectedCar");
    if(this.car.length === 0) {
      this.car.push(event.option.value);
      this.cardinalitySingle = false;
      this.secondFormGroupRoleNew.controls['roleCardinality'].markAsUntouched();
    } else if( this.car.length > 0) {
      this.cardinalitySingle = true;
    }
    this.secondFormGroupRoleNew.controls['roleCardinality'].updateValueAndValidity();
    this.carInput.nativeElement.value = '';
    this.carCtrl.setValue(null);
  }

  /**
   * @description Filter's the cardinality
   * @param value
   */
  private _filterCar(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allCar.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * @description Anti Affinity label text hide show
   * @param event
   */
  toggleAntiAffinity(event: MatSlideToggleChange) {
    if (event.checked) {
      this.lblAntiAffinity = true;
    } else {
      this.lblAntiAffinity = false;
    }
  }

  /**
   * @description Radio button for selecting None Registry Build
   * @param event
   */
  onDockerRegisteryLocal(event: MatRadioChange) {
    if(event.value === 'Registry') {
      this.dockerRegisteryLocal = 2;
    }
    if(event.value === 'Local') {
      this.dockerRegisteryLocal = 1;
    }
    if(event.value === 'None') {
      this.dockerRegisteryLocal = 0;
    }
  }

  /**
   * @description Allow's enter number only in the input form
   * @param event
   */
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**
   * @description Allow's enter number & '+' only in the input form
   * @param event
   */
  numberPlusOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    // if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    if ((charCode < 42 || charCode > 44) && (charCode < 48 || charCode > 57)) {
        return false;
    }


    return true;
  }

  /**
   * @description Browse popup for selecting Docker file
   */
  fnBaseDirClick() {
    let promise = this._api.fnGetWorkspace().toPromise();
        promise.then(res=>{
          this.pnode = JSON.parse("[" +JSON.stringify(res['data']) + "]");
          if(res['status'] === 201) {
            let dialogRef = this._dialog.open(BrowseDialogComponent, {
              hasBackdrop: true,
              width: '750px',
              data: { dirFolder: this.pnode }
            });


            dialogRef.afterClosed().subscribe(result => {
              if(result !== undefined) {
                // console.log(result);
                this.log.write(LogLevel.Info, 'fnBaseDirClick', result);
                this.local_base_dir = result;
                this.errorBaseDirectory = false;
              }
            });
          }
        }).catch(err=>{
          this.local_base_dir = '';
          this.errorBaseDirectory = false;
          this.log.write(LogLevel.Error, 'fnBaseDirClick', JSON.stringify(err));
        });
  }

  /**
   * @description Check the item null or value (None, Build, Registry)
   * @param item
   */
  fnHasKeyBuildOrLoad(item: images) {
    if(item === null) {
      return 'None';
    }
    if(item.build !== undefined && item.build !== null) {
      return 'Local';
    }
    if(item.load !== undefined && item.load !== null) {
      return 'Registry';
    }
    return 'None';
  }
}
