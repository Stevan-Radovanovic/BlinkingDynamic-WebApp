import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonType } from './button-type.enum';
import { DynamicPageModel } from './dynamic-page.model';

@Component({
  selector: 'app-dynamic-html',
  templateUrl: './dynamic-html.component.html',
  styleUrls: ['./dynamic-html.component.scss']
})
export class DynamicHtmlComponent implements OnInit {

  pageData!: DynamicPageModel;
  @ViewChild('contentDiv') contentDiv!: ElementRef;

  params: any = {

    amount: 100,
    paymentPeriod: 23,
    isAikPaySelected: true,
    annuity: 20,
    effectiveInterestRate: 2,
    totalInterest: 3,
    totalFees: 4,
    totalRepayment: 2
  }

  constructor() { }


  ngOnInit(): void {
    this.getDynamicHtml();
  }

  ngAfterViewInit() {
    this.fillContentDiv();
  }

  fillHtmlScheme(params: any) {
    return `
    <div style="margin-top: 20px;">
      <p style="text-align: center; font-weight: bold; font-size: 18px;">Podaci</p>
      <div>
          <p>Iznos kredita: <b>${params.amount}000 RSD</b></p>
          <p>Period otplate u mesecima: <b>${params.paymentPeriod}</b></p>
          <p><b>${params.isAikPaySelected ? 'Sa prenosom plate u AIK banku.' : 'Bez prenosa plate u AIK banku.'}</b></p>
      </div>
      <hr style="border: 2px solid #0a667d;">
      <p style="text-align: center; font-weight: bold; font-size: 18px;">Ponuda</p>
      <div>
          <p>Mesečna rata: <b>${params.annuity} RSD</b></p>
          <p>Efektivna kamatna stopa: <b>${params.effectiveInterestRate}%</b></p>
          <p>Ukupna kamata: <b>${params.totalInterest} RSD</b></p>
          <p>Ukupni iznos otplate: <b>${params.totalRepayment} RSD</b></p>
          <p>Naknade i troškovi: <b>${params.totalFees} RSD</b></p>
      </div>
      <p style="margin-top: 16px; color: grey; margin-bottom: 0px; text-align: center;">Da li prihvatate ovu ponudu?</p>
    </div>
    `
  }

  getDynamicHtml() {
    this.pageData = {
      title : "Predugovor",
      content: this.fillHtmlScheme(this.params),
      actions: [{label: 'Prihvatam', type: ButtonType.CONFIRM},{label: 'Ne prihvatam', type: ButtonType.CANCEL}]
    }

  }

  fillContentDiv() {
    this.contentDiv.nativeElement.innerHTML = this.pageData.content
  }

  onButtonClick(buttonType: ButtonType) {
    switch(buttonType) {
      case ButtonType.DOWNLOAD: return this.onClickDownload();
      case ButtonType.CONFIRM: return this.onClickConfirm();
      case ButtonType.CANCEL: return this.onClickCancel();
    }
  }

  onClickDownload() {
    console.log('Downloading...');
  }

  onClickCancel() {
    console.log('Canceling...');
  }

  onClickConfirm() {
    console.log('Confirming...');
  }

  htmlScheme = `    
  <div style="display: flex; flex-direction: column;">
    <div style="font-weight: bold; font-size: 20px; margin-top: 20px; margin-bottom: 20px;">
        <p hidden=" params.startPacketA ">Klijent ima sve AIK-ove proizvode.</p>
        <p hidden=" ! params.startPacketA && params.activeProduct ">Klijent ima neki od AIK-ovih proizvoda.</p>
        <p hidden=" ! params.startPacketA && ! params.activeProduct ">Klijent nema nijedan proizvod AIK-ovih proizvoda.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0px; padding: 0px 40px;">
            <p style="font-weight: bold; margin-bottom: 0px;">VisaCard</p>
            <mat-icon style="color: #75A053;" hidden=" params.visaCardOut ">check_circle</mat-icon>
            <mat-icon style="color: #ff3f60" hidden=" ! params.visaCardOut ">cancel</mat-icon>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0px; padding: 0px 40px;">
            <p style="font-weight: bold; margin-bottom: 0px;">MasterCard</p>
            <mat-icon style="color: #75A053;" hidden=" params.masterCard ">check_circle</mat-icon>
            <mat-icon style="color: #ff3f60" hidden=" ! params.masterCard ">cancel</mat-icon>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0px; padding: 0px 40px;">
            <p style="font-weight: bold; margin-bottom: 0px;">DinaCard</p>
            <mat-icon style="color: #75A053;" hidden=" params.dinaCard ">check_circle</mat-icon>

        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0px; padding: 0px 40px;">
            <p style="font-weight: bold; margin-bottom: 0px;">Tekući dinarski račun</p>
            <mat-icon style="color: #75A053;" hidden=" params.currentAccount ">check_circle</mat-icon>
            <mat-icon style="color: #ff3f60" hidden=" ! params.currentAccount ">cancel</mat-icon>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0px; padding: 0px 40px;">
            <p style="font-weight: bold; margin-bottom: 0px;">Multivalutni dinarski račun</p>
            <mat-icon style="color: #75A053;" hidden=" params.multyCurrencyAccount ">check_circle</mat-icon>
            <mat-icon style="color: #ff3f60" hidden=" ! params.multyCurrencyAccount ">cancel</mat-icon>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0px; padding: 0px 40px;">
            <p style="font-weight: bold; margin-bottom: 0px;">eBanking</p>
            <mat-icon style="color: #75A053;" hidden=" params.eBanking ">check_circle</mat-icon>
            <mat-icon style="color: #ff3f60" hidden=" ! params.eBanking ">cancel</mat-icon> 
        </div>
    </div>
  </div>`

}
