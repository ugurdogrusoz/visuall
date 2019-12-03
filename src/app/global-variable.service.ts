import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariableService {
  cy: any;
  viewUtils: any;
  layoutUtils: any;
  layout: any;
  expandCollapseApi: any;
  hiddenClasses: Set<string>;
  isIgnoreCaseInText: boolean;
  isTimebarEnabled: boolean;
  isAutoIncrementalLayoutOnChange: boolean;
  isSelectOnMerge: boolean;
  setLoadingStatus: (boolean) => void;
  
  constructor() {
    this.isIgnoreCaseInText = false;
    this.isTimebarEnabled = true;
    this.hiddenClasses = new Set([]);
    this.isAutoIncrementalLayoutOnChange = true;
    this.isSelectOnMerge = true;
  }

  runLayout() {
    this.cy.elements().not(':hidden, :transparent').layout(this.layout).run();
  }

  performLayout(isRandomize: boolean, isDirectCommand: boolean = false) {
    if (!this.isAutoIncrementalLayoutOnChange && !isRandomize && !isDirectCommand) {
      this.cy.fit();
      return;
    }
    this.switchLayoutRandomization(isRandomize);
    this.runLayout();
  }

  switchLayoutRandomization(isRandomize: boolean) {
    this.layout.randomize = isRandomize;
    if (!this.layout.randomize) {
      this.layout.quality = 'proof'
    }
  }

  applyClassFiltering() {
    let hiddenSelector = '';
    for (let i of this.hiddenClasses) {
      hiddenSelector += '.' + i + ',';
    }

    hiddenSelector = hiddenSelector.substr(0, hiddenSelector.length - 1);

    if (hiddenSelector.length > 1) {
      this.viewUtils.hide(this.cy.$(hiddenSelector));
    }
  }

  filterByClass(elems) {
    let hiddenSelector = '';
    for (let i of this.hiddenClasses) {
      hiddenSelector += '.' + i + ',';
    }

    hiddenSelector = hiddenSelector.substr(0, hiddenSelector.length - 1);

    if (hiddenSelector.length < 1) {
      return elems;
    }
    return elems.not(hiddenSelector);
  }

  getGraphElemSet() {
    return new Set<string>(this.cy.elements().map(x => x.id()));
  }

  setStyleFromJson(json) {
    this.cy.style(json);
  }
}
