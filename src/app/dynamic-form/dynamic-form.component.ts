import { createLoweredSymbol } from "@angular/compiler";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { Subscription } from "rxjs";
import { AppService } from "../app.service";
import { FormControlModel } from "./form-control.model";
import { DynamicFormModel } from "./form.model";

@Component({
  selector: "app-dynamic-form",
  templateUrl: "./dynamic-form.component.html",
  styleUrls: ["./dynamic-form.component.scss"]
})
export class DynamicFormComponent implements OnInit, OnDestroy {

  dynamicForm!: FormGroup;
  formJson: DynamicFormModel;
  formControlArray: FormControlModel[] = [];
  transformedControlArray: any = {};
  submittedForm: string = "";
  autoCompleteSubscription!: Subscription;

  dateMask = function(rawValue: string) {
    let days = [/[0-3]/, /\d/,'/'];
    let months = [/[0-1]/, /[1-9]/,'/'];
    let years = [/[1-2]/, /\d/, /\d/, /\d/]
    if(rawValue && rawValue[0]==='3') {
      days = [/[0-3]/,/[0-1]/,'/'];
      months = [/[0-1]/, /[1,3-9]/,'/'];
    }
    if(rawValue && rawValue[3]==='1') months = [/[0-1]/,/[0-2]/,'/'];
    return days.concat(months).concat(years);
  }

  constructor(private serv: AppService) {
    this.getForm();
    this.transformToControls();
    this.initializeForm();
  }

  ngOnInit(): void {
  }

  //Transform each object form initial JSON objects array into a form control
  transformToControls(): void {
    this.formControlArray.forEach((control) => {

      if(control.type==="checkbox") {
        control.checkboxCheckedValues = [];
        control.checkboxOptions?.forEach((checkboxOption) => {
          const result = (control.value as Array<string>).indexOf(checkboxOption) !== -1
          control.checkboxCheckedValues?.push(result);
        });
      }
        if(control.hasOtherField) {
          this.transformedControlArray[control.name + "-internal-other"] = new FormControl({value: "",disabled: true});
          control.checkboxCheckedValues?.push(false);
      }

      this.transformedControlArray[control.name] = new FormControl(control.value,control.required?Validators.required:[]);

      if(control.readOnly) this.transformedControlArray[control.name].disable(); 

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
         this.dynamicForm.get(control.name + "-internal-other")?.enable();
       }
 
      } else {
       control.checkboxCheckedValues![index] = false;
 
       if(index===checkboxLength-1 && control.hasOtherField) {
         this.dynamicForm.get(control.name + "-internal-other")?.disable();
         this.dynamicForm.get(control.name + "-internal-other")?.reset("");
       }
 
      }
 
      if(!control.multipleChoiceCheckbox) {
 
        for(let i=0;i<checkboxLength;i++) {
           if(i!==index) control.checkboxCheckedValues![i] = false;
        }

        if(index!==checkboxLength-1 && control.hasOtherField) {
          this.dynamicForm.get(control.name + "-internal-other")?.disable();
          this.dynamicForm.get(control.name + "-internal-other")?.reset("");
        }
       }

      } 

      for(let i=0;i<control.checkboxOptions!.length;i++) {
        if(control.checkboxCheckedValues![i]===true) currentValue.push(control.checkboxOptions![i])
      }

      if(control.hasOtherField && control.checkboxCheckedValues![checkboxLength-1]) {
        currentValue.push(this.dynamicForm.get(control.name + "-internal-other")?.value);
      }

      this.dynamicForm.get(control.name)?.setValue(currentValue);
      if(currentValue.length===0) {
        this.dynamicForm.get(control.name)?.reset();
      }

      if(control.valueThatEnablesAffectedControls !== undefined) {

        if(currentValue.indexOf(control.valueThatEnablesAffectedControls)!==-1) {
        
          for (const ctl of this.formControlArray) {
              if(control.affectedControlNames.indexOf(ctl.name)!==-1) {
                ctl.shouldShow = true;
                ctl.required = true;
                this.dynamicForm.get(ctl.name).setValidators(Validators.required);
                this.dynamicForm.get(ctl.name).updateValueAndValidity();
              }
          }
    
        } else {

          for (const ctl of this.formControlArray) {
              if(control.affectedControlNames.indexOf(ctl.name)!==-1) {
                ctl.shouldShow = false;
                this.dynamicForm.get(ctl.name).clearValidators();
                if(ctl.type === 'checkbox') ctl.checkboxCheckedValues = ctl.checkboxCheckedValues?.map(() => false);
                this.dynamicForm.get(ctl.name).reset(this.getStartingFieldValue(ctl));

                if( ctl.affectedControlNames !== undefined) {
                  
                  for (const innerCtl of this.formControlArray) {

                    if(ctl.affectedControlNames.indexOf(innerCtl.name)!==-1) {

                      innerCtl.shouldShow = false;
                      this.dynamicForm.get(innerCtl.name).clearValidators();
                      if(innerCtl.type === 'checkbox') innerCtl.checkboxCheckedValues = innerCtl.checkboxCheckedValues?.map(() => false);
                      this.dynamicForm.get(innerCtl.name).reset(this.getStartingFieldValue(innerCtl));
                      
                    }
                   
                  }

                }
              }
          }

        }

      }

