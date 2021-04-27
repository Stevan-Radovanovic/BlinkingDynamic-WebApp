import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getAutocompleteSource(url: string, key: string): Observable<any[]> {
    return of([{naziv: "steva"},{naziv: "stevica"},{naziv: "stivi"}]);
  }
}
