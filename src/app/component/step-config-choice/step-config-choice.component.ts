import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { DefaultConfig } from 'src/app/model/defaultConfig';
import { ConfigMeta } from 'src/app/model/config-meta';
import { DefaultSetting } from 'src/app/model/defaultSetting';
import { DefaultSettingSelectedRole } from 'src/app/model/defaultSettingSelectedRole';
import { MappingRolesServices } from 'src/app/model/mappingRolesServices';
import { MatSlideToggleChange, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilsService } from 'src/app/shared/utils.service';
import { DataService } from 'src/app/shared/data.service';
import { Tab } from 'src/app/tab/tab.model';
import { TabService } from 'src/app/tab/tab.service';
import { MultivalueOptionComponent } from 'src/app/tab/multivalue-option/multivalue-option.component';
import { Final } from 'src/app/model/final/final';
import { LogService, LogLevel } from 'src/app/shared/log.service';


@Component({
  selector: 'app-step-config-choice',
  templateUrl: './step-config-choice.component.html',
  styleUrls: ['./step-config-choice.component.css']
})
export class StepConfigChoiceComponent implements OnInit, OnDestroy {
  
  final = new Final();
  _configconfig = {};

  flagButton = false;

  booleanOption = "True";
  booleanOptions: any[] = ["True"];
  messages: any[] = [];
  subscription: Subscription;

  advanceFlag = false;
  
  selected_role_default_config: string[] = [];
  selected_role_default_config_selected: string[] = [];
  selected_role_default_config_value: string[] = [];
  defaultConfig = new DefaultConfig('',[]);
  service_default_config: string[] = [];
  defaultSettingUpdateFlag = false;
  mapRoleService_default_config: Array<MappingRolesServices> = [];


  thirdConfigMetaFormGroup: FormGroup;
  editmodeConfigMeta = false;
  ConfigMeta = new ConfigMeta();
  mConfigMeta: ConfigMeta[] = [];


  additionalConfig = new FormControl();
  advanceConfigList: string[] = ['BOOLEAN', 'MULTIVALUE', 'STRING', 'PASSWORD'];
  additionalConfig_selected: string[];

  displayBoolean = false;
  thirdBooleanFormGroup1: FormGroup;
  selected_role_additional_config_value_boolean: string[] = [];
  selected_role_additional_config_value_boolean_false: string[] = [];

  mapRoleService_additional_config_boolean: Array<MappingRolesServices> = [];
  mapRoleService_additional_config_booleanFalse: Array<MappingRolesServices> = [];
  additionalConfigBooleanArr = [];
  additionalConfigBoolean = new DefaultConfig('',[]);
  additionalConfigBooleanFalse = new DefaultConfig('',[]);
  additionalConfigBooleanUpdateFlag = false;
  additionalConfigBooleanUpdateFlagFalse = false;
  booleanId = 0;

  displayString = false;
  thirdStringFormGroup1: FormGroup;
  mConfigChoices_String = [];
  additionalConfigStringUpdateFlag = false;


  displayPassword = false;
  thirdPasswordFormGroup1: FormGroup;
  mConfigChoices_Password = [];
  additionalConfigPasswordUpdateFlag = false;

  displayMultivalue = false;
  thirdMultiFormGroup1: FormGroup;
  selected_role_additional_config_value_multi: string[] = [];
  mapRoleService_additional_config_multi: Array<MappingRolesServices> = [];
  additionalConfigMultiArr = [];


  additionalConfigMulti = new DefaultConfig('',[]);
  additionalConfigMultiUpdateFlag = false;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  optionCtrl = new FormControl();
  filteredOptions: Observable<string[]>;
  options: string[] = [];
  allOptions: string[] = [];

  error_additionalRole_multivalue = '';

  flag_update_multivalue = false;
  flag_update_boolean = false;
  flag_update_string = false;
  flag_update_password = false;

  @ViewChild('optionInput', {static: false}) optionInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  // TAB START
  tabs = new Array<Tab>();
  selectedTab: number;
  additionalConfigMultiArr_TabOption = [];
  additionalConfigMultiArr_TabOption1 = [];
  //TAB END 