      this.dynamicForm.updateValueAndValidity();
      console.log(this.dynamicForm.controls)

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

      if(control.autocompleteConfig?.returnType==="string") {
        control.autoCompleteOptions = response.payload;
        return;
      }

      control.autoCompleteOptions = [];

      response.payload.forEach((value: any) => {
        let option = "";
        (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
          option = option.concat(value[param]+", ");
        })
        control.autoCompleteOptions!.push(option.slice(0,option.length-2));
      })
      
    });
    
  }

  //Called with each value change for auto complete inputs with local autocomplete bases
  getLocalAutoCompleteOptions(newValue: string, control: FormControlModel): void {

    control.autoCompleteOptions = [];


    const availableOptions = control.autocompleteConfig.localAutocompletePool.filter(option => {
      if(!option || !newValue) return false;
      return JSON.stringify(option).toLowerCase().indexOf(newValue.toLowerCase()) !== -1
    });

    if(control.autocompleteConfig?.returnType==="string") {
      control.autoCompleteOptions = availableOptions;
      return;
    }

    availableOptions.forEach((value: any) => {
      let option = "";
      (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
        option = option.concat(value[param]+", ");
      })
      control.autoCompleteOptions!.push(option.slice(0,option.length-2));
    })
    
  }

  onClickAutocomplete(option: string, control: FormControlModel) {
      this.dynamicForm.get(control.name)?.setValue(option);
    }

  submit(): void {
    const data: any = {}

    for (const control in this.dynamicForm.controls) {
      if(control.endsWith("-internal-other")) continue;
      data[control] = this.dynamicForm.controls[control].value;
    }

    this.formJson.controls = this.formControlArray;

    this.submittedForm = JSON.stringify(data);
    const obj = {"officialQuestion1":["Da"],"timePeriodFrom1":[],"timePeriodTo1":[],"officialPosition1":["Predsednik, potpredsenik i član saveta Državne revitorske institucije"],"officialQuestion2":["Da"],"timePeriodFrom2":[],"timePeriodTo2":[],"officialPosition2":["Šef države i/ili vlade, član vlade i njegov zamenik"],"officialQuestion3":["Da"],"timePeriodFrom3":[],"timePeriodTo3":[],"officialPosition3":["Direktor u međunarodnoj organizaciji"],"officialQuestion4":["Da"],"officialFullName4":"","officialPosition4":"","timePeriodFrom4":[],"timePeriodTo4":[],"officialQuestion5":["Da"],"officialFullName5":"","officialPosition5":"","timePeriodFrom5":[],"timePeriodTo5":[],"officialQuestion6":["Da"],"officialFullName6":[],"officialPosition6":"","timePeriodFrom6":[],"timePeriodTo6":[],"familyRelation":["Bračni ili vanbračni partner"]}
    console.log(this.schemaValidator(this.formJson,obj));
  }

  schemaValidator(schema: any, object: any) {

    const objectCopy = {...object};

    if (Object.keys(objectCopy).length !== schema.controls.length) return false;

    for (let control of schema.controls) {

      if(!(control.name in objectCopy)) return false;

      switch(control.type) {

        case "checkbox": {

          if(!(control.value instanceof Array)) return false;

          if(!control.multipleChoiceCheckbox && control.value.length>1) return false;

          if(!control.hasOtherField) {

            for (let element of objectCopy[control.name]) {
              if( control.checkboxOptions.indexOf(element) === -1) return false;
            }

          }

          break;
        }

        case "input":
        case "textarea":
          if(!(typeof control.value  === 'string')) return false;
          break;
        case "multiple-select":
          if(!(control.value instanceof Array)) return false;
          break;
        case "select":
          if(!(typeof control.value  === 'string')) return false;
          break;
      }

    }

    return true;

  }

  getStartingFieldValue(ctl: FormControlModel) {

    if(ctl.type === 'checkbox' || ctl.type === 'multiple-select') return [];
    return "";

  }

  ngOnDestroy(): void {
    this.autoCompleteSubscription?.unsubscribe();
  }

   //Currently hardcoded
   getForm(): void {

    this.formJson = {
      title: "Direktni marketing",
      text: `Dajem saglasnost da AIK BANKA moje podatke o ličnosti prikupljene u ovom postupku i u skladu sa važećim propisima RS 
      dalje obrađuje u svrhu reklamiranja proizvoda AIK Banke obaveštavanjem na brojeve telefona navedene u ovom zahtevu, 
      adresu stanovanja  i adresu  elektronske pošte`,
      controls: []
    }

    this.formControlArray = this.formJson?.controls;

    this.getPepForm();
   
  }

  getForm1(): void {
    this.formControlArray = [
      {
        name: "street",
        label:"Street",
        value:"",
        type:"input",
        required: true,
        inputType: "text",
        hasAutocomplete: true,
        readOnly: true,
        autocompleteConfig: {
          url: "https://onboarding-api-local-dev.blinking.services/getStreets/?key=",
          returnType: ["name","cityName","regionName","placeName"]
        }
      },
      {
        name: "lastName",
        label:"Last Name",
        value:"Radovanovic",
        type:"input",
        required: true,
        readOnly: true,
        inputType: "text"
      },
      {
        name: "terms",
        label:"Gender",
        value: "Male",
        type:"select",
        required: true,
        readOnly: true,
        selectOptions: ["Male","Female","Neutral"]
      },
      {
        name: "hobbies",
        label:"Hobbies",
        value: ["Gaming","Mountaineering"],
        type:"multiple-select",
        required: true,
        readOnly: true,
        selectOptions: ["Cooking","Fishing","Gaming","Mountaineering","Running"]
      },
      {
        name: "comment",
        label:"Comment",
        value: "Commenttttttt",
        type:"textarea",
        required: true,
        readOnly: true,
        rows: 4
      },
      {
        name: "checkbox",
        label:"Checkbox",
        value: [],
        type: "checkbox",
        required: true,
        checkboxOptions: ["Option1","Option2","Option3","Option4","Option5"],
        multipleChoiceCheckbox: false,
        hasOtherField: true
      }
    ];
  }

  getPepForm(): void {
    this.formControlArray = [
      {
        label: "Da li ste politički eksponirani (obavljate određene javne funkcije) u prethodne 4 godine?",
        name: "mainQuestion",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["officialQuestion1","officialQuestion2","officialQuestion3","officialQuestion4","officialQuestion5","officialQuestion6"],
        valueThatEnablesAffectedControls: "Da",
      },
      {
        label: "Da li ste funkcioner Republike Srbije?",
        name: "officialQuestion1",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["timePeriodFrom1","timePeriodTo1","officialPosition1"],
        valueThatEnablesAffectedControls: "Da",
        shouldShow: false
      },
      {
        label: "Period obavljanja (Početni datum)",
        name: "timePeriodFrom1",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Period obavljanja (Krajnji datum)",
        name: "timePeriodTo1",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,        
        shouldShow: false
      },
      {
        label: "Koju od navedenih funkcija obavljate?",
        name: "officialPosition1",
        required: false,
        value: [],
        type: "checkbox",
        checkboxOptions: 
        [
        "Predsednik države, predsednik Vlade, ministar, državni sekretar, posebni savetnik ministra, pomoćnik ministra, sekretar ministarstva, direktor organa u sastavu ministarstva i njegovi pomoćnici, i direktor posebne organizacije, kao i njegov zamenik i njegovi pomoćnici",
        "Narodni poslanik",
        "Sudija Vrhovnog kasacionog, Privrednog apelacionog i Ustavnog suda",
        "Predsednik, potpredsenik i član saveta Državne revitorske institucije",
        "Guverner, viceguverner, član izvršnog odbora i član Saveta guvernera Narodne banke Srbije",
        "Lice na visokom položaju u diplomatsko - konzularnom predstavništvu (ambasador, generalni konzul, otpravnik poslova)",
        "Član organa upravljanja u javnom preduzeću ili privrednom društvu u većinskom vlasništvu države",
        "Član organa upravljanja političke stranke"
        ],
        shouldShow: false
      },
      {
        label: "Da li ste funkcioner druge države?",
        name: "officialQuestion2",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["timePeriodFrom2","timePeriodTo2","officialPosition2"],
        valueThatEnablesAffectedControls: "Da",
        shouldShow: false
      },
      {
        label: "Period obavljanja (Početni datum)",
        name: "timePeriodFrom2",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Period obavljanja (Krajnji datum)",
        name: "timePeriodTo2",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Koju od navedenih funkcija obavljate?",
        name: "officialPosition2",
        required: false,
        value: [],
        type: "checkbox",
        shouldShow: false,
        checkboxOptions: 
        [
        "Šef države i/ili vlade, član vlade i njegov zamenik",
        "Izabrani predstavnik zakonodavnog tela",
        "Sudija vrhovnog i ustavnog suda ili drugog sudskog organa na visokom nivou, protiv čije presude, osim u izuzetnim slučajevima, nije moguće koristiti redovni ili vanredni pravni lek",
        "Član računskog suda, odnosno vrhovne revizorske institucije i članovi organa upravljanja centralne banke",
        "Ambasador, otpravnik poslova i visoki oficir oružanih snaga",
        "Član upravnog i nadzornog organa pravnog lica koje je u većinskom vlasništvu strane države",
        "Član organa upravljanja političke stranke"
        ]
      },
      {
        label: "Da li ste funkcioner međunarodne organizacije?",
        name: "officialQuestion3",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["timePeriodFrom3","timePeriodTo3","officialPosition3"],
        valueThatEnablesAffectedControls: "Da",
        shouldShow: false
      },
      {
        label: "Period obavljanja (Početni datum)",
        name: "timePeriodFrom3",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Period obavljanja (Krajnji datum)",
        name: "timePeriodTo3",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Koju od navedenih funkcija obavljate?",
        name: "officialPosition3",
        required: false,
        value: [],
        type: "checkbox",
        checkboxOptions: 
        [
        "Direktor u međunarodnoj organizaciji",
        "Zamenik direktora u međunarodnoj organizaciji",
        "Član organa upravljanja u međunarodnoj organizaciji",
        ],
        shouldShow: false
      },
      {
        label: "Da li ste član uže porodice funkcionera Republike Srbije i/ili bliži saradnik funkcionera?",
        name: "officialQuestion4",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["timePeriodFrom4","timePeriodTo4","officialPosition4","officialFullName4"],
        valueThatEnablesAffectedControls: "Da",
        shouldShow: false
      },
      {
        label: "Ime i prezime funkcionera",
        name: "officialFullName4",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        shouldShow: false
      },
      {
        label: "Funkcija koju obavlja:",
        name: "officialPosition4",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        shouldShow: false
      },
      {
        label: "Period obavljanja (Početni datum)",
        name: "timePeriodFrom4",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Period obavljanja (Krajnji datum)",
        name: "timePeriodTo4",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Da li ste član uže porodice funkcionera druge države i/ili bliži saradnik funkcionera?",
        name: "officialQuestion5",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["timePeriodFrom5","timePeriodTo5","officialPosition5","officialFullName5"],
        valueThatEnablesAffectedControls: "Da",
        shouldShow: false
      },
      {
        label: "Ime i prezime funkcionera",
        name: "officialFullName5",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        shouldShow: false
      },
      {
        label: "Funkcija koju obavlja:",
        name: "officialPosition5",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        shouldShow: false
      },
      {
        label: "Period obavljanja (Početni datum)",
        name: "timePeriodFrom5",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Period obavljanja (Krajnji datum)",
        name: "timePeriodTo5",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Da li ste član uže porodice funkcionera međunarodne organizacije i/ili bliži saradnik funkcionera?",
        name: "officialQuestion6",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Da","Ne"],
        affectedControlNames: ["timePeriodFrom6","timePeriodTo6","officialPosition6","officialFullName6","familyRelation"],
        valueThatEnablesAffectedControls: "Da",
        shouldShow: false
      },
      {
        label: "Ime i prezime funkcionera",
        name: "officialFullName6",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        shouldShow: false
      },
      {
        label: "Funkcija koju obavlja:",
        name: "officialPosition6",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        shouldShow: false
      },
      {
        label: "Period obavljanja (Početni datum)",
        name: "timePeriodFrom6",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Period obavljanja (Krajnji datum)",
        name: "timePeriodTo6",
        required: false,
        value: "",
        type: "input",
        inputType: "text",
        isDateInput: true,
        shouldShow: false
      },
      {
        label: "Povezanost sa funkcionerom",
        name: "familyRelation",
        required: false,
        value: [],
        type: "checkbox",
        checkboxOptions: ["Bračni ili vanbračni partner","Roditelj","Brat / sestra","Dete, usvojeno dete, pastorče",
        "Bračni ili vanbračni partner, usvojenog deteta, ili pastorčeta", 
        "Ostvarujem zajedničku dobit iz imovine ili uspostavljenog poslovnog odnosa", "Imam bilo koje druge bliske poslovne odnose"],
        hasOtherField: true,
        otherFieldLabel: "Drugo: ",
        shouldShow: false
      },
  ];
  }

  getForm3() {

    this.formControlArray = [
      {
        name: "checkbox",
        label:"",
        value:["Saglasan sam"],
        type:"checkbox",
        required: true,
        checkboxOptions: ["Saglasan sam", "Nisam saglasan"],
        multipleChoiceCheckbox: false
      },
    ];
  }
}
