import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HeaderComponent } from './layout/header/header.component';

import {A11yModule} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';

import { ImageStatusComponent } from './component/image-status/image-status.component';
import { BuildCustomImageComponent } from './component/build-custom-image/build-custom-image.component';
import { StepBuildComponent } from './component/step-build/step-build.component';
import { StepConfigChoiceComponent } from './component/step-config-choice/step-config-choice.component';
import { StepContainerAppConfigComponent } from './component/step-container-app-config/step-container-app-config.component';
import { StepImageDetailComponent } from './component/step-image-detail/step-image-detail.component';
import { StepServiceRoleComponent } from './component/step-service-role/step-service-role.component';
import { EditorDialogComponent } from './component/editor-dialog/editor-dialog.component';
import { EditorJsonDialogComponent } from './component/editor-json-dialog/editor-json-dialog.component';

import { NgJsonEditorModule } from 'ang-jsoneditor';
import { MultivalueOptionComponent } from './tab/multivalue-option/multivalue-option.component'
import { TabService } from './tab/tab.service';
import { ContentContainerDirective } from './tab/content-container.directive';
import { TabContentComponent } from './tab/tab-content.component';
import { BrowseDialogComponent } from './component/browse-dialog/browse-dialog.component';
import { MapToIterable } from './shared/map-to-iterable.pipe';
import { LogService } from './shared/log.service';
import { HttpModule } from '@angular/http';

const MaterialModule = [
  A11yModule,
  CdkStepperModule,
  CdkTableModule,
  CdkTreeModule,
  DragDropModule,
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatStepperModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  PortalModule,
  ScrollingModule
];


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ImageStatusComponent,
    BuildCustomImageComponent,
    StepBuildComponent,
    StepConfigChoiceComponent,
    StepContainerAppConfigComponent,
    StepImageDetailComponent,
    StepServiceRoleComponent,
    EditorDialogComponent,
    EditorJsonDialogComponent,
    MultivalueOptionComponent,
    TabContentComponent,
    ContentContainerDirective,
    BrowseDialogComponent,
    MapToIterable,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgJsonEditorModule,
    NgbModule,
    NgbPopoverModule,
    HttpModule,
  ],
  entryComponents: [ EditorDialogComponent,EditorJsonDialogComponent,MultivalueOptionComponent,BrowseDialogComponent ],
  exports: [
    MaterialModule,
  ],
  providers: [TabService, LogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
