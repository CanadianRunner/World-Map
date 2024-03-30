import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryInfoService {
  private apiUrl = 'https://api.worldbank.org/v2/country/';

  constructor(private http: HttpClient) { }

  getAllCountries(): Observable<any> {
    return this.http.get(`${this.apiUrl}?format=json&per_page=300`);
  }

  getCountryInfo(countryId: string): Observable<any> {
    console.log(`Fetching data for country ID: ${countryId}`);
    return this.http.get(`${this.apiUrl}${countryId}?format=json`);
  }

  getCountryInfoByName(countryName: string): Observable<any> {
    console.log(`Fetching data for country Name: ${countryName}`);
    return this.http.get(`${this.apiUrl}name/${countryName}?format=json`);
  }
}
