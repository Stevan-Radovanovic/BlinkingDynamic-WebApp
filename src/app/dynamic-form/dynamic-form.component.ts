import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { FormControlModel } from './form-control.model';
import { DynamicFormModel } from "./form.model";

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {

  dynamicForm!: FormGroup;
  formJson: DynamicFormModel;
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

  //Currently hardcoded
  getForm(): void {

    this.formJson = {
      title: 'Title',
      text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum 
      has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a 
      galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, 
      but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s 
      with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software 
      ike Aldus PageMaker including versions of Lorem Ipsum.`,
      controls: []
    }

    this.formControlArray = this.formJson?.controls;

    this.getForm3();
   
  }

  getForm1(): void {
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

  getForm2(): void {
    this.formControlArray = [
      {
        label: "Status zaposlenja",
        name: "employmentStatus",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Zaposlen','Nezaposlen','Penzioner','Vlasnik preduzeća','Preduzetnik','Poljoprivrednik','Student'],
        multipleChoiceCheckbox: false,
      },
      {
        label: "Svrha i namena poslovnog odnosa / otvaranja računa",
        name: "accountOpeningPurpose",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Radi prijema zarade','za potrebe isplate kupoprodajne cene po ugovoru o prometu nepokretnosti i pokretnih stvari','za prijem priliva i naknada po osnovu povremenih i privremenih poslova','za prijem priliva iz inostranstva','za potrebe polaganja depozita kod Banke'],
        multipleChoiceCheckbox: false,
        hasOtherField: true
      },
      {
        label: "Obim očekivane aktivnosti preko računa – očekivano kretanje sredstava na računu",
        name: "volumeOfExpectedActivities1",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Mesečno','Polugodišnje','Godišnje'],
        multipleChoiceCheckbox: false,
      },
      {
        label: "",
        name: "volumeOfExpectedActivities2",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Do 100.000 RSD','do 500.000 RSD','Do 1.000.000 RSD'],
        multipleChoiceCheckbox: false,
        hasOtherField: true
      },
      {
        label: "Stepen stručne spreme",
        name: "professionalDegree",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Bez osnovne','Osnovna škola','Stručna škola','Srednja škola',
        'Viša škola','Visoka sprema','Magistratura','Doktorat','Nepoznata'],
        multipleChoiceCheckbox: false,
        hasOtherField: true
      },
    ]
  }

  getForm3(): void {
    this.formControlArray = [
      {
        name: 'Local Auto',
        label:'Local Auto',
        value:'',
        type:'input',
        required: true,
        inputType: 'text',
        hasAutocomplete: true,
        autocompleteLocal: true,
        autocompleteConfig: {
          localAutocompletePool: [
          {
            name1: 'Test1',
            name2: 'Pipi1'
          },
          {
            name1: 'Test2',
            name2: 'Pipi2'
          },
          {
            name1: 'Test3',
            name2: 'Pipi3'
          },
          {
            name1: 'Test4',
            name2: 'Pipi4'
          },
        ],
          returnType: ['name1','name2']
        }
      },
    ]
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

  autocompleteBranch(newValue: string, control: FormControlModel) {
    control.autocompleteLocal ? this.getLocalAutoCompleteOptions(newValue, control) : this.getAutoCompleteOptions(newValue, control)
  }


  //Called with each value change for auto complete inputs
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
          option = option.concat(value[param]+', ');
        })
        control.autoCompleteOptions!.push(option.slice(0,option.length-2));
      })
      
    });
    
  }

  //Called with each value change for auto complete inputs with local autocomplete bases
  getLocalAutoCompleteOptions(newValue: string, control: FormControlModel): void {

    if(!newValue || newValue.length<3) {
      control.autoCompleteOptions = [];
      return;
    }

    console.log(control.autocompleteConfig.localAutocompletePool);

    const availableOptions = control.autocompleteConfig.localAutocompletePool.filter(option => {
      console.log(JSON.stringify(option).indexOf(newValue),option,newValue)
      return JSON.stringify(option).toLowerCase().indexOf(newValue.toLowerCase()) !== -1
    });

    if(control.autocompleteConfig?.returnType==='string') {
      control.autoCompleteOptions = availableOptions;
      return;
    }

    availableOptions.forEach((value: any) => {
      let option = '';
      (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
        option = option.concat(value[param]+', ');
      })
      control.autoCompleteOptions!.push(option.slice(0,option.length-2));
    })
    
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
