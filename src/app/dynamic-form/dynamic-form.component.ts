import { createLoweredSymbol } from "@angular/compiler";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { EMPTY, empty, Observable, of, Subscription } from "rxjs";
import { catchError, distinctUntilChanged, filter, startWith, switchMap, tap } from "rxjs/operators"
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
  autoCompleteSubscription!: Observable<any[]>;

  // Date mask
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
    this.getForm1();
    this.transformToControls();
    this.initializeForm();
    this.registerValueChangeSubscription();
  }

  ngOnInit(): void {
  }

  // Transform each object form initial JSON objects array into a form control
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

      this.transformedControlArray[control.name] = new FormControl(control.value,control.required ? Validators.required: []);

      if(control.readOnly) this.transformedControlArray[control.name].disable(); 

    });
  }

  initializeForm(): void {
    this.dynamicForm = new FormGroup(this.transformedControlArray);
  }

  // Called with each checkbox (un)checking, changes the overall value of the checkboxes form control
  setCheckboxValue(event: any, control: FormControlModel, index: number): void {

    const checkboxLength = control.checkboxCheckedValues!.length;
    const currentValue: string[] =[];

    // Actions exclusive to checkbox change events
    if(event instanceof MatCheckboxChange) {
 
      if(!control.checkboxCheckedValues![index]) {
        control.checkboxCheckedValues![index] = true;
 
        if(control.hasOtherField && index===checkboxLength-1) {
         this.dynamicForm.get(control.name + "-internal-other")?.enable();
         this.dynamicForm.get(control.name + "-internal-other")?.setValidators([Validators.required]);
         this.dynamicForm.get(control.name + "-internal-other")?.updateValueAndValidity();
       }
 
      } else {
       control.checkboxCheckedValues![index] = false;
 
       if(index===checkboxLength-1 && control.hasOtherField) {
         this.dynamicForm.get(control.name + "-internal-other")?.disable();
         this.dynamicForm.get(control.name + "-internal-other")?.clearValidators();
         this.dynamicForm.get(control.name + "-internal-other")?.updateValueAndValidity();
         this.dynamicForm.get(control.name + "-internal-other")?.reset("");
       }
 
      }
 
      if(!control.multipleChoiceCheckbox) {
 
        for(let i=0;i<checkboxLength;i++) {
           if(i!==index) control.checkboxCheckedValues![i] = false;
        }

        if(index!==checkboxLength-1 && control.hasOtherField) {
          this.dynamicForm.get(control.name + "-internal-other")?.disable();
          this.dynamicForm.get(control.name + "-internal-other")?.clearValidators();
          this.dynamicForm.get(control.name + "-internal-other")?.updateValueAndValidity();
          this.dynamicForm.get(control.name + "-internal-other")?.reset("");
        }
       }

      } 

      // Adds the currently checked checkboxes to the hidden select field that acts as a form control
      for(let i=0;i<control.checkboxOptions!.length;i++) {
        if(control.checkboxCheckedValues![i]===true) currentValue.push(control.checkboxOptions![i])
      }

      // Adds the current value of the internal other field to the hidden select field that acts as a form control
      if(control.hasOtherField && control.checkboxCheckedValues![checkboxLength-1]) {
        currentValue.push(this.dynamicForm.get(control.name + "-internal-other")?.value);
      }

      this.dynamicForm.get(control.name)?.setValue(currentValue);
      if(currentValue.length===0) {
        this.dynamicForm.get(control.name)?.reset();
      }

      // Only for form controls that affect the visiblity of other form controls
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
  }

  // A method to determine the type of autocomplete
  autocompleteBranch(newValue: string, control: FormControlModel) {
    this.dynamicForm.get(control.name).setValidators(this.autocompleteValidator);
    this.dynamicForm.get(control.name).updateValueAndValidity();
    control.autocompleteLocal ? this.getLocalAutoCompleteOptions(newValue, control) : this.getAutoCompleteOptions(newValue, control);
  }

  registerValueChangeSubscription() {

    this.formControlArray.forEach(control => {

      if(control.hasAutocomplete && !control.autocompleteLocal) {

        control.autoCompleteOptions = this.dynamicForm.get(control.name).valueChanges.pipe(
          distinctUntilChanged(),
          filter(value => value && value.length >= 3),
          switchMap((value: string) => this.serv.getAutocompleteSource(control.autocompleteConfig.url, value).pipe(
            catchError(_ => {
              return EMPTY;
            }),
          )),
          tap(payload => {
            console.log(payload);
            if(control.autocompleteConfig?.returnType==="string") {
              console.log('here');
              return payload;
            }
    
            const tempArray = [];
    
            payload.forEach((value: any) => {
              let option = "";
              (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
                option = option.concat(value[param]+", ");
              })
              tempArray.push(option.slice(0,option.length-2));
            })
    
            return of(tempArray);
    
          })
        )
      }



    })


  }

  // Called with each value change for auto complete inputs
  getAutoCompleteOptions(newValue: string, control: FormControlModel): void {

    // Disables auto complete if the input field character count is below 3
    // if(!newValue || newValue.length<3) {
    //   control.autoCompleteOptions = of([]);
    //   return;
    // } 

    // If the input field length is above 3, sets all the necessary auto complete options


    // this.autoCompleteSubscription = this.serv.getAutocompleteSource(control.autocompleteConfig!.url,newValue).subscribe((response: any) => {

    //   if(control.autocompleteConfig?.returnType==="string") {
    //     control.autoCompleteOptions = response.payload;
    //     return;
    //   }

    //   control.autoCompleteOptions = [];

    //   response.payload.forEach((value: any) => {
    //     let option = "";
    //     (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
    //       option = option.concat(value[param]+", ");
    //     })
    //     control.autoCompleteOptions!.push(option.slice(0,option.length-2));
    //   })
      
    // });
    
  }

  // Called with each value change for auto complete inputs with local autocomplete bases
  getLocalAutoCompleteOptions(newValue: string, control: FormControlModel): void {

    control.autoCompleteOptions = [];

    const availableOptions = control.autocompleteConfig.localAutocompletePool.filter(value => {
      if(!value || !newValue) return false;
      let option = "";
      (control.autocompleteConfig?.returnType as any[]).forEach((param) => {
        option = option.concat(value[param]+", ");
      });
      
      return option.toLowerCase().indexOf(newValue.toLowerCase()) !== -1
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
      this.dynamicForm.get(control.name)?.clearValidators();
      this.dynamicForm.get(control.name)?.updateValueAndValidity();
    }

  // Submits the form, if it's valid
  submit(): void {

    if(!this.dynamicForm.valid) return;

    const data: any = {}

    // Excludes the value of hidden internal form controls
    for (const control in this.dynamicForm.controls) {
      if(control.endsWith("-internal-other")) continue;
      data[control] = this.dynamicForm.controls[control].value;
    }

    this.formJson.controls = this.formControlArray;

    this.submittedForm = JSON.stringify(data);
    const obj = {"officialQuestion1":["Da"],"timePeriodFrom1":[],"timePeriodTo1":[],"officialPosition1":["Predsednik, potpredsenik i član saveta Državne revitorske institucije"],"officialQuestion2":["Da"],"timePeriodFrom2":[],"timePeriodTo2":[],"officialPosition2":["Šef države i/ili vlade, član vlade i njegov zamenik"],"officialQuestion3":["Da"],"timePeriodFrom3":[],"timePeriodTo3":[],"officialPosition3":["Direktor u međunarodnoj organizaciji"],"officialQuestion4":["Da"],"officialFullName4":"","officialPosition4":"","timePeriodFrom4":[],"timePeriodTo4":[],"officialQuestion5":["Da"],"officialFullName5":"","officialPosition5":"","timePeriodFrom5":[],"timePeriodTo5":[],"officialQuestion6":["Da"],"officialFullName6":[],"officialPosition6":"","timePeriodFrom6":[],"timePeriodTo6":[],"familyRelation":["Bračni ili vanbračni partner"]}
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
  }

  autocompleteValidator() {
    return {error: {error: true}};
  }

/*#############################################
The methods below are for testing purposes only
#############################################*/

   getForm(): void {

    this.formJson = {
      title: "Obaveze za refinansiranje",
      text: `Molimo Vas da unesete dugovanja za navedene obaveze`,
      controls: []
    }

    this.formControlArray = this.formJson?.controls;

    this.getRefinanceForm();
   
  }

  getForm1(): void {
    this.formControlArray = [
      {
        name: "street",
        label:"Street",
        value:"",
        type:"input",
        required: true,
        placeholder: "Alo breeee",
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
        isDateInput: true,
        placeholder: "__/__/____",
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
      },
      {
        "label": "Organizaciona jedinica",
        "name":"organizationalUnit",
        "value":"",
        "type":"input",
        "required": true,
        "inputType": "text",
        "hasAutocomplete": true,
        "autocompleteLocal": true,
        placeholder: "alooo",
        autocompleteHintMessage: "Molimo vas breeeeeeeeeee",
        "autocompleteConfig": {
          "returnType": ["naziv"],
          "localAutocompletePool": [
            {
              "naziv": "Filijala Beograd-Grawe",
              "adresa": "Bul. Mihajla Pupina 115đ",
              "mesto": "Novi Beograd",
              "mail": "Filijala_Grawe@aikbanka.rs",
              "cbsid": 510
            },
            {
              "naziv": "Filijala Fontana",
              "adresa": "Otona Župančića 1",
              "mesto": "Novi Beograd",
              "mail": "Filijala_Fontana@aikbanka.rs",
              "cbsid": 505
            },
            {
              "naziv": "Filijala Vidikovac",
              "adresa": "Patrijarha Joanikija 28b",
              "mesto": "Beograd",
              "mail": "Filijala_Vidikovac@aikbanka.rs",
              "cbsid": 525
            },
            {
              "naziv": "Filijala Vojvode Stepe",
              "adresa": "Vojvode Stepe 171",
              "mesto": "Beograd",
              "mail": "Filijala_Vojvode_Stepe@aikbanka.rs",
              "cbsid": 535
            },
            {
              "naziv": "Filijala Zemun",
              "adresa": "Glavna 7",
              "mesto": "Zemun",
              "mail": "Filijala_Zemun@aikbanka.rs",
              "cbsid": 545
            },
            {
              "naziv": "Filijala Jurija Gagarina",
              "adresa": "Jurija Gagarina 32",
              "mesto": "Novi Beograd",
              "mail": "Filijala_Jurija_Gagarina@aikbanka.rs",
              "cbsid": 550
            },
            {
              "naziv": "Filijala Banovo Brdo",
              "adresa": "Požeška 76",
              "mesto": "Beograd",
              "mail": "Filijala_Banovo_Brdo@aikbanka.rs",
              "cbsid": 555
            },
            {
              "naziv": "Filijala Kralja Milana Beograd",
              "adresa": "Kralja Milana 11",
              "mesto": "Beograd",
              "mail": "Filijala_Kralja_Milana@aikbanka.rs",
              "cbsid": 533
            },
            {
              "naziv": "Filijala Bulevar Kralja Aleksandra",
              "adresa": "Bul. Kralja Aleksandra 334",
              "mesto": "Beograd",
              "mail": "Filijala_Bul_KA@aikbanka.rs",
              "cbsid": 501
            },
            {
              "naziv": "Filijala Makedonska",
              "adresa": "Makedonska 19",
              "mesto": "Beograd",
              "mail": "Filijala_Makedonska@aikbanka.rs",
              "cbsid": 515
            },
            {
              "naziv": "Filijala Slavija",
              "adresa": "Kralja Milana 43",
              "mesto": "Beograd",
              "mail": "Filijala_Slavija@aikbanka.rs",
              "cbsid": 530
            },
            {
              "naziv": "Filijala Stari Grad",
              "adresa": "Cara Dušana 84-86",
              "mesto": "Beograd",
              "mail": "Filijala_Stari_Grad@aikbanka.rs",
              "cbsid": 584
            },
            {
              "naziv": "Filijala Lazarevac",
              "adresa": "Karađorđeva 29",
              "mesto": "Lazaravac",
              "mail": "Filijala_Lazarevac@aikbanka.rs",
              "cbsid": 585
            },
            {
              "naziv": "Filijala Obrenovac",
              "adresa": "Aleksandra Ace Simovića 2",
              "mesto": "Obrenovac",
              "mail": "Filijala_Obrenovac@aikbanka.rs",
              "cbsid": 575
            },
            {
              "naziv": "Filijala Pančevo",
              "adresa": "Karađorđeva 2b",
              "mesto": "Pančevo",
              "mail": "Filijala_Pancevo@aikbanka.rs",
              "cbsid": 560
            },
            {
              "naziv": "Filijala Pozarevac",
              "adresa": "Trg Radomira Vujovića br 12",
              "mesto": "Požarevac",
              "mail": "Filijala_Pozarevac@aikbanka.rs",
              "cbsid": 520
            },
            {
              "naziv": "Filijala Smederevo",
              "adresa": "Kralja Petra Prvog 11",
              "mesto": "Smederevo",
              "mail": "Filijala_Smederevo@aikbanka.rs",
              "cbsid": 590
            },
            {
              "naziv": "Filijala Šabac",
              "adresa": "V. Jovanovića 22",
              "mesto": "Šabac",
              "mail": "Filijala_Sabac@aikbanka.rs",
              "cbsid": 570
            },
            {
              "naziv": "Filijala Valjevo",
              "adresa": "Vojvode Mišića 22",
              "mesto": "Valjevo",
              "mail": "Filijala_Valjevo@aikbanka.rs",
              "cbsid": 580
            },
            {
              "naziv": "Filijala Niš",
              "adresa": "Nikole Pašića 42",
              "mesto": "Niš",
              "mail": "Filijala_Nis@aikbanka.rs",
              "cbsid": 20
            },
            {
              "naziv": "Filijala Pirot",
              "adresa": "Slavonska 1",
              "mesto": "Pirot",
              "mail": "Filijala_Pirot@aikbanka.rs",
              "cbsid": 30
            },
            {
              "naziv": "Filijala Bul. Dr Zorana Đinđića",
              "adresa": "Bul. dr Zorana Đinđića 23",
              "mesto": "Niš",
              "mail": "Filijala_Bul_ZDjindjica@aikbanka.rs",
              "cbsid": 225
            },
            {
              "naziv": "Filijala Voždovac",
              "adresa": "Voždova 2",
              "mesto": "Niš",
              "mail": "Filijala_Vozdova@aikbanka.rs",
              "cbsid": 220
            },
            {
              "naziv": "Filijala Zona III",
              "adresa": "Bul. Nemanjića 25",
              "mesto": "Niš",
              "mail": "Filijala_Zona3@aikbanka.rs",
              "cbsid": 230
            },
            {
              "naziv": "Filijala Prokuplje",
              "adresa": "Topličkih junaka 1",
              "mesto": "Prokuplje",
              "mail": "Filijala_Prokuplje@aikbanka.rs",
              "cbsid": 265
            },
            {
              "naziv": "Filijala Kruševac",
              "adresa": "Vidovdanska 9-11",
              "mesto": "Kruševac",
              "mail": "Filijala_Krusevac@aikbanka.rs",
              "cbsid": 70
            },
            {
              "naziv": "Filijala Vrnjačka Banja",
              "adresa": "Kraljevačka 6, Drvara I",
              "mesto": "Vrnjačka banja",
              "mail": "Filijala_Vrnjacka_banja@aikbanka.rs",
              "cbsid": 710
            },
            {
              "naziv": "Filijala Leskovac",
              "adresa": "Bul. Oslobođenja bb",
              "mesto": "Leskovac",
              "mail": "Filijala_Leskovac@aikbanka.rs",
              "cbsid": 260
            },
            {
              "naziv": "Filijala Vranje",
              "adresa": "Kralja Stefana Prvovenčanog 169",
              "mesto": "Vrane",
              "mail": "Filijala_Vranje@aikbanka.rs",
              "cbsid": 240
            },
            {
              "naziv": "Filijala Jagodina",
              "adresa": "Knjeginje Milice 73",
              "mesto": "Jagodina",
              "mail": "Filijala_Jagodina@aikbanka.rs",
              "cbsid": 290
            },
            {
              "naziv": "Filijala Paraćin",
              "adresa": "Kralja Petra I 30",
              "mesto": "Paraćin",
              "mail": "Filijala_Paracin@aikbanka.rs",
              "cbsid": 250
            },
            {
              "naziv": "Filijala Zaječar",
              "adresa": "Pana Đukića bb",
              "mesto": "Zaječar",
              "mail": "Filijala_Zajecar@aikbanka.rs",
              "cbsid": 750
            },
            {
              "naziv": "Filijala Bor",
              "adresa": "Đorđa Vajferta 21",
              "mesto": "Bor",
              "mail": "Filijala_Bor@aikbanka.rs",
              "cbsid": 740
            },
            {
              "naziv": "Filijala Negotin",
              "adresa": "JNA 2",
              "mesto": "Negotin",
              "mail": "Filijala_Negotin@aikbanka.rs",
              "cbsid": 760
            },
            {
              "naziv": "Filijala Kragujevac",
              "adresa": "Trg Radomira Putnika 3",
              "mesto": "Kragujevac",
              "mail": "Filijala_Kragujevac@aikbanka.rs",
              "cbsid": 40
            },
            {
              "naziv": "Filijala Čačak",
              "adresa": "Kuželjeva 2",
              "mesto": "Čačak",
              "mail": "Filijala_Cacak@aikbanka.rs",
              "cbsid": 350
            },
            {
              "naziv": "Filijala Gornji Milanovac",
              "adresa": "Kneza Aleksandra 13",
              "mesto": "Gornji Milanovac",
              "mail": "Filijala_GMilanovac@aikbanka.rs",
              "cbsid": 330
            },
            {
              "naziv": "Filijala Užice",
              "adresa": "Dimitrija Tucovića 44",
              "mesto": "Užice",
              "mail": "Filijala_Uzice@aikbanka.rs",
              "cbsid": 370
            },
            {
              "naziv": "Filijala Prijepolje",
              "adresa": "Sandžačkih brigada 19",
              "mesto": "Prijepolje",
              "mail": "Filijala_Prijepolje@aikbanka.rs",
              "cbsid": 380
            },
            {
              "naziv": "Filijala Novi Pazar",
              "adresa": "Stevana Nemanje bb",
              "mesto": "Novi Pazar",
              "mail": "Filijala_Novi_Pazar@aikbanka.rs",
              "cbsid": 420
            },
            {
              "naziv": "Filijala Kraljevo",
              "adresa": "Miloša Velikog 58",
              "mesto": "Kraljevo",
              "mail": "Filijala_Kraljevo@aikbanka.rs",
              "cbsid": 440
            },
            {
              "naziv": "Filijala Novi Sad 1",
              "adresa": "Bul. Mihajla Pupina 2",
              "mesto": "Novi Sad",
              "mail": "Filijala_Novi_Sad@aikbanka.rs",
              "cbsid": 815
            },
            {
              "naziv": "Filijala Novi Sad 2",
              "adresa": "Bul. Oslobođenja 68b",
              "mesto": "Novi Sad",
              "mail": "Filijala_Bul_Oslobodjenja@aikbanka.rs",
              "cbsid": 80
            },
            {
              "naziv": "Filijala Ruma",
              "adresa": "Glavna 192",
              "mesto": "Ruma",
              "mail": "Filijala_Ruma@aikbanka.rs",
              "cbsid": 820
            },
            {
              "naziv": "Filijala Inđija",
              "adresa": "Novosadska 2",
              "mesto": "Inđija",
              "mail": "Filijala_Indjija@aikbanka.rs",
              "cbsid": 860
            },
            {
              "naziv": "Filijala Subotica",
              "adresa": "Korzo 8",
              "mesto": "Subotica",
              "mail": "Filijala_Subotica@aikbanka.rs",
              "cbsid": 90
            },
            {
              "naziv": "Filijala Vrbas",
              "adresa": "Maršala Tita 80",
              "mesto": "Vrbas",
              "mail": "Filijala_Vrbas@aikbanka.rs",
              "cbsid": 830
            },
            {
              "naziv": "Filijala Zrenjanin",
              "adresa": "Žitni trg bb",
              "mesto": "Zrenjanin",
              "mail": "Filijala_Zrenjanin@aikbanka.rs",
              "cbsid": 60
            },
            {
              "naziv": "Filijala Kikinda",
              "adresa": "Trg Srpskih dobrovoljaca 6",
              "mesto": "Kikinda",
              "mail": "Filijala_Kikinda@aikbanka.rs",
              "cbsid": 670
            },
            {
              "naziv": "Filijala Sombor",
              "adresa": "Pariska 1",
              "mesto": "Sombor",
              "mail": "Filijala_Sombor@aikbanka.rs",
              "cbsid": 850
            }
          ]
        }
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

  getRefinanceForm() {

    this.formControlArray = [
      {
        name: "creditCard",
        label:"Kreditna kartica",
        value: "",
        type:"input",
        inputType: "text",
        required: true,
      },
      {
        name: "cashCredit",
        label:"Gotovinski kredit",
        value: "",
        type:"input",
        inputType: "text",
        required: true,
      },
      {
        name: "housingCredit",
        label:"Stambeni kredit",
        value: "",
        type:"input",
        inputType: "text",
        required: true,
      },
    ];

  }

  getEmployersForm() {
    this.formControlArray = [
      {
        "label": "Status zaposlenja",
        "name": "employmentStatus",
        "required": true,
        "value": [],
        "type": "checkbox",
        "checkboxOptions": ["Zaposlen na neodređeno","Nezaposlen","Penzioner","Vlasnik radnje - preduzetnik","Zaposlen na određeno"],
        "multipleChoiceCheckbox" : false
      },
      {
        "label": "Prosek mesečnih primanja (RSD)",
        "name": "averageMonthlyIncome",
        "required": true,
        "value": "",
        "type": "input",
        "inputType": "number"
      },
      {
        "label": "Poslodavac",
        "name": "employer",
        "required": true,
        "value": "",
        "type": "input",
        "hasAutocomplete": true,
        "autocompleteConfig": {
          "url": "http://localhost:8080/internal/getEmployers/?key=",
          "returnType": ["name"]
        }
      }
    ]
  }

}
