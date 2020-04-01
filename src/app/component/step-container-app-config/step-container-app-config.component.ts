import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { EditorDialogComponent } from '../editor-dialog/editor-dialog.component';
import { DataService } from 'src/app/shared/data.service';
import { ApiService } from 'src/app/shared/api.service';
import { UtilsService } from 'src/app/shared/utils.service';
import { BrowseDialogComponent } from '../browse-dialog/browse-dialog.component';
import { ParentNode } from 'src/app/model/parent-node';
import { Final } from 'src/app/model/final/final';
import { imagebuild } from 'src/app/model/final/image-build';
import { imageload } from 'src/app/model/final/image-load';
import { LogService, LogLevel } from 'src/app/shared/log.service';

@Component({
  selector: 'app-step-container-app-config',
  templateUrl: './step-container-app-config.component.html',
  styleUrls: ['./step-container-app-config.component.css']
})
export class StepContainerAppConfigComponent implements OnInit, OnDestroy {

  final = new Final();

  pnode: ParentNode[] = [];

  messages: any[] = [];
  subscription: Subscription;

  selected_container_val = 'None';
  selected_container_value = 'None';
  selected_container_arr = ['None', 'Local', 'Registry' ];
  selected_container_arr_backup = ['None', 'Build an image', 'Pull from registry' ];
  dockerImageNoneFlag = false;
  container_flag = 0;

  build_repo_tag = '';
  build_base_dir = '';
  registry_repo_tag = '';
  selected_build_os_type_arr = ['rhel7','ubuntu18','centos7'];
  selected_registry_os_type_arr = ['rhel7','ubuntu18','centos7'];
  build_os_type_value = '';
  registry_os_type_value = '';
  url = '';
  contentTrust = false;
  authentication = false;

  appConfigPath = '';
  editorData: string
  mdTemplate: string = '';
  imageFile: File;
  buildFile: File;
  appConfigFile: File;
  imagePreview = '';

  mdFilePath = '';

  repoTagPattern = '^[a-zA-Z0-9][a-zA-Z0-9_.-/:]+$'

  error_logo = '';

  openDialogFlag = false;

  imageBuild = new imagebuild();
  imageLoad = new imageload();

  constructor(private _data: DataService, public _dialog: MatDialog, private _api: ApiService,private _utils: UtilsService,
    private log: LogService) { }

  /**
   * @description handle any additional initialization tasks
   */
  ngOnInit() {
    this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent');
    this.container_flag = 0
    this.selected_container_value = 'None';
    this.selected_container_val = 'None';
    this.subscription = this._data.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
        this.final = message.text;

        this.updateView();
      } else {
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
    if(this.final !== undefined && this.final !== null) {
      if(this.final.image !== undefined && this.final.image !== null) {
        let image = this.final.image;
        if(image['build'] !== undefined && image['build'] !== null) {
          this.build_base_dir = image['build']['basedir'];
          this.build_repo_tag = image['build']['repotag'];
          this.build_os_type_value = image['build']['os'];
          this.selected_container_value = 'Build an image';
          this.selected_container_val = 'Local';
          this.container_flag = 1;
        }
        if(image['load'] !== undefined && image['load'] !== null) {
          // console.log(image['load'])
          this.registry_repo_tag = image['load']['repotag'];
            this.registry_os_type_value = image['os'];
            this.url = image['load']['registry']['url'];
            this.contentTrust = image['load']['registry']['contentTrust'];
            this.authentication = image['load']['registry']['authentication'];
            this.selected_container_value = 'Pull from registry';
          this.selected_container_val = 'Registry';
          this.container_flag = 2;
        }

      } else {
        // null;
          this.selected_container_value = 'None';
          this.selected_container_val = 'None';
          this.container_flag = 0;
      }

      if(this.final.appconfig !== undefined && this.final.appconfig !== null) {
        this.appConfigPath = this.final.appconfig['basedir'];
      }
      if(this.final.logo !== undefined && this.final.logo !== null) {
        this.imagePreview = this.final.logo['filepath'];
      }
      if(this.final.document !== undefined && this.final.document !== null) {
        this.mdFilePath = this.final.document['filepath'];
      }
    }

  }

  /**
   * @description Radio button check the container image is registery or build and display the content
   * @param event
   */
  onChangeSelectedContainer(event) {
  // if(event.source.selected) {
    if(event.source.value === 'None') {
      this.container_flag = 0
      this.selected_container_value = 'None';
    }
    if(event.source.value === 'Local') {
      this.container_flag = 1
      this.selected_container_value = 'Build an image';
    }
    if(event.source.value === 'Registry') {
      this.container_flag = 2
      this.selected_container_value = 'Pull from registry';
    }
    this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent', 'onChangeSelectedContainer', event.source.value);
  // }
}

/**
 * @description Open's the dialog for editing the md file and reads the md file if already exist
 */
  openDialogEditor(): void {
    // this.editorData = this.mdTemplate;
    this.openDialogFlag = true;
    this.getMdFileIfExist();

  }

