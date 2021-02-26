import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSliderModule} from '@angular/material/slider';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DynamicHtmlComponent } from './dynamic-html/dynamic-html.component';
import { HttpClientModule } from '@angular/common/http';
import { DynamicPdfSignComponent } from './dynamic-pdf-sign/dynamic-pdf-sign.component';
import { MiniPdfViewComponent } from './dynamic-pdf-sign/mini-pdf-view/mini-pdf-view.component';
import { PdfPreviewModalComponent } from './dynamic-pdf-sign/pdf-preview-modal/pdf-preview-modal.component'
import {MatDialogModule} from '@angular/material/dialog';
import { PdfSignModalComponent } from './dynamic-pdf-sign/pdf-sign-modal/pdf-sign-modal.component';
import { CreditCalculatorComponent } from './credit-calculator/credit-calculator.component';


@NgModule({
  declarations: [
    AppComponent,
    DynamicFormComponent,
    DynamicHtmlComponent,
    DynamicPdfSignComponent,
    MiniPdfViewComponent,
    PdfPreviewModalComponent,
    PdfSignModalComponent,
    CreditCalculatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSliderModule
  ],
  providers: [],
  entryComponents: [
    PdfPreviewModalComponent,
    PdfSignModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
