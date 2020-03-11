import { Injectable } from '@angular/core';
import { UserPref } from './user-preference';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import app_description from '../assets/app_description.json'
import { isPrimitiveType } from './constants';
import { GraphHistoryItem } from './db-service/data-types';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariableService {
  private HISTORY_SNAP_DELAY = 2500;
  cy: any;
  viewUtils: any;
  currHighlightIdx: number = 0;
  layoutUtils: any;
  layout: any;
  expandCollapseApi: any;
  hiddenClasses: Set<string>;
  setLoadingStatus: (boolean) => void;
  isSelectFromLoad: boolean = false;
  userPrefs: UserPref = {} as UserPref;
  shownElemsChanged = new BehaviorSubject<boolean>(true);
  operationTabChanged = new BehaviorSubject<number>(1);
  graphHistory: GraphHistoryItem[] = [];
  showHideGraphHistory = new BehaviorSubject<boolean>(false);
  addNewGraphHistoryItem = new BehaviorSubject<boolean>(false);
  isLoadFromHistory: boolean = false;

  constructor(private _http: HttpClient) {
    this.hiddenClasses = new Set([]);
    // set user preferences staticly (necessary for rendering html initially)
    this.setUserPrefs(app_description.appPreferences, this.userPrefs);
    // set user preferences dynamically
    this._http.get('./assets/app_description.json').subscribe(x => { this.setUserPrefs(x['appPreferences'], this.userPrefs); });
  }

  private setUserPrefs(obj: any, userPref: any) {
    if (obj === undefined || obj === null) {
      return;
    }
    for (let k in obj) {
      let prop = obj[k];
      if (isPrimitiveType(prop)) {
        if (userPref[k]) {
          (userPref[k] as BehaviorSubject<any>).next(prop);
        } else {
          userPref[k] = new BehaviorSubject(prop);
        }
      } else {
        if (!userPref[k]) {
          userPref[k] = {};
        }
        this.setUserPrefs(obj[k], userPref[k]);
      }
    }
  }

  public getConfig() {
    return this._http.get('./assets/visuall-config.json');
  }

  runLayout() {
    this.cy.elements().not(':hidden, :transparent').layout(this.layout).run();
  }

  performLayout(isRandomize: boolean, isDirectCommand: boolean = false, animationDuration: number = 1000) {
    if (!this.userPrefs.isAutoIncrementalLayoutOnChange.getValue() && !isRandomize && !isDirectCommand) {
      this.cy.fit();
      return;
    }
    this.layout.animationDuration = animationDuration;
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

  highlightElems(elems) {
    this.viewUtils.highlight(elems, this.currHighlightIdx);
  }

  add2GraphHistory(expo: string) {
    setTimeout(() => {
      if (this.graphHistory.length > this.userPrefs.queryHistoryLimit.getValue() - 1) {
        this.graphHistory.splice(0, 1);
      }
      const options = { bg: 'white', scale: 3, full: true };
      const base64png: string = this.cy.png(options);
      const elements = this.cy.json().elements;
      const txt = JSON.stringify(elements, undefined, 4);

      let g: GraphHistoryItem = {
        expo: expo,
        base64png: base64png,
        json: txt
      };
      this.graphHistory.push(g);
      this.addNewGraphHistoryItem.next(true);
    }, this.HISTORY_SNAP_DELAY);
  }
}
