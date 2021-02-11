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
    
    switch(route) {
      case '/dynamic-form': {
        this.router.navigateByUrl('/dynamic-html');
        break;
      }
      case '/dynamic-html': {
        this.router.navigateByUrl('/dynamic-pdf-sign');
        break;
      }
      case '/dynamic-pdf-sign': {
        this.router.navigateByUrl('/dynamic-form');
        break;
      }
    }

  }
  
}