  constructor(private _utils: UtilsService, private _formBuilder: FormBuilder, 
    private _data: DataService,
    private tabService: TabService,
    private log: LogService) {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map((opt: string | null) => opt ? this._filterOption(opt) : this.allOptions.slice()));
   }

   /**
   * @description handle any additional initialization tasks
   */
  ngOnInit() {
    // console.log('app-config-choices');
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent');
    this.booleanOption = "True";
    this.additionalConfig_selected = [];
    this.getThirdConfigMeta();
    this.getThirdAdditionalConfigBoolean();
    this.getThirdAdditionalConfigString();
    this.getThirdAdditionalConfigPassword();
    this.getThirdAdditionalConfigMulti();
    // this._data.currentMessage.subscribe(message => // console.log('message', message));
    this.subscription = this._data.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
        // this.finalJson = JSON.parse(message.text);
        this.final = message.text;
        // this.finalJson = message.text;
        this.updateView();
      } else {
        // clear messages when empty message received
        this.messages = [];
      }
    });

    this.tabService.tabSub.subscribe(tabs => {
      this.tabs = tabs;
      this.selectedTab = tabs.findIndex(tab => tab.active);
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
  updateView() {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','updateView', JSON.stringify(this.final));
    this.selected_role_default_config = [];
    this.service_default_config = [];
    this.mapRoleService_default_config = [];
    this.selected_role_default_config_value = [];

    this.additionalConfig_selected = [];

    this.mConfigChoices_String = [];
    this.mConfigChoices_Password = [];

    let tmpAdvance = [];

    if(this.final !== undefined && this.final !== null) {

      // default services
      if(this.final.services !== undefined && this.final.services !== null) {
        for(let i = 0; i < this.final.services.length; i++) {
          let ele = this.final.services[i];
          this.service_default_config.push(ele.name);
        }
      }

      // default roles
      if(this.final.roles !== undefined && this.final.roles !== null) {
        for(let i = 0; i < this.final.roles.length; i++) {
          let ele = this.final.roles[i];
          this.selected_role_default_config.push(ele.name);
        }
      }

      // config metadata
      if(this.final.configkeys !== undefined && this.final.configkeys !== null) {
        this.mConfigMeta = [];
        for(let item in this.final.configkeys) {
          var config = new ConfigMeta();
          config.name = item;
          config.value = this.final.configkeys[item];
          this.mConfigMeta.push(config);
        }
      }


      // clusterconfig
      if(this.final.clusterconfig !== undefined && this.final.clusterconfig !== null) {
        let tmpArr = [];
        this.additionalConfigBooleanArr = [];
         for(let item in this.final.clusterconfig) {
           var ele = this.final.clusterconfig[item];
           switch(ele['type']) {
            case 'default':
              let obj: object = {}
              obj = ele['role_services'];
              
              for(let def in obj) {
                // console.log(def, ' ', obj[def]);
                let tmpDefault = new  MappingRolesServices();
                tmpDefault.role_id = def;
                tmpDefault.service_ids = obj[def];

                this.selected_role_default_config_value.push(def);
                this.mapRoleService_default_config.push(tmpDefault);
              }
              
              break;
            case 'string':
               if(tmpAdvance.filter(x=>x == 'STRING').length  === 0){
                // this.additionalConfig_selected.push('STRING');
                tmpAdvance.push('STRING');
               }
               this.mConfigChoices_String.push({ id: ele['id'], name: ele['name'] });
               break;
            case 'password':
               if(tmpAdvance.filter(x=>x == 'PASSWORD').length  === 0){
                // this.additionalConfig_selected.push('PASSWORD');
                tmpAdvance.push('PASSWORD');
               }
               this.mConfigChoices_Password.push({ id: ele['id'], name: ele['name'] });
               break;
            case 'boolean':
              //  console.log('boolean');
              if(tmpAdvance.filter(x=>x == 'BOOLEAN').length  === 0){
                // this.additionalConfig_selected.push('BOOLEAN');
                tmpAdvance.push('BOOLEAN');
              }
              
              let opt: Array<object> = [];
              opt = ele['options'];

              let mapboolean: Array<MappingRolesServices> = [];
              let selected_role_boolean = [];
              // for(let itemBool in opt) {
                // let b1 = opt[itemBool];
                let b1 = opt;
                if(b1['option'] === "true" || b1['option'] === true) {
                  // console.log(b1['role_services']);
                  let t = new Array<object>();
                  t = b1['role_services'];
                  for(let t1 in t) {
                    var map1 = new MappingRolesServices();
                    map1.role_id = t1;
                    let t2 = t[t1];
                    let t4 = [];
                    for(let t3 in t2) {
                      t4.push(t2[t3]);
                    }
                    map1.service_ids = t4;
                    // console.log(t1);
                    selected_role_boolean.push(t1);
                    mapboolean.push(map1);
                  }
                }
              // }
              
              
              this.additionalConfigBooleanArr.push({
                _id: ele['id'],
                name: ele['label'],
                selected_role: selected_role_boolean,
                map: mapboolean
              });

               break;
            case 'multi':
              //  console.log('multi');
               if(tmpAdvance.filter(x=>x == 'MULTIVALUE').length  === 0){
                // this.additionalConfig_selected.push('MULTIVALUE');
                tmpAdvance.push('MULTIVALUE');
               }
               this.additionalConfigMultiArr_TabOption1 = [];
              //  console.log('multi', ele);
               
               let opts = new Array<object>();
               opts = ele['options'];
               
               
               for(let i = 0; i < opts.length; i++) {
                let selected_role_multivalue = [];
                let selected_role_multivaluetmp: object = {};
                selected_role_multivaluetmp = opts[i]['role_services'];

                for(let multiselectedroles in selected_role_multivaluetmp) {
                  selected_role_multivalue.push(multiselectedroles); 
                }

                let t = new Array<object>();
                t = opts[i]['role_services'];
                let mapmulti: Array<MappingRolesServices> = [];
                // console.log(opts[i]['role_services']);
                for(let t1 in t) {
                  var map1 = new MappingRolesServices();
                  map1.role_id = t1;
                  let t2 = t[t1];
                  let t4 = [];
                  for(let t3 in t2) {
                    t4.push(t2[t3]);
                  }
                  map1.service_ids = t4;
                  // console.log(t1);
                  mapmulti.push(map1);
                }
                
                tmpArr.push({
                  _id: ele['id'],
                  name: ele['label'],
                  option: opts[i]['option'],
                  selected_role: selected_role_multivalue,
                  map: mapmulti,
                });
               }
               
              const nameSeen = {};
              this.additionalConfigMultiArr_TabOption1 = tmpArr.sort((a, b) => {
                const stateComp = a.name.localeCompare(b.name);
                return stateComp;
              }).map(x => {
                const nameSpan = nameSeen[x.name] ? 0 :
                  tmpArr.filter(y => y.name === x.name).length;

                  nameSeen[x.name] = true;
                return { ...x, nameSpan };
              });

               break;
           }
         }

         for(let i = 0; i <this.additionalConfig_selected.length; i++) {
           console.log(this.additionalConfig_selected)
          this.additionalConfig_selected.splice(0, 1);
         }
         
         for(let item in tmpAdvance) {
          this.advanceFlag = true;
          this.additionalConfig_selected.push(tmpAdvance[item]);
         }
      }
    }
  }
  //

  // Default Settings Start
  /**
   * @description Default Configutaion - Selected Roles dropdown change event
   * @param event 
   */
  onChangeSelectedRoleDefaultConfig(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeSelectedRoleDefaultConfig', JSON.stringify(event.isUserInput), JSON.stringify(event.source.value));
    if(event.isUserInput) {
      // // console.log(event.source.value, event.source.selected);
      if(this.selected_role_default_config_value === null) {
        this.selected_role_default_config_value = [];
        this.selected_role_default_config_selected = [];
      }
      if(event.source.selected) {
        this.selected_role_default_config_value.push(event.source.value);
        this.selected_role_default_config_selected = this.selected_role_default_config
      } else {
        var index = this.selected_role_default_config_value.indexOf(event.source.value);
        this.selected_role_default_config_value.splice(index, 1);
      }
    }
  }

  /**
   * @description Default Configutaion -  Role to Service Mapping - Role dropdown change event 
   * @param event 
   */
  onChangeRoleServiceMapDefaultConfig(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeRoleServiceMapDefaultConfig', JSON.stringify(this.defaultSettingUpdateFlag));
    if(!this.defaultSettingUpdateFlag)
    {
      // // console.log(event.source.value, event.source.selected);
      if(event.source.selected) {
        this.defaultConfig = new DefaultConfig(event.source.value, []);
        this.defaultSettingUpdateFlag = false;
      }
    }
  }

  /**
   * Default Configutaion - Add / Update 
   */
  onMapRoleServiceDefaultConfig() {
    if(this.defaultConfig.role === null || this.defaultConfig.role.trim() === '') {
      this._utils.openSnackBar('Please select Role', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceDefaultConfig', 'Please select Role');
      return;
    }
    if(this.defaultConfig.service === null || this.defaultConfig.service.length === 0) {
      this._utils.openSnackBar('Please select Service', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceDefaultConfig', 'Please select Service');
      return;
    }
    if(this.mapRoleService_default_config === null) {
      this.mapRoleService_default_config = new Array<MappingRolesServices>();
    }
    var x = 0; var flag = false;
    if(!this.defaultSettingUpdateFlag) { // Add
      if(this.mapRoleService_default_config != null && this.mapRoleService_default_config.length > 0){
        for (let i = 0; i < this.mapRoleService_default_config.length; i++) {
          const element = this.mapRoleService_default_config[i];
          if(element.role_id === this.defaultConfig.role){
            this._utils.openSnackBar(`Role \'${element.role_id}\' already added`, '');
            this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceDefaultConfig', `Role \'${element.role_id}\' already added`);
            flag = true;
            break;
          }    
        }
      }
      if(!flag) {
        this.mapRoleService_default_config.push(<MappingRolesServices>{ role_id: this.defaultConfig.role, service_ids: this.defaultConfig.service  });
        this.defaultConfig = new DefaultConfig('',[]);
        this.defaultSettingUpdateFlag = false;
      }
    } else { // Update 
      var index = -1;
      if(this.mapRoleService_default_config != null && this.mapRoleService_default_config.length > 0){
        for (let i = 0; i < this.mapRoleService_default_config.length; i++) {
          const element = this.mapRoleService_default_config[i];
          if(element.role_id === this.defaultConfig.role){
            flag = true;
            index = i;
            break;
          }    
        }
      }
      if(flag) {
        if(index > -1) {
          this.mapRoleService_default_config[index].service_ids = this.defaultConfig.service;
          this.defaultConfig = new DefaultConfig('',[]);
          this.defaultSettingUpdateFlag = false;
        }
      }
      this.defaultSettingUpdateFlag = false;
    }
  }

/**
 * @description Default Configutaion - Edit icon on table all the role's and services are mapped to form for editing 
 * @param item 
 */
  onEditDefaultConfig(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditDefaultConfig', JSON.stringify(item));
    this.defaultSettingUpdateFlag = true;
    this.defaultConfig = new DefaultConfig(item.role_id, item.service_ids);
  }

  /**
   * @description Default Configutaion - Delete Configuration from the table
   * @param item 
   */
  onDeleteDefaultConfig(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteDefaultConfig', JSON.stringify(item));
    var index = this.mapRoleService_default_config.indexOf(item);
    if(index > -1) {
      this.mapRoleService_default_config.splice(index, 1);
    }
  }

  // Default Setting End

  // Config Meta Data Start

  /**
   * Config Meta - Clears the form data
   */
  getThirdConfigMeta() {
    this.thirdConfigMetaFormGroup = this._formBuilder.group({
      id: 0,
      name: ['', Validators.pattern('^(?!_)(?!.*_$)[a-zA-Z0-9_]+$')],
      value: [''],
    });
    this.editmodeConfigMeta = false;
  }

  get _thirdConfigMeta_name() {
    return this.thirdConfigMetaFormGroup.get('name');
  }

  /**
   * @description Config Meta - Add new Congig meta
   */
  onAddConfigMeta() {
    var flag = false;
    if(this.mConfigMeta === null) {
      this.mConfigMeta = []; 
    }
    
    for (let i = 0; i < this.mConfigMeta.length; i++) {
      const item = this.mConfigMeta[i];
      if(item.name === this.thirdConfigMetaFormGroup.value.name) {
        this._utils.openSnackBar(`\'${item.name}\' is already added`, '');
        this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddConfigMeta', `\'${item.name}\' is already added`);
        flag = true;
        break;
      }
    }

    if(flag) {
      return;
    }

    if(this.thirdConfigMetaFormGroup.value.name.length === 0) {
      flag = true;
      this._utils.openSnackBar('Please enter name', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddConfigMeta', 'Please enter name');
      return;
    }
  
    if(this.thirdConfigMetaFormGroup.value.value.length === 0) {
      flag = true;
      this._utils.openSnackBar('Please enter value', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddConfigMeta', 'Please enter value');
      return;
    }

    this.ConfigMeta = new ConfigMeta();
    // this.ConfigMeta.id = cnt;
    this.ConfigMeta.name = this.thirdConfigMetaFormGroup.value.name;
    this.ConfigMeta.value = this.thirdConfigMetaFormGroup.value.value;
    this.mConfigMeta.push(this.ConfigMeta);
    this.getThirdConfigMeta();
  }

  /**
   * @description Config Meta - Update the Config Meta in the table
   */
  onUpdateConfigMeta() {
    var index = 0;
    for (let i = 0; i < this.mConfigMeta.length; i++) {
      const item = this.mConfigMeta[i];
      if(item.name === this.thirdConfigMetaFormGroup.value.name) {
        index = i;
        break;
      } 
    }
    if(this.thirdConfigMetaFormGroup.value.name.length === 0) {
      this._utils.openSnackBar('Please enter name', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onUpdateConfigMeta', 'Please enter name');
      return;
    }
  
    if(this.thirdConfigMetaFormGroup.value.value.length === 0) {
      this._utils.openSnackBar('Please enter value', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onUpdateConfigMeta', 'Please enter value');
      return;
    }
    this.mConfigMeta[index].value = this.thirdConfigMetaFormGroup.value.value;
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onUpdateConfigMeta', JSON.stringify(this.mConfigMeta[index].value), JSON.stringify(this.thirdConfigMetaFormGroup.value.value));
    this.onResetConfigMeta();
  }

  /**
   * @description Config Meta - Clear's the config meta form
   */
  onResetConfigMeta() {
    this.getThirdConfigMeta();
  }

  /**
   * Config Meta - Edit icon on the table fill the form for editing when clicked 
   * @param item 
   */
  onEditConfigMetaData(item: ConfigMeta) {
    this.thirdConfigMetaFormGroup = this._formBuilder.group({
      name: [item.name, Validators.pattern('^(?!_)(?!.*_$)[a-zA-Z0-9_]+$')],
      value: item.value,
    });
    this.editmodeConfigMeta = true;
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditConfigMetaData', JSON.stringify(item));
  }

  /**
   * @description Config Meta - Deletes the config meta from the table
   * @param item 
   */
  onDeleteConfigMetaData(item: ConfigMeta) {
    let index = this.mConfigMeta.indexOf(item);
    if(index > -1) {
      this.mConfigMeta.splice(index, 1);
    }
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteConfigMetaData', JSON.stringify(item));
  }

  /**
   * Config Meta - Name field # and . restricted (hash, period)
   * @param event 
   */
  configMetaRestrictOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 35 || charCode === 46) {
      return false;
    }
    return true;
  }

  // Config Meta Data End


  //
  /**
   * @description Additional Config Choice Type - Dropdown for selection of additional configuration 
   * @param event 
   */
  onChangeAdditionalConfig(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeAdditionalConfig', JSON.stringify(event.source.value));
    if(event.source.value === 'BOOLEAN') {
      this.displayBoolean = !this.displayBoolean;
    }

    if(event.source.value === 'MULTIVALUE') {
      this.displayMultivalue = !this.displayMultivalue;
    }

    if(event.source.value === 'STRING') {
      this.displayString = !this.displayString;
    }

    if(event.source.value === 'PASSWORD') {
      this.displayPassword = !this.displayPassword;
    }

    try {
    var exist = this.additionalConfig_selected.find(event.source.value);
    if(exist) {
      var index = this.additionalConfig_selected.indexOf(event.source.value);
      if(index > 0){
        this.additionalConfig_selected.splice(index, 1);
        this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeAdditionalConfig', 'if' , JSON.stringify(index), JSON.stringify(event.source.value));
      }
    } else {
      this.additionalConfig_selected.push(event.source.value);
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeAdditionalConfig', 'else', JSON.stringify(event.source.value));
    }
    } catch(err) {
      this.log.write(LogLevel.Error, 'StepConfigChoiceComponent','onChangeAdditionalConfig', JSON.stringify(err));
    } 
  }
  //

  // Boolean Start
/**
 * @description Boolean - Clear the form data 
 */
  getThirdAdditionalConfigBoolean() {
    this.thirdBooleanFormGroup1 = this._formBuilder.group({
      name: ''
    });
    this.booleanId = 0;
  }

  /**
   * @description Boolean - Save the boolean form 
   */
  onSaveThirdGroupBoolean() {

    if(this.thirdBooleanFormGroup1.value.name === '') {
      this._utils.openSnackBar('Please enter name', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupBoolean', 'Please enter name');
      return;
    }

    let cnt = 1;
    if(this.additionalConfigBooleanArr == null || this.additionalConfigBooleanArr.length === 0) {
      this.additionalConfigBooleanArr = [];
    } else {
      cnt = this.additionalConfigBooleanArr.reverse()[0]._id + 1;
      this.additionalConfigBooleanArr.reverse();
    }
    if(this.booleanId === 0){
      // if(this.selected_role_additional_config_value_boolean_false != null && this.selected_role_additional_config_value_boolean_false.length > 0) {
      //   this.additionalConfigBooleanArr.push({ _id: cnt, name: this.thirdBooleanFormGroup1.value.name, option: false, selected_role: this.selected_role_additional_config_value_boolean_false, map: this.mapRoleService_additional_config_booleanFalse });
      // }
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupBoolean', 'Save', JSON.stringify({ _id: "bool" + cnt, name: this.thirdBooleanFormGroup1.value.name, option: true, selected_role: this.selected_role_additional_config_value_boolean, map: this.mapRoleService_additional_config_boolean }));
      this.additionalConfigBooleanArr.push({ _id: "bool" + cnt, name: this.thirdBooleanFormGroup1.value.name, option: true, selected_role: this.selected_role_additional_config_value_boolean, map: this.mapRoleService_additional_config_boolean });
    } else {
      let updateItem = this.additionalConfigBooleanArr.find(item => item._id === this.booleanId);
      let index = this.additionalConfigBooleanArr.indexOf(updateItem);
      this.additionalConfigBooleanArr[index].name = this.thirdBooleanFormGroup1.value.name;
      this.additionalConfigBooleanArr[index].selected_role = this.selected_role_additional_config_value_boolean;
      this.additionalConfigBooleanArr[index].map = this.mapRoleService_additional_config_boolean;
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupBoolean', 'Update', JSON.stringify({ _id: this.additionalConfigBooleanArr[index]._id, name: this.thirdBooleanFormGroup1.value.name, option: true, selected_role: this.selected_role_additional_config_value_boolean, map: this.mapRoleService_additional_config_boolean }));

    }
    
    
    this.getThirdAdditionalConfigBoolean();

    this.selected_role_additional_config_value_boolean = [];
    this.mapRoleService_additional_config_boolean = [];

    // return;
    this.flag_update_boolean = false;
  }

  /**
   * @description Boolean - Additional Role dropdown change event when true
   * @param event 
   */
  onChangeSelectedRoleAdditionalConfigBoolean(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeSelectedRoleAdditionalConfigBoolean', JSON.stringify(event.isUserInput), JSON.stringify(event.source.selected));
    if(event.isUserInput) {
      // // console.log(event.source.value, event.source.selected);
      if(this.selected_role_additional_config_value_boolean === null) {
        this.selected_role_additional_config_value_boolean = [];
        this.selected_role_default_config_selected = [];
      }
      if(event.source.selected) {
        this.selected_role_additional_config_value_boolean.push(event.source.value);
        this.selected_role_default_config_selected = this.selected_role_default_config
      } else {
        var index = this.selected_role_additional_config_value_boolean.indexOf(event.source.value);
        this.selected_role_additional_config_value_boolean.splice(index, 1);
      }
    }
  }

/**
 * @description Boolean - Additional Role dropdown change event when false
 * This function is not in use as discussed with Krishna
 * @param event 
 */
  onChangeSelectedRoleAdditionalConfigBooleanFalse(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeSelectedRoleAdditionalConfigBooleanFalse', JSON.stringify(event.isUserInput), JSON.stringify(event.source.selected));
    if(event.isUserInput) {
      // // console.log(event.source.value, event.source.selected);
      if(this.selected_role_additional_config_value_boolean_false === null) {
        this.selected_role_additional_config_value_boolean_false = [];
        this.selected_role_default_config_selected = [];
      }
      if(event.source.selected) {
        this.selected_role_additional_config_value_boolean_false.push(event.source.value);
        this.selected_role_default_config_selected = this.selected_role_default_config
      } else {
        var index = this.selected_role_additional_config_value_boolean_false.indexOf(event.source.value);
        this.selected_role_additional_config_value_boolean_false.splice(index, 1);
      }
    }
  }

  /**
   * @description Boolean - Map Role to services and add and update in the table 
   */
  onMapRoleServiceAdditionalConfigBoolean() {
    if(this.additionalConfigBoolean.role === null || this.additionalConfigBoolean.role.trim() === '') {
      this._utils.openSnackBar('Please select Role', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBoolean', JSON.stringify('Please select Role'));
      return;
    }
    if(this.additionalConfigBoolean.service === null || this.additionalConfigBoolean.service.length === 0) {
      this._utils.openSnackBar('Please select Service', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBoolean', JSON.stringify('Please select Service'));
      return;
    }
    if(this.mapRoleService_additional_config_boolean=== null) {
      this.mapRoleService_additional_config_boolean = new Array<MappingRolesServices>();
    }
    var x = 0; var flag = false;
    if(!this.additionalConfigBooleanUpdateFlag) {
      if(this.mapRoleService_additional_config_boolean != null && this.mapRoleService_additional_config_boolean.length > 0){
        for (let i = 0; i < this.mapRoleService_additional_config_boolean.length; i++) {
          const element = this.mapRoleService_additional_config_boolean[i];
          if(element.role_id === this.additionalConfigBoolean.role){
            this._utils.openSnackBar(`Role \'${element.role_id}\' already added`, '');
            this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBoolean', JSON.stringify(`Role \'${element.role_id}\' already added`));
            flag = true;
            break;
          }    
        }
      }
      if(!flag) {
        this.mapRoleService_additional_config_boolean.push(<MappingRolesServices>{ role_id: this.additionalConfigBoolean.role, service_ids: this.additionalConfigBoolean.service  });
        this.additionalConfigBoolean = new DefaultConfig('',[]);
        this.additionalConfigBooleanUpdateFlag = false;
      }
    } else {
      var index = -1;
      if(this.mapRoleService_additional_config_boolean != null && this.mapRoleService_additional_config_boolean.length > 0){
        for (let i = 0; i < this.mapRoleService_additional_config_boolean.length; i++) {
          const element = this.mapRoleService_additional_config_boolean[i];
          if(element.role_id === this.additionalConfigBoolean.role){
            flag = true;
            index = i;
            break;
          }    
        }
      }
      if(flag) {
        if(index > -1) {
          this.mapRoleService_additional_config_boolean[index].service_ids = this.additionalConfigBoolean.service;
          this.additionalConfigBoolean = new DefaultConfig('',[]);
          this.additionalConfigBooleanUpdateFlag = false;
        }
      }
      this.additionalConfigBooleanUpdateFlag = false;
    }
  }

  /**
   * @description Boolean - Map Role to services and add and update in the table, when false
   * this function is commented as discussed with Krishna
   */
  onMapRoleServiceAdditionalConfigBooleanFalse() {
    if(this.additionalConfigBooleanFalse.role === null || this.additionalConfigBooleanFalse.role.trim() === '') {
      this._utils.openSnackBar('Please select Role', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBooleanFalse', JSON.stringify('Please select Role'));
      return;
    }
    if(this.additionalConfigBooleanFalse.service === null || this.additionalConfigBooleanFalse.service.length === 0) {
      this._utils.openSnackBar('Please select Service', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBooleanFalse', JSON.stringify('Please select Service'));
      return;
    }
    if(this.mapRoleService_additional_config_booleanFalse === null) {
      this.mapRoleService_additional_config_booleanFalse  = new Array<MappingRolesServices>();
    }
    var x = 0; var flag = false;
    if(!this.additionalConfigBooleanUpdateFlagFalse) {
      if(this.mapRoleService_additional_config_booleanFalse  != null && this.mapRoleService_additional_config_booleanFalse .length > 0){
        for (let i = 0; i < this.mapRoleService_additional_config_booleanFalse .length; i++) {
          const element = this.mapRoleService_additional_config_booleanFalse [i];
          if(element.role_id === this.additionalConfigBooleanFalse.role){
            this._utils.openSnackBar(`Role \'${element.role_id}\' already added`, '');
            this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBooleanFalse', JSON.stringify(`Role \'${element.role_id}\' already added`));
            flag = true;
            break;
          }    
        }
      }
      if(!flag) {
        this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigBooleanFalse', 'if', JSON.stringify(!flag));
        this.mapRoleService_additional_config_booleanFalse.push(<MappingRolesServices>{ role_id: this.additionalConfigBooleanFalse.role, service_ids: this.additionalConfigBooleanFalse.service  });
        this.additionalConfigBooleanFalse = new DefaultConfig('',[]);
        this.additionalConfigBooleanUpdateFlagFalse = false;
      }
    } else {
      var index = -1;
      if(this.mapRoleService_additional_config_booleanFalse != null && this.mapRoleService_additional_config_booleanFalse.length > 0){
        for (let i = 0; i < this.mapRoleService_additional_config_booleanFalse.length; i++) {
          const element = this.mapRoleService_additional_config_booleanFalse[i];
          if(element.role_id === this.additionalConfigBooleanFalse.role){
            flag = true;
            index = i;
            break;
          }    
        }
      }
      if(flag) {
        if(index > -1) {
          this.mapRoleService_additional_config_booleanFalse[index].service_ids = this.additionalConfigBooleanFalse.service;
          this.additionalConfigBooleanFalse = new DefaultConfig('',[]);
          this.additionalConfigBooleanUpdateFlagFalse = false;
        }
      }
      this.additionalConfigBooleanUpdateFlagFalse = false;
    }
  }

  /**
   * @description Boolean - Additional Roles dropdown change event
   * @param event 
   */
  onChangeRoleServiceMapAdditionalConfigBoolean(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeRoleServiceMapAdditionalConfigBoolean', JSON.stringify(event.source.selected), JSON.stringify(event.source.value));
    if(!this.additionalConfigBooleanUpdateFlag)
    {
      if(event.source.selected) {
        this.additionalConfigBoolean = new DefaultConfig(event.source.value, []);
        this.additionalConfigBooleanUpdateFlag = false;
      }
    }
  }

  /**
   * @description Boolean - Additional Roles dropdown change event, when false
   * this function is commented as discussed with Krishna
   * @param event 
   */
  onChangeRoleServiceMapAdditionalConfigBooleanFalse(event) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeRoleServiceMapAdditionalConfigBooleanFalse', JSON.stringify(event.source.selected), JSON.stringify(event.source.value));
    if(!this.additionalConfigBooleanUpdateFlagFalse)
    {
      if(event.source.selected) {
        this.additionalConfigBooleanFalse = new DefaultConfig(event.source.value, []);
        this.additionalConfigBooleanUpdateFlagFalse = false;
      }
    }
  }

  /**
   * @description Boolean - Edit the Mappped Role to service
   * @param item 
   */
  onEditAdditionalConfigBoolean(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditAdditionalConfigBoolean', JSON.stringify(item));
    this.additionalConfigBooleanUpdateFlag = true;
    this.additionalConfigBoolean = new DefaultConfig(item.role_id, item.service_ids);
  }

  /**
   * @description Boolean - Delete the Mapped Role to service
   * @param item 
   */
  onDeleteAdditionalConfigBoolean(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigBoolean', JSON.stringify(item));
    var index = this.mapRoleService_additional_config_boolean.indexOf(item);
    if(index > -1) {
      this.mapRoleService_additional_config_boolean.splice(index, 1);
    }
  }

  /**
   * @description Boolean - Edit the boolean row from the table
   * @param item 
   */
  onEditAdditionalConfigBooleanArr(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditAdditionalConfigBooleanArr', JSON.stringify(item));
    this.booleanId = item._id;
    this.thirdBooleanFormGroup1 = this._formBuilder.group({
      name: item.name
    });
    this.selected_role_additional_config_value_boolean = item.selected_role;
    this.mapRoleService_additional_config_boolean = item.map;

    this.flag_update_boolean = true;
  }

  /**
   * @description Boolean - Deletes the boolean row from the table
   * @param item 
   */
  onDeleteAdditionalConfigBooleanArr(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigBooleanArr', JSON.stringify(item));
    var index = this.additionalConfigBooleanArr.indexOf(item);
    if(index > -1) {
      this.additionalConfigBooleanArr.splice(index, 1);
    }
  }

  // Boolean End

  // String Start
/**
 * @description String - Clears the string form
 */
  getThirdAdditionalConfigString() {
    this.thirdStringFormGroup1 = this._formBuilder.group({
      name: '',
      id: 0
    });
    this.additionalConfigStringUpdateFlag =false;
  }

  /**
   * @description String - Add and update the string form
   */
  onSaveThirdGroupString () {
    if(this.thirdStringFormGroup1.value.name === '') {
      this._utils.openSnackBar('Please enter value/string', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupString', 'Please enter value/string');
      return;
    }
    var cnt = 0;
    if(this.mConfigChoices_String === null || this.mConfigChoices_String.length === 0){
      this.mConfigChoices_String = [];  
      cnt = cnt + 1;
    } else {
      cnt = cnt + 1;
    }

    if(!this.additionalConfigStringUpdateFlag) {
      this.mConfigChoices_String.push({
        name : this.thirdStringFormGroup1.value.name,
        id : "str" + cnt
      });
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupString', 'save', JSON.stringify({
        name : this.thirdStringFormGroup1.value.name,
        id : "str" + cnt
      }));

    } else {
      
      var obj = this.mConfigChoices_String.find(x=>x.id == this.thirdStringFormGroup1.value.id);
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupString', 'update', JSON.stringify(this.thirdStringFormGroup1.value.name));
      if(obj !== null) {
        var index  = this.mConfigChoices_String.indexOf(obj);
        if (index > -1) {
          this.mConfigChoices_String[index].name = this.thirdStringFormGroup1.value.name
        }
      }
    }
   
    this.getThirdAdditionalConfigString();
    this.flag_update_string = false;
  }

  /**
   * @description String - Edit the string from the table
   * @param item 
   */
  onEditAdditionalConfigString(item) {
    this.thirdStringFormGroup1 = this._formBuilder.group({
      name: item.name,
      id: item.id
    });
    this.additionalConfigStringUpdateFlag = true;
    this.flag_update_string = true;
  }

  /**
   * @description String - Delete the string from the table
   * @param item 
   */
  onDeleteAdditionalConfigString(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigString', JSON.stringify(item));
    var index  = this.mConfigChoices_String.indexOf(item);
    if(index > -1) {
      this.mConfigChoices_String.splice(index, 1);
    }
    this.additionalConfigStringUpdateFlag = false;
    this.flag_update_string = false;
  }
  // String End


  // Password Start
/**
 * @description Password - Clears the password form
 */
  getThirdAdditionalConfigPassword() {
    this.thirdPasswordFormGroup1 = this._formBuilder.group({
      name: '',
      id: 0
    });
    this.additionalConfigStringUpdateFlag =false;
  }

  /**
   * @description Password - Add and update the Password in the table
   */
  onSaveThirdGroupPassword () {
    if(this.thirdPasswordFormGroup1.value.name === '') {
      this._utils.openSnackBar('Please enter value/string', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupPassword', 'Please enter value/string');
      return;
    }
    var cnt = 0;
    if(this.mConfigChoices_Password === null || this.mConfigChoices_Password.length === 0){
      this.mConfigChoices_Password = [];  
      cnt = cnt + 1;
    }
    else {
      cnt = cnt + 1;
    }
    if(!this.additionalConfigPasswordUpdateFlag){
      this.mConfigChoices_Password.push({
        name: this.thirdPasswordFormGroup1.value.name,
        id: "pwd" + cnt
      });
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupPassword', 'Save', JSON.stringify({
        name: this.thirdPasswordFormGroup1.value.name,
        id: "pwd" + cnt
      }));
    } else {
      var obj = this.mConfigChoices_Password.find(x=>x.id == this.thirdPasswordFormGroup1.value.id);
      if(obj !== null) {
        var index  = this.mConfigChoices_Password.indexOf(obj);
        if (index > -1) {
          this.mConfigChoices_Password[index].name = this.thirdPasswordFormGroup1.value.name
        }
      }
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupPassword', 'Update', JSON.stringify(this.thirdPasswordFormGroup1.value.name));
    }
    
   
    this.getThirdAdditionalConfigPassword();
    this.flag_update_password = false;
  }

  /**
   * @description Password - Edit the password from the table
   * @param item 
   */
  onEditAdditionalConfigPassword(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditAdditionalConfigPassword', JSON.stringify(item));
    this.thirdPasswordFormGroup1 = this._formBuilder.group({
      name: item.name,
      id: item.id
    });
    this.additionalConfigPasswordUpdateFlag = true;
    this.flag_update_password = true;
  }

  /**
   * @description Password - Deletes the password from the table
   * @param item 
   */
  onDeleteAdditionalConfigPassword(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigPassword', JSON.stringify(item));
    var index  = this.mConfigChoices_Password.indexOf(item);
    if(index > -1) {
      this.mConfigChoices_Password.splice(index, 1);
    }
    this.additionalConfigPasswordUpdateFlag = false;
    this.flag_update_password = false;
  }

  // Password End

  // Multivalue Start

  /**
   * @description Multivalue - Clears the Multivalue form
   */
  getThirdAdditionalConfigMulti() {
    this.thirdMultiFormGroup1 = this._formBuilder.group({
      name: ''
      // option: ''
    });
  }

  // onChangeSelectedRoleAdditionalConfigMulti(event) {
  //   this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeSelectedRoleAdditionalConfigMulti', JSON.stringify(event.source.selected), JSON.stringify(event.source.value));
  //   if(event.isUserInput) {
  //     if(this.selected_role_additional_config_value_multi === null) {
  //       this.selected_role_additional_config_value_multi = [];
  //       this.selected_role_default_config_selected = [];
  //     }
  //     if(event.source.selected) {
  //       this.selected_role_additional_config_value_multi.push(event.source.value);
  //       this.selected_role_default_config_selected = this.selected_role_default_config
  //     } else {
  //       var index = this.selected_role_additional_config_value_multi.indexOf(event.source.value);
  //       this.selected_role_additional_config_value_multi.splice(index, 1);
  //     }
  //   }
  // }

  // onChangeRoleServiceMapAdditionalConfigMulti(event) {
  //   this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onChangeRoleServiceMapAdditionalConfigMulti', JSON.stringify(event.source.selected), JSON.stringify(event.source.value));
  //   if(!this.additionalConfigMultiUpdateFlag)
  //   {
  //     if(event.source.selected) {
  //       this.additionalConfigMulti = new DefaultConfig(event.source.value, []);
  //       this.additionalConfigMultiUpdateFlag = false;
  //     }
  //   }
  // }

  // onMapRoleServiceAdditionalConfigMulti() {
  //   if(this.additionalConfigMulti.role === null || this.additionalConfigMulti.role.trim() === '') {
  //     this._utils.openSnackBar('Please select Role', '');
  //     this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigMulti', JSON.stringify('Please select Role'));
  //     return;
  //   }
  //   if(this.additionalConfigMulti.service === null || this.additionalConfigMulti.service.length === 0) {
  //     this._utils.openSnackBar('Please select Service', '');
  //     this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigMulti', JSON.stringify('Please select Service'));
  //     return;
  //   }
  //   if(this.mapRoleService_additional_config_multi === null) {
  //     this.mapRoleService_additional_config_multi = new Array<MappingRolesServices>();
  //   }
  //   var x = 0; var flag = false;
    
  //   if(!this.additionalConfigMultiUpdateFlag) {
  //     if(this.mapRoleService_additional_config_multi != null && this.mapRoleService_additional_config_multi.length > 0){
  //       for (let i = 0; i < this.mapRoleService_additional_config_multi.length; i++) {
  //         const element = this.mapRoleService_additional_config_multi[i];
  //         if(element.role_id === this.additionalConfigMulti.role){
  //           this._utils.openSnackBar(`Role \'${element.role_id}\' already added`, '');
  //           this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigMulti', JSON.stringify(`Role \'${element.role_id}\' already added`));
  //           flag = true;
  //           break;
  //         }    
  //       }
  //     }
  //     // TODO: CHECK EQUAL ADDTIONAL ROLE = MAP ROLE TO SERVER
  //     var tmpArr = [];
  //     for(let i = 0; i < this.additionalConfigMultiArr.length; i++) {
  //       const ele = this.additionalConfigMultiArr[i];
  //       if(ele['selected_role'].length > 0) {
  //         for(let j = 0; j < ele['selected_role'].length; j++) {
  //           tmpArr.push({
  //             'option': ele['option'],
  //             'selected_role': ele['selected_role'][j]
  //           });
  //         }
  //       } else {
  //         tmpArr.push({
  //           'option': ele['option'],
  //           'selected_role': ele['selected_role'][0]
  //         });
  //       }
  //     }
  //     for(let i = 0; i < tmpArr.length; i++) {
  //       if(tmpArr[i]['option'] === this.option_value && tmpArr[i]['selected_role'] === this.additionalConfigMulti.role) {
  //         // this.error_additionalRole_multivalue = 'Please select another additional role';
  //         this._utils.openSnackBar('Please map another additional role', '');
  //         this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigMulti', JSON.stringify('Please map another additional role'));
  //         flag = true;
  //         break;
  //       }
  //     }
      
  //     if(!flag) {
  //       this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigMulti', 'save', JSON.stringify({ role_id: this.additionalConfigMulti.role, service_ids: this.additionalConfigMulti.service  }));
  //       this.mapRoleService_additional_config_multi.push(<MappingRolesServices>{ role_id: this.additionalConfigMulti.role, service_ids: this.additionalConfigMulti.service  });
  //       this.additionalConfigMulti = new DefaultConfig('',[]);
  //       this.additionalConfigMultiUpdateFlag = false;
  //     }
  //   } else {

  //     var index = -1;
  //     if(this.mapRoleService_additional_config_multi != null && this.mapRoleService_additional_config_multi.length > 0){
  //       for (let i = 0; i < this.mapRoleService_additional_config_multi.length; i++) {
  //         const element = this.mapRoleService_additional_config_multi[i];
  //         if(element.role_id === this.additionalConfigMulti.role){
  //           flag = true;
  //           index = i;
  //           break;
  //         }    
  //       }
  //     }
  //     if(flag) {
  //       // this.mapRoleService_default_config.push(<MappingRolesServices>{ role_id: this.defaultConfig.role[x], service_ids: this.defaultConfig.service  });
  //       if(index > -1) {
  //         this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onMapRoleServiceAdditionalConfigMulti', 'update', JSON.stringify({ role_id: this.additionalConfigMulti.role, service_ids: this.additionalConfigMulti.service  }));
  //         this.mapRoleService_additional_config_multi[index].service_ids = this.additionalConfigMulti.service;
  //         this.additionalConfigMulti = new DefaultConfig('',[]);
  //         this.additionalConfigMultiUpdateFlag = false;
  //       }
  //     }
  //     this.additionalConfigMultiUpdateFlag = false;
  //   }
  //   // sessionStorage.setItem(this.key_mapRoleService_additionalConfig_multi, JSON.stringify(this.mapRoleService_additional_config_multi));
  // }

  // onEditAdditionalConfigMulti(item) {
  //   this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditAdditionalConfigMulti', JSON.stringify(item));
  //   this.additionalConfigMultiUpdateFlag = true;
  //   this.additionalConfigMulti = new DefaultConfig(item.role_id, item.service_ids);
  // }

  // onDeleteAdditionalConfigMulti(item) {
  //   this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigMulti', JSON.stringify(item));
  //   var index = this.mapRoleService_additional_config_multi.indexOf(item);
  //   if(index > -1) {
  //     this.mapRoleService_additional_config_multi.splice(index, 1);
  //   }
  // }

  /**
   * @description Multivalue - Add the multivalue form data in the table
   */
  onSaveThirdGroupMulti1() {
    if(this.thirdMultiFormGroup1.value.name === '') {
      this._utils.openSnackBar('Please enter name', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti1', 'Please enter name');
      return;
    }

    if(this.optionArr === null || this.optionArr.length === 0) {
      this._utils.openSnackBar('Please add option', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti1', 'Please add option');
      return;
    }

    let cnt = 1;
    if(this.additionalConfigMultiArr === null || this.additionalConfigMultiArr.length === 0) {
      this.additionalConfigMultiArr = [];  
    } else {
      cnt = this.additionalConfigMultiArr.reverse()[0]._id + 1;
      this.additionalConfigMultiArr.reverse();
    }

   

    if(this.multivalueId === 0){
      this.additionalConfigMultiArr.push({ 
        _id: cnt,
        name: this.thirdMultiFormGroup1.value.name, 
        option: this.optionArr, 
      });
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti1', 'Save', JSON.stringify({ 
        _id: cnt,
        name: this.thirdMultiFormGroup1.value.name, 
        option: this.optionArr }));
    } else {
      var updateIndex = this.additionalConfigMultiArr.find(x=>x._id === this.multivalueId);
      let index = this.additionalConfigMultiArr.indexOf(updateIndex);
      this.additionalConfigMultiArr[index].name = this.thirdMultiFormGroup1.value.name;
      this.additionalConfigMultiArr[index].option = this.optionArr;
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti1', 'Update', JSON.stringify({ 
        _id: this.additionalConfigMultiArr[index]._id,
        name: this.thirdMultiFormGroup1.value.name, 
        option: this.optionArr }));
    }
    

    this.thirdMultiFormGroup1 = this._formBuilder.group({
      name: '',
      // option: ''
    });

    this.selected_role_additional_config_value_multi = [];
    this.mapRoleService_additional_config_multi = [];
    this.optionArr = [];
    this.options = [];
    this.multivalueId = 0;

  }

/**
 * @description Mltivalue - the multivalue option in the table
 */
  onSaveThirdGroupMulti_TabOption() {
    if(this.thirdMultiFormGroup1.value.name === '') {
      this._utils.openSnackBar('Please enter name', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti_TabOption', 'Please enter name');

      return;
    }

    if(this.additionalConfigMultiArr_TabOption1 != null) {
      for(let i = 0; i < this.additionalConfigMultiArr_TabOption1.length; i++) {
        var tmp = this.additionalConfigMultiArr_TabOption1[i];
        if(tmp.name === this.thirdMultiFormGroup1.value.name) {
          this._utils.openSnackBar(`'${tmp.name}' already exist`, '');
          this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti_TabOption', `'${tmp.name}' already exist`);
          return;
        }
      }
    }


    // console.log('all tab data', this.tabs);
    for(let i = 0; i < this.tabs.length; i++) {
      var t1 = this.tabs[i];
      this.option_value = t1.title;
      this.additionalConfigMultiArr_TabOption.push({ 
        _id: i,
        name: this.thirdMultiFormGroup1.value.name, 
        // option: this.optionArr, 
        option: t1.title, 
        // selected_role: this.selected_role_additional_config_value_multi, 
        // selected_role: this.selected_role_additional_config_value_multi, 
        // map: this.mapRoleService_additional_config_multi,
        tmp: t1.mapRoleService_additional_config_multi 
      });
    }

    if(this.additionalConfigMultiArr_TabOption1 === null) {
      this.additionalConfigMultiArr_TabOption1 = [];
    }
    this.additionalConfigMultiArr_TabOption1 = [];
    // var oldName = '';
    // var cnt = 0;
    var tmpArr = [];
    for(let i = 0; i < this.additionalConfigMultiArr_TabOption.length; i++) {
      var t2 = this.additionalConfigMultiArr_TabOption[i];

      var selected_role = [];
      for(let j = 0; j < t2.tmp.length; j++) {
        selected_role.push(t2.tmp[j]['role_id']);
      }
      
      tmpArr.push(
       {
        _id: "multi" +i,
        name: t2.name,
        option: t2.option,
        selected_role: selected_role,
        map: t2.tmp,
       }
      );
    }
    // let dataExt: any[] = [];
    const nameSeen = {};
    this.additionalConfigMultiArr_TabOption1 = tmpArr.sort((a, b) => {
      const stateComp = a.name.localeCompare(b.name);
      return stateComp;
    }).map(x => {
      const nameSpan = nameSeen[x.name] ? 0 :
        tmpArr.filter(y => y.name === x.name).length;

        nameSeen[x.name] = true;
      return { ...x, nameSpan };
    });

    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onSaveThirdGroupMulti_TabOption', JSON.stringify(this.additionalConfigMultiArr_TabOption1));



    this.thirdMultiFormGroup1 = this._formBuilder.group({
      name: ''
        // option: ''
      });


      this.options = [];
      this.tabService.clearTab();
      this.flag_update_multivalue = false; 
  }

  /**
   * Multivalue - Update the multivalue option in the table
   * @param itemName 
   */
  onDeleteAdditionalConfigMultiArr_TabOption(itemName) {
    if(this.flag_update_multivalue) {
      return;
    }
    var all = this.additionalConfigMultiArr_TabOption1;
    
     var tmpArr = [];
    
    for(let i = 0; i < all.length; i++) {
      var tmp = all[i];
      if(tmp.name !== all[i].name) {
        tmpArr.push(tmp);
      }
    }
    this.additionalConfigMultiArr_TabOption1 = tmpArr;

    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigMultiArr_TabOption', 'Updated array', JSON.stringify(this.additionalConfigMultiArr_TabOption1));

    this.flag_update_multivalue =false;
  }

  /**
   * @description Multivalue - edit  the multivalue option in the table
   * @param itemName 
   */
  onEditAdditionalConfigMultiArr_TabOption (itemName) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditAdditionalConfigMultiArr_TabOption', JSON.stringify(itemName));
    if(this.flag_update_multivalue) {
      return;
    }
    this.thirdMultiFormGroup1 = this._formBuilder.group({
      name: ''
    });
    this.options = [];
    this.tabService.clearTab();
    var nameArray = this.additionalConfigMultiArr_TabOption1.filter(x=>x.name === itemName);
    // console.log(nameArray);
    this.flag_update_multivalue =true;
    this.thirdMultiFormGroup1 = this._formBuilder.group({
      name: nameArray[0].name
      // option: ''
    });

    this.thirdMultiFormGroup1.controls["name"].disable();

    for(let i = 0; i < nameArray.length; i++) {
      this.options.push(nameArray[i].option);
      this.editTabOption(nameArray[i].option, nameArray[i].map);
      //this.tabs.push()
    }
    
  }

/**
 * @description Multivalue - Update the multivalue option in the form
 */
  onUpdateThirdGroupMulti1_TabOption() {
   if(this.thirdMultiFormGroup1.value.name === '') {
      this._utils.openSnackBar('Please enter name', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onUpdateThirdGroupMulti1_TabOption', 'Please enter name');
      return;
    }

    var dataNoUpdatable = [];
    for(let i = 0; i < this.additionalConfigMultiArr_TabOption1.length; i++) {
      var ele = this.additionalConfigMultiArr_TabOption1[i];
      if(ele.name !== this.thirdMultiFormGroup1.value.name) {
        dataNoUpdatable.push(ele);
      }
    }
    
    

    this.additionalConfigMultiArr_TabOption = [];
    // console.log('all tab data', this.tabs);
    for(let i = 0; i < this.tabs.length; i++) {
      var t1 = this.tabs[i];
      this.option_value = t1.title;
      this.additionalConfigMultiArr_TabOption.push({ 
        // _id: i,
        name: this.thirdMultiFormGroup1.value.name, 
        option: t1.title, 
        tmp: t1.mapRoleService_additional_config_multi 
      });
    }

    

    

    if(this.additionalConfigMultiArr_TabOption1 === null) {
      this.additionalConfigMultiArr_TabOption1 = [];
    }
    this.additionalConfigMultiArr_TabOption1 = [];
    var tmpArr = [];
    for(let i = 0; i < this.additionalConfigMultiArr_TabOption.length; i++) {
      var t2 = this.additionalConfigMultiArr_TabOption[i];

      var selected_role = [];
      for(let j = 0; j < t2.tmp.length; j++) {
        selected_role.push(t2.tmp[j]['role_id']);
      }
      
      tmpArr.push(
       {
        name: t2.name,
        option: t2.option,
        selected_role: selected_role,
        map: t2.tmp,
       }
      );
    }

    for(let i = 0; i < dataNoUpdatable.length; i++) {
      var tmp = dataNoUpdatable[i];
      tmpArr.push({
        name: tmp.name,
        option: tmp.option,
        selected_role: tmp.selected_role,
        map: tmp.map,
      });
    }
    const nameSeen = {};
    this.additionalConfigMultiArr_TabOption1 = tmpArr.sort((a, b) => {
      const stateComp = a.name.localeCompare(b.name);
      return stateComp;
    }).map(x => {
      const nameSpan = nameSeen[x.name] ? 0 :
        tmpArr.filter(y => y.name === x.name).length;

        nameSeen[x.name] = true;
      return { ...x, nameSpan };
    });


    this.thirdMultiFormGroup1 = this._formBuilder.group({
        name: '',
      });


      this.options = [];
      this.tabService.clearTab();
      this.flag_update_multivalue = false; 
  }

  

  /**
   * @description Multivalue - Deletes the multivalue in the table
   * @param item 
   */
  onDeleteAdditionalConfigMultiArr (item){
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteAdditionalConfigMultiArr', JSON.stringify(item));
    var index = this.additionalConfigMultiArr.indexOf(item);
    if(index > -1) {
      this.additionalConfigMultiArr.splice(index, 1);
    }
    // sessionStorage.setItem(this.key_additionalConfig_multi, JSON.stringify(this.additionalConfigMultiArr));
  }

/**
 * @description Multivalue - edit the multivalue in the form
 * @param item 
 */
  onEditAdditionalConfigMultiArr_new (item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditAdditionalConfigMultiArr_new', JSON.stringify(item));

    this.thirdMultiFormGroup1 = this._formBuilder.group({
      name: item['name'],
      // option: ''
    });

    this.option_value = item['option'];
    this.selected_role_additional_config_value_multi = item['selected_role'];
    this.mapRoleService_additional_config_multi = item['map'];
    
    
    for(let i = 0; i < this.additionalConfigMultiArr.length; i++) {
      const ele = this.additionalConfigMultiArr[i];
      if(ele.name.toLowerCase() === item['name'].toLowerCase()) {
        if(this.options.length === 0) {
          this.options.push(ele.option);
        } else {
            var optExist = this.options.find(itemopt => itemopt === ele.option);
            if(optExist === undefined) {
              this.options.push(ele.option);
            }
        }
        
      }
    }

    this.flag_update_multivalue =true;
    
    this.multivalueId = item['_id'];
   
  }

  /**
   * Multivalue - add the option in the option array and create new tab 
   * @param event 
   */
  addOption(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','addOption', JSON.stringify({'input': input, 'value': value}));
      
      if ((value || '').trim()) {
        if(this.options.indexOf(value.trim()) === -1) {
          this.options.push(value.trim());
          this.addNewTabOption(value.trim());
          if(this.options.length > 0) {
            this.flagButton = true;  
          }
          

        }
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.optionCtrl.setValue(null);
    }
  }

  /**
   * Multivalue - Deletes the option from option array list and removes the option tab
   * @param item 
   */
  removeOption(item: string): void {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','removeOption', JSON.stringify(item));
    const index = this.options.indexOf(item);

    if (index >= 0) {
      this.options.splice(index, 1);
      this.removeTabOption(index);
      if(this.options.length == 0) {
        this.flagButton = false;  
      }
    }
  }

  /**
   * @description Multivalue - executes then option is selected
   * @param event 
   */
  selectedOption(event: MatAutocompleteSelectedEvent): void {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','selectedOption', JSON.stringify(event.option.viewValue));
    this.options.push(event.option.viewValue);
    this.optionInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  private _filterOption(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allOptions.filter(opt => opt.toLowerCase().indexOf(filterValue) === 0);
  }

  option_value = '';
  optionArr = [];
  option_update_flag = false;
  optionId = 0;
  multivalueId = 0;
  error_option = '';
  
  onAddOption() {

    if(this.option_value.trim().length === 0) {
      this._utils.openSnackBar('Please enter options', '');
      this.error_option = 'Please enter options';
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddOption', 'Please enter options');
      setTimeout(() => this.error_option = '', 3000);
      return;
    }

    if(this.selected_role_additional_config_value_multi.length === 0) {
      this._utils.openSnackBar('Please select additional role', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddOption', 'Please select additional role');
      return;
    }

    if(this.mapRoleService_additional_config_multi.length === 0) {
      this._utils.openSnackBar('Please map role to service', '');
      this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddOption', 'Please map role to service');
      return;
    }

    let cnt = 1;
    if(this.optionArr === null || this.optionArr.length === 0) {
      this.optionArr = [];  
    } else {
      cnt = this.optionArr.reverse()[0]._id + 1;
      this.optionArr.reverse();
    }

    if(!this.option_update_flag) { // add option
      var tmpOptionExist = this.optionArr.some(x=>x.option === this.option_value);
      if(!tmpOptionExist) {
        this.optionArr.push({ 
          _id: cnt,
          option: this.option_value, 
          selected_role: this.selected_role_additional_config_value_multi, 
          map: this.mapRoleService_additional_config_multi });
        this.selected_role_additional_config_value_multi = [];
        this.mapRoleService_additional_config_multi = [];
      } else {
        this._utils.openSnackBar('Please select another option', '');
        this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onAddOption', 'Please select another option');
      }
    } else { // update option
      let updateOptionItem = this.optionArr.find(item => item._id === this.optionId);
      let index = this.optionArr.indexOf(updateOptionItem);
      this.optionArr[index].option = this.option_value;
      this.optionArr[index].selected_role = this.selected_role_additional_config_value_multi;
      this.optionArr[index].map = this.mapRoleService_additional_config_multi;
      this.selected_role_additional_config_value_multi = [];
      this.mapRoleService_additional_config_multi = [];
    }

    this.option_update_flag = false;
    this.optionId = 0;
  }

  /**
   * @description Multivalue - Edit the multivalue from the option table row
   * @param item 
   */
  onEditOption(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onEditOption', JSON.stringify(item));
    this.optionId = item._id;
    this.option_value = item.option;
    this.selected_role_additional_config_value_multi = item.selected_role;
    this.mapRoleService_additional_config_multi = item.map;
    this.option_update_flag = true;
  }

  /**
   * @description Multivalue - Deletes the multivalue from the option table row
   * @param item 
   */
  onDeleteOption(item) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','onDeleteOption', JSON.stringify(item));
    var index = this.optionArr.indexOf(item);
    if(index > -1) {
      this.optionArr.splice(index, 1);
    }
    this.option_update_flag = false;
    this.optionId = 0;
  }
  // Multivalue End


  // TAB START
  /**
   * Multivalue - Tab change event
   * @param event 
   */
  tabChanged(event) {
    // console.log("tab changed");
  }

  // /**
  //  * @description Multivalue - Add new tab
  //  */
  // addNewTab() {
    
  //   this.tabService.addTab(
  //     new Tab(MultivalueOptionComponent, "Comp1 View", { parent: "StepConfigChoiceComponent", role: this.final.roles, service: this.final.services }, null)
  //   );
  // }

  /**
   * @description Multivalue - Add new tab option
   */
  addNewTabOption(optionName: string) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','addNewTab', 'optionName');
    this.tabService.addTab(
      new Tab(MultivalueOptionComponent, optionName, { parent: "StepConfigChoiceComponent", role: this.final.roles, service: this.final.services }, null)
    );
  }

  /**
   * @description Multivalue - Edit new tab option
   */
  editTabOption(optionName: string, mapRoleService_additional_config_multi1: Array<MappingRolesServices>) {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','editTabOption', 'optionName', JSON.stringify(mapRoleService_additional_config_multi1));
    this.tabService.addTab(
      new Tab(MultivalueOptionComponent, optionName, { parent: "StepConfigChoiceComponent", role: this.final.roles, service: this.final.services }, mapRoleService_additional_config_multi1)
    );
  }

  // removeTab(index: number): void {
  //   this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','removeTab', JSON.stringify(index));
  //   this.tabService.removeTab(index);
  // }

  /**
   * @description Multivalue - Deletes new tab option
   */
  removeTabOption(index: number): void {
    this.log.write(LogLevel.Info, 'StepConfigChoiceComponent','removeTabOption', JSON.stringify(index));
    this.tabService.removeTab(index);
  }
  //TAB END 
  
}
