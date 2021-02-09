import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getAutocompleteSource(url: string, key: string) {
    return this.http.get(url + key);
  }
}
