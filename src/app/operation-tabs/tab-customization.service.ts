import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabCustomizationService {

  tabs: { component: any, text: string }[] = [];
  constructor() { }
}
