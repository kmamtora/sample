import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, Subscription } from 'rxjs';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { startWith, map } from 'rxjs/operators';
import { DataService } from 'src/app/shared/data.service';
import { ApiService } from 'src/app/shared/api.service';
import { Final } from 'src/app/model/final/final';
import { LogService, LogLevel } from 'src/app/shared/log.service';

@Component({
  selector: 'app-step-image-detail',
  templateUrl: './step-image-detail.component.html',
  styleUrls: ['./step-image-detail.component.css']
})
export class StepImageDetailComponent implements OnInit, OnDestroy {

  form: FormGroup;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  categoryCtrl = new FormControl(null, Validators.required);
  categoryVisible = false;
  filteredCategory: Observable<string[]>;
  allCategory: string[] = ['Hadoop', 'Kafka', 'Spark', 'Utility', 'Data Science'];
  @ViewChild('categoryInput', {static: false}) categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocategory', {static: false}) matAutocompleteCategory: MatAutocomplete;
  categoryList: string[] = [];

  final = new Final();

  messages: any[] = [];
  subscription: Subscription;

  constructor(private _formBuilder: FormBuilder, private _api: ApiService, 
    private _data: DataService, private log: LogService) { 
    this.filteredCategory = this.categoryCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) => item ? this._filter(item) : this.allCategory.slice()));
  }

  /**
   * @description handle any additional initialization tasks
   */
  ngOnInit() {
    this.log.write(LogLevel.Info, 'StepImageDetailComponent');
    this.onClearImageDetails();
    this.subscription = this._data.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
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
    if(this.final !== undefined && this.final !== null) {
      if(this.final['catalog'] !== undefined && this.final['catalog'] !== null) {
        this.form = this._formBuilder.group({
          appName: [this.final['catalog']['name'], Validators.required],
          appDescription: [this.final['catalog']['description'], Validators.required],
          appVersion: [this.final['catalog']['version'], [Validators.required, Validators.pattern('^([0-9]{1,2})?(\.[0-9]{1,2})?(\.[0-9]{1,2})?$')]],
          appDistroID: [this.final['catalog']['distroid'], Validators.required],
        });
        this.categoryList = this.final['catalog']['categories'];
      }
    }
  }

  get _imageDetail_appName() {
    return this.form.get('appName');
  }

  get _imageDetail_appDescription() {
    return this.form.get('appDescription');
  }

  get _imageDetail_appVersion() {
    return this.form.get('appVersion');
  }

  get _imageDetail_appDistroID() {
    return this.form.get('appDistroID');
  }

  get _imageDetail_appCategory() {
    return this.categoryCtrl;
  }

  /**
   * @description Clears the form input
   */
  onClearImageDetails() {
    this.log.write(LogLevel.Info, 'StepImageDetailComponent', 'onClearImageDetails');
    this.form = this._formBuilder.group({
      appName: ['', Validators.required],
      appDescription: ['', Validators.required],
      appVersion: ['', [Validators.required, Validators.pattern('^([0-9]{1,2})?(\.[0-9]{1,2})?(\.[0-9]{1,2})?$')]],
      appDistroID: ['', Validators.required],
    });
  }

  /**
   * @description Adds the new category
   * @param event MatChipInputEvent
   */
  addCategory(event: MatChipInputEvent): void {
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocompleteCategory.isOpen) {
      const input = event.input;
      const value = event.value;
      // Add our category
      if ((value || '').trim()) {
        if (this.categoryList.indexOf(value.trim()) > -1) {
          // value exists in array
        } else {
          // value does not exists in array
            this.categoryList.push(value.trim());
            this.log.write(LogLevel.Info, 'StepImageDetailComponent', 'addCategory', value.trim());
        }
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }
      if(this.categoryList.length === 0) {
        this.categoryVisible = true;
      } else {
        this.categoryVisible = false;
      }
      this.categoryCtrl.setValue(null);
    }
  }

  /**
   * @description remove the category
   * @param item String
   */
  removeCategory(item: string): void {
    const index = this.categoryList.indexOf(item);

    if (index >= 0) {
      this.categoryList.splice(index, 1);
      this.log.write(LogLevel.Info, 'StepImageDetailComponent', 'removeCategory', item);
    }
    if(this.categoryList.length === 0) {
      this.categoryVisible = true;
    } else {
      this.categoryVisible = false;
    }
  }

  /**
   * @description this event executes the selected category
   * @param event MatAutocompleteSelectedEvent
   */
  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    if(this.categoryList.indexOf(event.option.value) > -1) {
      // value exists in array
    } else {
      // value does not exist in array
      this.categoryList.push(event.option.viewValue);
    }
    this.categoryInput.nativeElement.value = '';
    this.categoryCtrl.setValue(null);
  }

  /**
   * @description _filter
   * @param value String
   * filter the input category from the list
   */
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCategory.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * @description allows only numeric values in the input field for app version
   * @param event 
   */
  numberDotOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    // if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    if ((charCode != 46) && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }

}
