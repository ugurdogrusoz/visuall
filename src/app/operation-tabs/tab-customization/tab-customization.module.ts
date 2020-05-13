import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import statements for custom components should be here

@NgModule({
  // custom components should be inside declarations
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class TabCustomizationModule {
  // static tabs: { component: any, text: string }[] = [{ component: DummyComponent, text: 'Dummy' }, { component: Dummy2Component, text: 'Dummy2' }];
  static tabs: { component: any, text: string }[] = [];
}
