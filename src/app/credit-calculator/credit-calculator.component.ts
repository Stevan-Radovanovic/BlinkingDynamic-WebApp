import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { CalculateOfferRequestModel, CalculateOfferResponseModel } from './models/calculate-offer.models';
import { SendOfferRequestModel } from './models/send-offer-data.models';

@Component({
  selector: 'app-credit-calculator',
  templateUrl: './credit-calculator.component.html',
  styleUrls: ['./credit-calculator.component.scss']
})
export class CreditCalculatorComponent implements OnInit {

  creditAmountLimits: {min: number,max: number};
  paymentPeriodLimits: {min: number,max: number};
  isCheckboxChecked = true;

  calculateOfferParams: CalculateOfferRequestModel;
  offerData: CalculateOfferResponseModel;

  @ViewChild('slider1') slider1: MatSlider;
  @ViewChild('slider2') slider2: MatSlider;

  calculationMade = false;

  constructor() { }

  ngOnInit(): void {
    this.getInitialLimits();
  }

  getInitialLimits(): void {
    this.creditAmountLimits = {
      min: 200,
      max: 1200
    };

    this.paymentPeriodLimits = {
      min: 100,
      max: 600
    };
  }

  getLimitsWhenCheckboxIsUnchecked(): void {
    this.creditAmountLimits = {
      min: 400,
      max: 400
    };

    this.paymentPeriodLimits = {
      min: 300,
      max: 900
    };
  }

  formatCreditLabel(value: number) {
    return value + 'k'
  }

  formatPeriodLabel(value: number) {
    return value;
  }

  changeLimits() {
    if(this.isCheckboxChecked) {
      this.isCheckboxChecked = false;
      this.getLimitsWhenCheckboxIsUnchecked();
    } else {
      this.isCheckboxChecked = true;
      this.getInitialLimits();
    }
 
    this.slider1.writeValue(this.creditAmountLimits.min);
    this.slider2.writeValue(this.paymentPeriodLimits.min);

  }

  calculateOffer() {
    this.calculateOfferParams = {
      instanceId: '11wwe54',
      productCode: 'axd3Re',
      amount: this.slider1.value,
      paymentPeriod: this.slider2.value
    };
    setTimeout(() => {
      this.offerData = {
        annuity: 12800,
        effectiveInterestRate: 4.2,
        totalFees: 544000,
        totalInterest: 111000,
        totalRepayment: 654000,
        successful: true,
        error: 'Došlo je do greške pri obradi vaše ponude. Molimo vas pokušajte ponovo.'
      }
      this.calculationMade = true;
    }, 1000)
  }

  sendOfferData() {
    const params: SendOfferRequestModel = {
      ...this.calculateOfferParams,
      realizationMethod: 'AU' 
    }
    this.calculationMade = false;
  }

  repeatCalculation() {
    this.calculationMade = false;
  }

}
