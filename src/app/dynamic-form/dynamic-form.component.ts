import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { FormControlModel } from './form-control.model';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {

  dynamicForm!: FormGroup;
  formControlArray: FormControlModel[] = [];
  transformedControlArray: any = {};
  submittedForm: string = '';
  autoCompleteSubscription!: Subscription;

  constructor(private serv: AppService) {
    this.getForm();
    this.transformToControls();
    this.initializeForm();
  }

  ngOnInit(): void {
  }

  getForm(): void {
     this.formControlArray = [
      {
        name: 'street',
        label:'Street',
        value:'',
        type:'input',
        required: true,
        inputType: 'text',
        hasAutocomplete: true,
        autocompleteConfig: {
          url: 'https://onboarding-api-local-dev.blinking.services/getStreets/?key=',
          returnType: ['name','cityName','regionName','placeName']
        }
      },
      {
        name: 'lastName',
        label:'Last Name',
        value:'Radovanovic',
        type:'input',
        required: true,
        inputType: 'text'
      },
      {
        name: 'terms',
        label:'Gender',
        value: 'Male',
        type:'select',
        required: true,
        selectOptions: ['Male','Female','Neutral']
      },
      {
        name: 'hobbies',
        label:'Hobbies',
        value: ['Gaming','Mountaineering'],
        type:'multiple-select',
        required: true,
        selectOptions: ['Cooking','Fishing','Gaming','Mountaineering','Running']
      },
      {
        name: 'comment',
        label:'Comment',
        value: 'Commenttttttt',
        type:'textarea',
        required: true,
        rows: 4
      },
      {
        name: 'checkbox',
        label:'Checkbox',
        value: [],
        type: 'checkbox',
        required: true,
        checkboxOptions: ['Option1','Option2','Option3','Option4','Option5'],
        multipleChoiceCheckbox: false,
        hasOtherField: true,
      }
    ];
  }

  //Transform each object form initial JSON objects array into a form control
  transformToControls(): void {
    this.formControlArray.forEach((control) => {

      if(control.type==='checkbox') {
        control.checkboxCheckedValues = [];
        control.checkboxOptions?.forEach(() => {control.checkboxCheckedValues?.push(false)});
      }
        if(control.hasOtherField) {
          this.transformedControlArray[control.name + '-internal-other'] = new FormControl({value: '',disabled: true});
          control.checkboxCheckedValues?.push(false);
      }

      this.transformedControlArray[control.name] = new FormControl(control.value,control.required?Validators.required:[])
    });
  }

  initializeForm(): void {
    this.dynamicForm = new FormGroup(this.transformedControlArray);
  }

  //Called with each checbox (un)checking, changes the overall value of the checkboxes form control
  setCheckboxValue(event: any, control: FormControlModel, index: number): void {

    const checkboxLength = control.checkboxCheckedValues!.length;
    const currentValue: string[] =[];

    if(event instanceof MatCheckboxChange) {
 
      if(!control.checkboxCheckedValues![index]) {
        control.checkboxCheckedValues![index] = true;
 
        if(control.hasOtherField && index===checkboxLength-1) {
         this.dynamicForm.get(control.name + '-internal-other')?.enable();
       }
 
      } else {
       control.checkboxCheckedValues![index] = false;
 
       if(index===checkboxLength-1 && control.hasOtherField) {
         this.dynamicForm.get(control.name + '-internal-other')?.disable();
         this.dynamicForm.get(control.name + '-internal-other')?.reset('');
       }
 
      }
 
       if(!control.multipleChoiceCheckbox) {
 
         for(let i=0;i<checkboxLength;i++) {
           if(i!==index) control.checkboxCheckedValues![i] = false;
         }

         if(index!==checkboxLength-1 && control.hasOtherField) {
          this.dynamicForm.get(control.name + '-internal-other')?.disable();
          this.dynamicForm.get(control.name + '-internal-other')?.reset('');
         }
       }

      } 

      for(let i=0;i<control.checkboxOptions!.length;i++) {
        if(control.checkboxCheckedValues![i]===true) currentValue.push(control.checkboxOptions![i])
      }

      if(control.hasOtherField && control.checkboxCheckedValues![checkboxLength-1]) {
        currentValue.push(this.dynamicForm.get(control.name + '-internal-other')?.value);
      }

      this.dynamicForm.get(control.name)?.setValue(currentValue);

  }

  //Called with ech value change for auto complete inputs
  getAutoCompleteOptions(newValue: string, control: FormControlModel): void {

    if(!newValue || newValue.length<3) {
      control.autoCompleteOptions = [];
      return;
    } 

    this.autoCompleteSubscription = this.serv.getAutocompleteSource(control.autocompleteConfig!.url,newValue).subscribe((response: any) => {

      if(control.autocompleteConfig?.returnType==='string') {
        control.autoCompleteOptions = response.payload;
        return;
      }

      control.autoCompleteOptions = [];

      response.payload.forEach((value: any) => {
        let option = '';
        (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
          console.log(param,value[param])
          option = option.concat(value[param]+', ');
        })
        control.autoCompleteOptions!.push(option.slice(0,option.length-2));
      })
      
    });
    
  }

  onClickAutocomplete(option: string,control: FormControlModel) {
      this.dynamicForm.get(control.name)?.setValue(option);
    }

  submit(): void {
    const data: any = {}

    for (const control in this.dynamicForm.controls) {
      if(control.endsWith('-internal-other')) continue;
      data[control] = this.dynamicForm.controls[control].value;
    }

    this.submittedForm = JSON.stringify(data);
  }

  ngOnDestroy(): void {
    this.autoCompleteSubscription?.unsubscribe();
  }
}
