import { Injectable } from '@angular/core';
import { NavbarDropdown } from './inavbar';
import { GlobalVariableService } from '../global-variable.service';

@Injectable({
  providedIn: 'root'
})
/** Custom menu items and action functions for the items should be added to this class.
 * You might need to import other services but you should only edit this file.
 * Using 'menu' function, provided items will be added to navbar.
 * 'isStd' property must be false for all items.
 * If 'dropdown' is not existing inside standard menu, it will be added as a new item.
 sample menu array   
 this._menu = [{
      dropdown: 'File', actions: [{ txt: 'Custom Action 1', id: '', fn: 'fn1', isStd: false }]
    },
    {
      dropdown: 'Custom DropDown 1', actions: [{ txt: 'Custom Action 1', id: '', fn: 'fn2', isStd: true }]
    }];
 **/
export class NavbarCustomizationService {
  private _menu: NavbarDropdown[];
  get menu(): NavbarDropdown[] {
    return this._menu;
  }

  constructor(private _g: GlobalVariableService) {
    // this._menu = [{
    //   dropdown: 'File', actions: [{ txt: 'Custom Action 1', id: '', fn: 'fn1', isStd: false }]
    // },
    // {
    //   dropdown: 'Custom DropDown 1', actions: [{ txt: 'Custom Action 2', id: '', fn: 'fn2', isStd: true }]
    // }];
  }

  // fn1() {
  //   console.log('fn1 called');
  // }

  // fn2() {
  //   console.log('fn2 called');
  // }

}
