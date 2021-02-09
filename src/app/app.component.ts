import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dynamic-form-test';

  constructor(private router: Router) {}
 
  switchPage() {
    const route = this.router.url;
    if(route.indexOf('form')!==-1) this.router.navigate(['/dynamic-html']);
    else this.router.navigate(['dynamic-form']);
  }
  
}
