import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CreditCalculatorComponent } from './credit-calculator/credit-calculator.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DynamicHtmlComponent } from './dynamic-html/dynamic-html.component';
import { DynamicPdfSignComponent } from './dynamic-pdf-sign/dynamic-pdf-sign.component';

const routes: Routes = [
  {path: 'dynamic-form', component: DynamicFormComponent},
  {path: 'dynamic-html', component: DynamicHtmlComponent},
  {path: 'dynamic-pdf-sign', component: DynamicPdfSignComponent},
  {path: 'credit-calculator', component: CreditCalculatorComponent},
  {path: '', pathMatch:'full', redirectTo: 'dynamic-form'},
  {path: '**',redirectTo: 'dynamic-form'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
