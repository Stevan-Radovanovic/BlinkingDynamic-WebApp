import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormControlModel } from './formControl.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dynamic-form-test';

  dynamicForm!: FormGroup;
  formControlArray: FormControlModel[] = [];
  transformedControlArray: any = {};
  submittedForm: string = '';

  constructor() {
    this.getForm();
    this.transformToControls();
    this.initializeForm();
  }

  getForm() {
     this.formControlArray = [
      {
        name: 'name',
        label:'Name',
        value:'Stevan',
        type:'input',
        required: true
      },
      {
        name: 'lastName',
        label:'Last Name',
        value:'Radovanovic',
        type:'input',
        required: true
      },
      {
        name: 'terms',
        label:'Gender',
        value: 'Male',
        type:'select',
        required: true,
        options: ['Male','Female','Neutral']
      },
      {
        name: 'hobbies',
        label:'Hobbies',
        value: ['Gaming','Mountaineering'],
        type:'multiple-select',
        required: true,
        options: ['Cooking','Fishing','Gaming','Mountaineering','Running']
      },
      {
        name: 'comment',
        label:'Comment',
        value: '',
        type:'textarea',
        required: true,
        rows: 4
      },
    ];
  }

  transformToControls() {
    this.formControlArray.forEach((control) => {
      this.transformedControlArray[control.name] = new FormControl(control.value,control.required?Validators.required:[])
    })
  }

  initializeForm() {
    this.dynamicForm = new FormGroup(this.transformedControlArray);
  }

  changeCheckboxValue(control: FormControlModel) {
      control.value = !control.value;
  }

  submit() {
    const data: any = {}

    for (const control in this.dynamicForm.controls) {
      data[control] = this.dynamicForm.controls[control].value;
    }

    this.submittedForm = JSON.stringify(data);
  }
  
}
