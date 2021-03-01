import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';

@Component({
  selector: 'app-credit-calculator',
  templateUrl: './credit-calculator.component.html',
  styleUrls: ['./credit-calculator.component.scss']
})
export class CreditCalculatorComponent implements OnInit {

  creditAmountLimits: {min: number,max: number};
  paymentPeriodLimits: {min: number,max: number};
  isCheckboxChecked = true;

  @ViewChild('slider1') slider1: MatSlider;
  @ViewChild('slider2') slider2: MatSlider;

  calculationMade = false;

  constructor() { }

  ngOnInit(): void {
    this.getInitialLimits();
  }

  getInitialLimits(): void {
    this.creditAmountLimits = {
      min: 2,
      max: 12
    };

    this.paymentPeriodLimits = {
      min: 1,
      max: 6
    };
  }

  getLimitsWhenCheckboxIsUnchecked(): void {
    this.creditAmountLimits = {
      min: 4,
      max: 16
    };

    this.paymentPeriodLimits = {
      min: 3,
      max: 9
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

  calculateCredit() {
    this.calculationMade = true;
  }

  repeatCalculation() {
    this.calculationMade = false;
  }

}
