import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabCustomizationService {

  // put your Angular Componenets here like below
  // static tabs: { component: any, text: string }[] = [{ component: DummyComponent, text: 'Dummy' }];
  static tabs: { component: any, text: string }[] = [];
  constructor() { }
}
