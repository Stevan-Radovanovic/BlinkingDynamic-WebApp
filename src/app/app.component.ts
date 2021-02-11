import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dynamic-form-test';
  routeSwitcher = 1;

  constructor(private router: Router) {}
 
  switchPage() {
    if(this.routeSwitcher === 1) {
      this.routeSwitcher = 2;
      this.router.navigate(['/dynamic-html']);
      return;
    }

    if(this.routeSwitcher === 2) {
      this.routeSwitcher = 3;
      this.router.navigate(['/dynamic-pdf-sign']);
      return;
    }

    if(this.routeSwitcher === 3) {
      this.routeSwitcher = 1;
      this.router.navigate(['/dynamic-form']);
      return;
    }

  }
  
}
