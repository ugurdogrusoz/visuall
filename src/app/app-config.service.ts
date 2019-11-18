import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  constructor(private _http: HttpClient) {
  }

  public getConfig() {
    return this._http.get('./assets/visuall-config.json');
  }
}
