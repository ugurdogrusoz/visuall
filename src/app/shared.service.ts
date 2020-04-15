import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private recomDetails: any;
 

  constructor() {
    this.recomDetails = undefined;
  }

  getRecomDetails(): any {
    return this.recomDetails;
  }

  setRecomDetails(value: any) {
    this.recomDetails = value;
  }
}
