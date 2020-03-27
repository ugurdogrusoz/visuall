import { Injectable } from '@angular/core';
import { UserProfile } from './user-preference';
import { FilteringRule, TimebarMetric } from './operation-tabs/map-tab/filtering-types';
import { BehaviorSubject } from 'rxjs';
import { GlobalVariableService } from './global-variable.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  onLoadFromFile: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private _g: GlobalVariableService) { }

  private getUserProfile() {
    let p = localStorage.getItem('profile');
    if (!p) {
      return null;
    }
    return JSON.parse(p) as UserProfile;
  }

  private setFilteringRules(f: FilteringRule[]) {
    let p = this.getUserProfile();
    if (p) {
      p.filteringRules = f;
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      localStorage.setItem('profile', JSON.stringify({ filteringRules: [] }));
    }
  }

  private setTimebarMetrics(t: TimebarMetric[]) {
    let p = this.getUserProfile();
    if (p) {
      p.timebarMetrics = t;
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      localStorage.setItem('profile', JSON.stringify({ timebarMetrics: [] }));
    }
  }

  private getUserPrefs() {
    let p = this.getUserProfile();
    if (p) {
      return p.userPref;
    }
    return null;
  }

  private userPref2RawData() {
    let o = {};
    this.mapSubjectProperties(this._g.userPrefs, o);
    return o;
  }

  private mapSubjectProperties(obj, mappedObj) {
    for (let k in obj) {
      if (obj[k] instanceof BehaviorSubject) {
        mappedObj[k] = (obj[k] as BehaviorSubject<any>).getValue();
      } else {
        mappedObj[k] = {};
        this.mapSubjectProperties(obj[k], mappedObj[k]);
      }
    }
  }

  getFilteringRules(): FilteringRule[] {
    let p = this.getUserProfile();
    if (p && p.filteringRules) {
      return p.filteringRules;
    }
    return [];
  }

  downloadProfileAsFile(isSaveSettings = true, isSaveFilteringRules = true, isSaveTimebarStats = true) {
    let p = this.getUserProfile();
    if (p) {
      if (!isSaveSettings) {
        p.userPref = undefined;
      }
      if (!isSaveFilteringRules) {
        p.filteringRules = undefined;
      }
      if (!isSaveTimebarStats) {
        p.timebarMetrics = undefined;
      }
    }
    let str = JSON.stringify(p);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(str));
    element.setAttribute('download', 'Visuall_User_Profile.vall');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  setUserProfile(txt: string) {
    localStorage.setItem('profile', txt);
    this.onLoadFromFile.next(true);
  }

  isStoreProfile() {
    let p = this.getUserProfile();
    if (!p || !p.userPref || p.userPref.isStoreUserProfile == undefined || p.userPref.isStoreUserProfile == null) {
      return this._g.userPrefs.isStoreUserProfile;
    }
    return p.userPref.isStoreUserProfile;
  }

  saveFilteringRules(f: FilteringRule[]) {
    this.setFilteringRules(f);
  }

  getTimebarMetrics(): TimebarMetric[] {
    let p = this.getUserProfile();
    if (p && p.timebarMetrics) {
      return p.timebarMetrics;
    }
    return [];
  }

  saveTimebarMetrics(t: TimebarMetric[]) {
    this.setTimebarMetrics(t);
  }

  transferUserPrefs() {
    let p = this.getUserPrefs();
    this._g.transfer2UserPrefs(p);
  }

  transferIsStoreUserProfile() {
    let p = this.getUserProfile();
    if (p && p.userPref && typeof p.userPref.isStoreUserProfile === 'boolean') {
      this._g.userPrefs.isStoreUserProfile.next(p.userPref.isStoreUserProfile);
    }
  }

  saveUserPrefs() {
    let p = this.getUserProfile();
    if (p) {
      p.userPref = this.userPref2RawData();
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      let up = this.userPref2RawData();
      localStorage.setItem('profile', JSON.stringify({ userPref: up }));
    }
  }

}
