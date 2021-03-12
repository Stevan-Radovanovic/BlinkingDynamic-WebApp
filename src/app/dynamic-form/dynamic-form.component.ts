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

    this.getForm2();
   
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
        required: false,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Zaposlen na neodređeno','Nezaposlen','Penzioner','Vlasnik radnje - preduzetnik','Zaposlen na određeno'],
        multipleChoiceCheckbox: false,
      },
    
      {
        label: "Svrha i namena poslovnog odnosa / otvaranja računa",
        name: "accountOpeningPurpose",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Radi prijema zarade','Za potrebe isplate kupoprodajne cene po ugovoru o prometu nepokretnosti i pokretnih stvari',
        'Za prijem priliva i naknada po osnovu povremenih i privremenih poslova','Za prijem priliva iz inostranstva',
        'Za potrebe polaganja depozita kod Banke','Ostalo'],
        multipleChoiceCheckbox: false
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
        label: "Obim očekivane aktivnosti preko računa – očekivano kretanje sredstava na računu",
        name: "volumeOfExpectedActivities",
        required: true,
        value: [],
        type: "checkbox",
        checkboxOptions: ['Do 100.000 RSD','Do 500.000 RSD','Do 1.000.000 RSD'],
        multipleChoiceCheckbox: false,
        hasOtherField: true // ?
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
  
      {
        label: "Mesečni prosek primanja",
        name: "monthlyEarnings",
        required: true,
        value: "",
        type: "input",
        inputType: "number",
      },
  
      {
        label: 'Organizaciona jedinica',
        name:'organizationalUnit',
        value:'',
        type:'input',
        required: true,
        inputType: 'text',
        hasAutocomplete: true,
        autocompleteLocal: true,
        autocompleteConfig: {
          returnType: ['naziv','adresa','mesto'],
          localAutocompletePool: [
              {
                naziv: "Filijala Beograd-Grawe",
                adresa: "Bul.  Mihajla Pupina 115đ",
                mesto: "Novi Beograd",
                mail: "Filijala_Grawe@aikbanka.rs"
              },
              {
                naziv: "Filijala  Fontana",
                adresa: "Otona Župančića 1",
                mesto: "Novi Beograd",
                mail: "Filijala_Fontana@aikbanka.rs"
              },
              {
                naziv: "Filijala Vidikovac",
                adresa: "Patrijarha Joanikija 28b",
                mesto: "Beograd",
                mail: "Filijala_Vidikovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Vojvode Stepe",
                adresa: "Vojvode Stepe 171",
                mesto: "Beograd",
                mail: "Filijala_Vojvode_Stepe@aikbanka.rs"
              },
              {
                naziv: "Filijala  Zemun",
                adresa: "Glavna 7",
                mesto: "Zemun",
                mail: "Filijala_Zemun@aikbanka.rs"
              },
              {
                naziv: "Filijala Jurija Gagarina",
                adresa: "Jurija Gagarina 32",
                mesto: "Novi Beograd",
                mail: "Filijala_Jurija_Gagarina@aikbanka.rs"
              },
              {
                naziv: "Filijala Banovo Brdo",
                adresa: "Požeška 76",
                mesto: "Beograd",
                mail: "Filijala_Banovo_Brdo@aikbanka.rs"
              },
              {
                naziv: "Filijala Kralja Milana Beograd",
                adresa: "Kralja Milana 11",
                mesto: "Beograd",
                mail: "Filijala_Kralja_Milana@aikbanka.rs"
              },
              {
                naziv: "Filijala Bulevar Kralja Aleksandra",
                adresa: "Bul.  Kralja Aleksandra 334",
                mesto: "Beograd",
                mail: "Filijala_Bul_KA@aikbanka.rs"
              },
              {
                naziv: "Filijala  Makedonska",
                adresa: "Makedonska 19",
                mesto: "Beograd",
                mail: "Filijala_Makedonska@aikbanka.rs"
              },
              {
                naziv: "Filijala Slavija",
                adresa: "Kralja Milana 43",
                mesto: "Beograd",
                mail: "Filijala_Slavija@aikbanka.rs"
              },
              {
                naziv: "Filijala Stari Grad",
                adresa: "Cara Dušana 84-86",
                mesto: "Beograd",
                mail: "Filijala_Stari_Grad@aikbanka.rs"
              },
              {
                naziv: "Filijala Lazarevac",
                adresa: "Karađorđeva 29",
                mesto: "Lazaravac",
                mail: "Filijala_Lazarevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Obrenovac",
                adresa: "Aleksandra Ace Simovića 2",
                mesto: "Obrenovac",
                mail: "Filijala_Obrenovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Pančevo",
                adresa: "Karađorđeva 2b",
                mesto: "Pančevo",
                mail: "Filijala_Pancevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Pozarevac",
                adresa: "Trg Radomira Vujovića br 12",
                mesto: "Požarevac",
                mail: "Filijala_Pozarevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Smederevo",
                adresa: "Kralja Petra Prvog 11",
                mesto: "Smederevo",
                mail: "Filijala_Smederevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Šabac",
                adresa: "V. Jovanovića 22",
                mesto: "Šabac",
                mail: "Filijala_Sabac@aikbanka.rs"
              },
              {
                naziv: "Filijala Valjevo",
                adresa: "Vojvode Mišića 22",
                mesto: "Valjevo",
                mail: "Filijala_Valjevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Niš",
                adresa: "Nikole Pašića 42",
                mesto: "Niš",
                mail: "Filijala_Nis@aikbanka.rs"
              },
              {
                naziv: "Filijala Pirot",
                adresa: "Slavonska 1",
                mesto: "Pirot",
                mail: "Filijala_Pirot@aikbanka.rs"
              },
              {
                naziv: "Filijala Bul. Dr Zorana Đinđića",
                adresa: "Bul.  dr Zorana Đinđića 23",
                mesto: "Niš",
                mail: "Filijala_Bul_ZDjindjica@aikbanka.rs"
              },
              {
                naziv: "Filijala Voždova",
                adresa: "Voždova 2",
                mesto: "Niš",
                mail: "Filijala_Vozdova@aikbanka.rs"
              },
              {
                naziv: "Filijala Zona III",
                adresa: "Bul.  Nemanjića 25",
                mesto: "Niš",
                mail: "Filijala_Zona3@aikbanka.rs"
              },
              {
                naziv: "Filijala Prokuplje",
                adresa: "Topličkih junaka 1",
                mesto: "Prokuplje",
                mail: "Filijala_Prokuplje@aikbanka.rs"
              },
              {
                naziv: "Filijala Kruševac",
                adresa: "Vidovdanska 9-11",
                mesto: "Kruševac",
                mail: "Filijala_Krusevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Vrnjačka Banja",
                adresa: "Kraljevačka 6, Drvara I",
                mesto: "Vrnjačka banja",
                mail: "Filijala_Vrnjacka_banja@aikbanka.rs"
              },
              {
                naziv: "Filijala Leskovac",
                adresa: "Bul.  Oslobođenja bb",
                mesto: "Leskovac",
                mail: "Filijala_Leskovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Vranje",
                adresa: "Kralja Stefana Prvovenčanog 169",
                mesto: "Vrane",
                mail: "Filijala_Vranje@aikbanka.rs"
              },
              {
                naziv: "Filijala Jagodina",
                adresa: "Knjeginje Milice 73",
                mesto: "Jagodina",
                mail: "Filijala_Jagodina@aikbanka.rs"
              },
              {
                naziv: "Filijala Paraćin",
                adresa: "Kralja Petra I 30",
                mesto: "Paraćin",
                mail: "Filijala_Paracin@aikbanka.rs"
              },
              {
                naziv: "Filijala Zaječar",
                adresa: "Pana Đukića bb",
                mesto: "Zaječar",
                mail: "Filijala_Zajecar@aikbanka.rs"
              },
              {
                naziv: "Filijala Bor",
                adresa: "Đorđa Vajferta 21",
                mesto: "Bor",
                mail: "Filijala_Bor@aikbanka.rs"
              },
              {
                naziv: "Filijal Negotin",
                adresa: "JNA 2",
                mesto: "Negotin",
                mail: "Filijala_Negotin@aikbanka.rs"
              },
              {
                naziv: "Filijala Kragujevac",
                adresa: "Trg Radomira Putnika 3",
                mesto: "Kragujevac",
                mail: "Filijala_Kragujevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Čačak",
                adresa: "Kuželjeva 2",
                mesto: "Čačak",
                mail: "Filijala_Cacak@aikbanka.rs"
              },
              {
                naziv: "Filijala Gornji Milanovac",
                adresa: "Kneza Aleksandra 13",
                mesto: "Gornji Milanovac",
                mail: "Filijala_GMilanovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Užice",
                adresa: "Dimitrija Tucovića 44",
                mesto: "Užice",
                mail: "Filijala_Uzice@aikbanka.rs"
              },
              {
                naziv: "Filijala Prijepolje",
                adresa: "Sandžačkih brigada 19",
                mesto: "Prijepolje",
                mail: "Filijala_Prijepolje@aikbanka.rs"
              },
              {
                naziv: "Filijala Novi Pazar",
                adresa: "Stevana Nemanje bb",
                mesto: "Novi Pazar",
                mail: "Filijala_Novi_Pazar@aikbanka.rs"
              },
              {
                naziv: "Filijala Kraljevo",
                adresa: "Miloša Velikog 58",
                mesto: "Kraljevo",
                mail: "Filijala_Kraljevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Novi Sad  1",
                adresa: "Bul.  Mihajla Pupina 2",
                mesto: "Novi Sad",
                mail: "Filijala_Novi_Sad@aikbanka.rs"
              },
              {
                naziv: "Filijala Novi Sad 2",
                adresa: "Bul.  Oslobođenja 68b",
                mesto: "Novi Sad",
                mail: "Filijala_Bul_Oslobodjenja@aikbanka.rs"
              },
              {
                naziv: "Filijala Ruma",
                adresa: "Glavna 192",
                mesto: "Ruma",
                mail: "Filijala_Ruma@aikbanka.rs"
              },
              {
                naziv: "Filijala Inđija",
                adresa: "Novosadska 2",
                mesto: "Inđija",
                mail: "Filijala_Indjija@aikbanka.rs"
              },
              {
                naziv: "Filijala Subotica",
                adresa: "Korzo 8",
                mesto: "Subotica",
                mail: "Filijala_Subotica@aikbanka.rs"
              },
              {
                naziv: "Filijala Vrbas",
                adresa: "Maršala Tita 80",
                mesto: "Vrbas",
                mail: "Filijala_Vrbas@aikbanka.rs"
              },
              {
                naziv: "Filijala Zrenjanin",
                adresa: "Žitni trg bb",
                mesto: "Zrenjanin",
                mail: "Filijala_Zrenjanin@aikbanka.rs"
              },
              {
                naziv: "Filijala  Kikinda",
                adresa: "Trg Srpskih dobrovoljaca 6",
                mesto: "Kikinda",
                mail: "Filijala_Kikinda@aikbanka.rs"
              },
              {
                naziv: "Filijala Sombor",
                adresa: "Pariska 1",
                mesto: "Sombor",
                mail: "Filijala_Sombor@aikbanka.rs"
              }
          ],
        }
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
          returnType: ['naziv','adresa','mesto'],
          localAutocompletePool: [
              {
                naziv: "Filijala Beograd-Grawe",
                adresa: "Bul.  Mihajla Pupina 115đ",
                mesto: "Novi Beograd",
                mail: "Filijala_Grawe@aikbanka.rs"
              },
              {
                naziv: "Filijala  Fontana",
                adresa: "Otona Župančića 1",
                mesto: "Novi Beograd",
                mail: "Filijala_Fontana@aikbanka.rs"
              },
              {
                naziv: "Filijala Vidikovac",
                adresa: "Patrijarha Joanikija 28b",
                mesto: "Beograd",
                mail: "Filijala_Vidikovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Vojvode Stepe",
                adresa: "Vojvode Stepe 171",
                mesto: "Beograd",
                mail: "Filijala_Vojvode_Stepe@aikbanka.rs"
              },
              {
                naziv: "Filijala  Zemun",
                adresa: "Glavna 7",
                mesto: "Zemun",
                mail: "Filijala_Zemun@aikbanka.rs"
              },
              {
                naziv: "Filijala Jurija Gagarina",
                adresa: "Jurija Gagarina 32",
                mesto: "Novi Beograd",
                mail: "Filijala_Jurija_Gagarina@aikbanka.rs"
              },
              {
                naziv: "Filijala Banovo Brdo",
                adresa: "Požeška 76",
                mesto: "Beograd",
                mail: "Filijala_Banovo_Brdo@aikbanka.rs"
              },
              {
                naziv: "Filijala Kralja Milana Beograd",
                adresa: "Kralja Milana 11",
                mesto: "Beograd",
                mail: "Filijala_Kralja_Milana@aikbanka.rs"
              },
              {
                naziv: "Filijala Bulevar Kralja Aleksandra",
                adresa: "Bul.  Kralja Aleksandra 334",
                mesto: "Beograd",
                mail: "Filijala_Bul_KA@aikbanka.rs"
              },
              {
                naziv: "Filijala  Makedonska",
                adresa: "Makedonska 19",
                mesto: "Beograd",
                mail: "Filijala_Makedonska@aikbanka.rs"
              },
              {
                naziv: "Filijala Slavija",
                adresa: "Kralja Milana 43",
                mesto: "Beograd",
                mail: "Filijala_Slavija@aikbanka.rs"
              },
              {
                naziv: "Filijala Stari Grad",
                adresa: "Cara Dušana 84-86",
                mesto: "Beograd",
                mail: "Filijala_Stari_Grad@aikbanka.rs"
              },
              {
                naziv: "Filijala Lazarevac",
                adresa: "Karađorđeva 29",
                mesto: "Lazaravac",
                mail: "Filijala_Lazarevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Obrenovac",
                adresa: "Aleksandra Ace Simovića 2",
                mesto: "Obrenovac",
                mail: "Filijala_Obrenovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Pančevo",
                adresa: "Karađorđeva 2b",
                mesto: "Pančevo",
                mail: "Filijala_Pancevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Pozarevac",
                adresa: "Trg Radomira Vujovića br 12",
                mesto: "Požarevac",
                mail: "Filijala_Pozarevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Smederevo",
                adresa: "Kralja Petra Prvog 11",
                mesto: "Smederevo",
                mail: "Filijala_Smederevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Šabac",
                adresa: "V. Jovanovića 22",
                mesto: "Šabac",
                mail: "Filijala_Sabac@aikbanka.rs"
              },
              {
                naziv: "Filijala Valjevo",
                adresa: "Vojvode Mišića 22",
                mesto: "Valjevo",
                mail: "Filijala_Valjevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Niš",
                adresa: "Nikole Pašića 42",
                mesto: "Niš",
                mail: "Filijala_Nis@aikbanka.rs"
              },
              {
                naziv: "Filijala Pirot",
                adresa: "Slavonska 1",
                mesto: "Pirot",
                mail: "Filijala_Pirot@aikbanka.rs"
              },
              {
                naziv: "Filijala Bul. Dr Zorana Đinđića",
                adresa: "Bul.  dr Zorana Đinđića 23",
                mesto: "Niš",
                mail: "Filijala_Bul_ZDjindjica@aikbanka.rs"
              },
              {
                naziv: "Filijala Voždova",
                adresa: "Voždova 2",
                mesto: "Niš",
                mail: "Filijala_Vozdova@aikbanka.rs"
              },
              {
                naziv: "Filijala Zona III",
                adresa: "Bul.  Nemanjića 25",
                mesto: "Niš",
                mail: "Filijala_Zona3@aikbanka.rs"
              },
              {
                naziv: "Filijala Prokuplje",
                adresa: "Topličkih junaka 1",
                mesto: "Prokuplje",
                mail: "Filijala_Prokuplje@aikbanka.rs"
              },
              {
                naziv: "Filijala Kruševac",
                adresa: "Vidovdanska 9-11",
                mesto: "Kruševac",
                mail: "Filijala_Krusevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Vrnjačka Banja",
                adresa: "Kraljevačka 6, Drvara I",
                mesto: "Vrnjačka banja",
                mail: "Filijala_Vrnjacka_banja@aikbanka.rs"
              },
              {
                naziv: "Filijala Leskovac",
                adresa: "Bul.  Oslobođenja bb",
                mesto: "Leskovac",
                mail: "Filijala_Leskovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Vranje",
                adresa: "Kralja Stefana Prvovenčanog 169",
                mesto: "Vrane",
                mail: "Filijala_Vranje@aikbanka.rs"
              },
              {
                naziv: "Filijala Jagodina",
                adresa: "Knjeginje Milice 73",
                mesto: "Jagodina",
                mail: "Filijala_Jagodina@aikbanka.rs"
              },
              {
                naziv: "Filijala Paraćin",
                adresa: "Kralja Petra I 30",
                mesto: "Paraćin",
                mail: "Filijala_Paracin@aikbanka.rs"
              },
              {
                naziv: "Filijala Zaječar",
                adresa: "Pana Đukića bb",
                mesto: "Zaječar",
                mail: "Filijala_Zajecar@aikbanka.rs"
              },
              {
                naziv: "Filijala Bor",
                adresa: "Đorđa Vajferta 21",
                mesto: "Bor",
                mail: "Filijala_Bor@aikbanka.rs"
              },
              {
                naziv: "Filijal Negotin",
                adresa: "JNA 2",
                mesto: "Negotin",
                mail: "Filijala_Negotin@aikbanka.rs"
              },
              {
                naziv: "Filijala Kragujevac",
                adresa: "Trg Radomira Putnika 3",
                mesto: "Kragujevac",
                mail: "Filijala_Kragujevac@aikbanka.rs"
              },
              {
                naziv: "Filijala Čačak",
                adresa: "Kuželjeva 2",
                mesto: "Čačak",
                mail: "Filijala_Cacak@aikbanka.rs"
              },
              {
                naziv: "Filijala Gornji Milanovac",
                adresa: "Kneza Aleksandra 13",
                mesto: "Gornji Milanovac",
                mail: "Filijala_GMilanovac@aikbanka.rs"
              },
              {
                naziv: "Filijala Užice",
                adresa: "Dimitrija Tucovića 44",
                mesto: "Užice",
                mail: "Filijala_Uzice@aikbanka.rs"
              },
              {
                naziv: "Filijala Prijepolje",
                adresa: "Sandžačkih brigada 19",
                mesto: "Prijepolje",
                mail: "Filijala_Prijepolje@aikbanka.rs"
              },
              {
                naziv: "Filijala Novi Pazar",
                adresa: "Stevana Nemanje bb",
                mesto: "Novi Pazar",
                mail: "Filijala_Novi_Pazar@aikbanka.rs"
              },
              {
                naziv: "Filijala Kraljevo",
                adresa: "Miloša Velikog 58",
                mesto: "Kraljevo",
                mail: "Filijala_Kraljevo@aikbanka.rs"
              },
              {
                naziv: "Filijala Novi Sad  1",
                adresa: "Bul.  Mihajla Pupina 2",
                mesto: "Novi Sad",
                mail: "Filijala_Novi_Sad@aikbanka.rs"
              },
              {
                naziv: "Filijala Novi Sad 2",
                adresa: "Bul.  Oslobođenja 68b",
                mesto: "Novi Sad",
                mail: "Filijala_Bul_Oslobodjenja@aikbanka.rs"
              },
              {
                naziv: "Filijala Ruma",
                adresa: "Glavna 192",
                mesto: "Ruma",
                mail: "Filijala_Ruma@aikbanka.rs"
              },
              {
                naziv: "Filijala Inđija",
                adresa: "Novosadska 2",
                mesto: "Inđija",
                mail: "Filijala_Indjija@aikbanka.rs"
              },
              {
                naziv: "Filijala Subotica",
                adresa: "Korzo 8",
                mesto: "Subotica",
                mail: "Filijala_Subotica@aikbanka.rs"
              },
              {
                naziv: "Filijala Vrbas",
                adresa: "Maršala Tita 80",
                mesto: "Vrbas",
                mail: "Filijala_Vrbas@aikbanka.rs"
              },
              {
                naziv: "Filijala Zrenjanin",
                adresa: "Žitni trg bb",
                mesto: "Zrenjanin",
                mail: "Filijala_Zrenjanin@aikbanka.rs"
              },
              {
                naziv: "Filijala  Kikinda",
                adresa: "Trg Srpskih dobrovoljaca 6",
                mesto: "Kikinda",
                mail: "Filijala_Kikinda@aikbanka.rs"
              },
              {
                naziv: "Filijala Sombor",
                adresa: "Pariska 1",
                mesto: "Sombor",
                mail: "Filijala_Sombor@aikbanka.rs"
              }
        ],
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

    control.autoCompleteOptions = [];


    const availableOptions = control.autocompleteConfig.localAutocompletePool.filter(option => {
      if(!option || !newValue) return false;
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

  onClickAutocomplete(option: string, control: FormControlModel) {
      this.dynamicForm.get(control.name)?.setValue(option);
    }

  submit(): void {
    const data: any = {}

    for (const control in this.dynamicForm.controls) {
      if(control.endsWith('-internal-other')) continue;
      data[control] = this.dynamicForm.controls[control].value;
    }

    this.formJson.controls = this.formControlArray;

    this.submittedForm = JSON.stringify(data);
  }

  schemaValidator(schema: any, object: any) {

    const objectCopy = {...object};

    if (Object.keys(objectCopy).length !== schema.controls.length) return false;

    schema.controls.forEach((control) => {
      
      if(control.name in objectCopy) return false;

      switch(control.type) {

        case 'checkbox': {

          if(!(control.value instanceof Array)) return false;
          if(!control.multipleChoiceCheckbox && control.value.length>1) return false;

        }

        case 'input':
        case 'textarea':
          if(!(control.value instanceof String)) return false;

        case 'multiple-select':
          if(!(control.value instanceof Array)) return false;

        case 'select':
          if(!(control.value instanceof String)) return false;

      }

    });

    return true;

  }

  ngOnDestroy(): void {
    this.autoCompleteSubscription?.unsubscribe();
  }
}
