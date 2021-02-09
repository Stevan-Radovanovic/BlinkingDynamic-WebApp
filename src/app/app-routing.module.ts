import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path: 'dynamic', component: AppComponent},
  {path: '', pathMatch:'full', redirectTo: 'dynamic'},
  {path: '**',redirectTo: 'dynamic'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