  /**
   * Uploads md file in the workspace
   */
  fnUploadMdFile() {
    const formData = new FormData();
      formData.append('mdData', this.editorData);
      formData.append('mdFileName', 'document.md');
      // api
      this.log.write(LogLevel.Debug,'StepContainerAppConfigComponent', 'fnUploadMdFile', JSON.stringify(this.editorData));
      let promise = this._api.fnUploadMdFile(formData).toPromise();
      promise.then(res=>{
        if(res['status'] === 201) {
          this.mdFilePath = `${res['data']['url']}`;
        }
      }).catch(err=>{
        this.log.write(LogLevel.Error,'StepContainerAppConfigComponent', 'fnUploadMdFile', JSON.stringify(err));
      });
  }

  /**
   * @description Uploads the image in workspace from the local machine
   * @param event
   */
  onImageFileChanged(event) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const height = img.naturalHeight;
          const width = img.naturalWidth;
          const extention = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLocaleLowerCase();
          // check if file is png
          if(file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLocaleLowerCase() === '.png') {
            if( width > 400 || width == 0) {
              this.error_logo = 'Image size should be 400 x 200';
              this.log.write(LogLevel.Debug,'StepContainerAppConfigComponent', 'onImageFileChanged', 'Image size should be 400 x 200');
              this.imagePreview = '';
              return;
            }
            if(height > 200 || height == 0) {
              this.error_logo = 'Image size should be 400 x 200';
              this.log.write(LogLevel.Debug,'StepContainerAppConfigComponent', 'onImageFileChanged', 'Image size should be 400 x 200');
              this.imagePreview = '';
              return;
            }
          }

          // check if file is jpg
          if(file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLocaleLowerCase() === '.jpg' ||
            file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLocaleLowerCase() === '.jpeg') {
            if( file.size > 512000) {
              this.error_logo = 'Image size should more than 512 KB';
              this.log.write(LogLevel.Debug,'StepContainerAppConfigComponent', 'onImageFileChanged', 'Image size should more than 512 KB');
              this.imagePreview = '';
              return;
            }
          }

          this.imageFile = event.target.files[0]
          const formData = new FormData();
          formData.append('file', this.imageFile);
          formData.append('fileName', 'logo' + extention);
          // api
          this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent', 'onImageFileChanged', JSON.stringify(this.imageFile), JSON.stringify(extention));
          let promise = this._api.fnUploadLogo(formData).toPromise();
          promise.then(res=>{
            if(res['status'] === 201) {
              this.imagePreview = `${res['data']['url']}`
              this.error_logo = '';

            }
          }).catch(err=>{
            this.imagePreview = '';
            this.error_logo = 'Unable to upload image';
            this.log.write(LogLevel.Error, 'onImageFileChanged', JSON.stringify(err));

          });
        };
      }
    }
  }

  /**
   * @description check's the md file if exists and open the popup
   */
  getMdFileIfExist(){
    // api
    this._api.fnGetMDFileFromServer().subscribe(data => {

      if(data['status'] == 201) {
        this.mdTemplate = data['data'];
        this.editorData = this.mdTemplate;
        this.openDialog();
      } else if (data['status'] == 400) {
        this.getMdfileTemplate();
      } else {
        this.getMdfileTemplate();
      }

    });
  }

  /**
   * @description get the md file template
   */
  getMdfileTemplate() {
    // api
    this._api.getMDFile().subscribe(data => {
        this.mdTemplate = data;
        this.setMdTemplate();
    });
  }

  /**
   * @description set the image detail in the md file
   */
  setMdTemplate() {
    if(this.final.catalog != null) {
      this.mdTemplate = this.mdTemplate.replace("{name}", this.final.catalog.name);
      this.mdTemplate = this.mdTemplate.replace("{name}", this.final.catalog.name);
      this.mdTemplate = this.mdTemplate.replace("{distroid}", this.final.catalog.distroid);
      this.mdTemplate = this.mdTemplate.replace("{version}", this.final.catalog.version);
      this.editorData = this.mdTemplate;
      this.openDialog();

    }
  }

  /**
   * @description Open it the md file dialog for viewing / editing
   */
  openDialog() {
    if(this.openDialogFlag) {
      let dialogRef = this._dialog.open(EditorDialogComponent, {
        hasBackdrop: true,
        width: '750px',
        data: { editorData: this.editorData }
      });


      dialogRef.afterClosed().subscribe(result => {
        if(result !== undefined) {
          this.log.write(LogLevel.Debug, 'openDialog', JSON.stringify(result));
          this.editorData = result;
          this.openDialogFlag = false;
          this.fnUploadMdFile();

        }
      });
    }
  }

  /**
   * @description Open's the dialog for selecting the app config folder
   */
  fnAppConfigClick() {
    this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent', 'fnAppConfigClick');
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
            this.appConfigPath = result;
            this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent', 'fnAppConfigClick', JSON.stringify(result));
          }
        });
      }
    }).catch(err=>{
      this.appConfigPath = '';
      this.log.write(LogLevel.Error, 'StepContainerAppConfigComponent', 'fnAppConfigClick', JSON.stringify(err));
    });
  }

  /**
   * @description Browse the directory of the docker file
   */
  fnBaseDirClick() {
    this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent', 'fnBaseDirClick');
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
            this.log.write(LogLevel.Debug, 'StepContainerAppConfigComponent', 'fnBaseDirClick', result);
            this.build_base_dir = result;
          }
        });
      }
    }).catch(err=>{
      this.build_base_dir = '';
      this.log.write(LogLevel.Error, 'StepContainerAppConfigComponent', 'fnBaseDirClick', JSON.stringify(err));
    });
  }
}
