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
    const p = localStorage.getItem('profile');
    if (!p) {
      return null;
    }
    return JSON.parse(p) as UserProfile;
  }

  private setFilteringRules(f: FilteringRule[]) {
    const p = this.getUserProfile();
    if (p) {
      p.filteringRules = f;
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      localStorage.setItem('profile', JSON.stringify({ filteringRules: [] }));
    }
  }

  private setTimebarMetrics(t: TimebarMetric[]) {
    const p = this.getUserProfile();
    if (p) {
      p.timebarMetrics = t;
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      localStorage.setItem('profile', JSON.stringify({ timebarMetrics: [] }));
    }
  }

  private getUserPrefs() {
    const p = this.getUserProfile();
    if (p) {
      return p.userPref;
    }
    return null;
  }

  private userPref2RawData() {
    const o = {};
    this.mapSubjectProperties(this._g.userPrefs, o);
    return o;
  }

  private mapSubjectProperties(obj, mappedObj) {
    for (const k in obj) {
      if (obj[k] instanceof BehaviorSubject) {
        mappedObj[k] = (obj[k] as BehaviorSubject<any>).getValue();
      } else {
        if (obj[k] instanceof Array) {
          mappedObj[k] = [];
        } else {
          mappedObj[k] = {};
        }
        this.mapSubjectProperties(obj[k], mappedObj[k]);
      }
    }
  }

  getFilteringRules(): FilteringRule[] {
    const p = this.getUserProfile();
    if (p && p.filteringRules) {
      return p.filteringRules;
    }
    return [];
  }

  downloadProfileAsFile(isSaveSettings = true, isSaveFilteringRules = true, isSaveTimebarStats = true) {
    const p = this.getUserProfile();
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
    const str = JSON.stringify(p);
    const element = document.createElement('a');
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
    const p = this.getUserProfile();
    if (!p || !p.userPref || p.userPref.isStoreUserProfile === undefined || p.userPref.isStoreUserProfile == null) {
      return this._g.userPrefs.isStoreUserProfile;
    }
    return p.userPref.isStoreUserProfile;
  }

  saveFilteringRules(f: FilteringRule[]) {
    this.setFilteringRules(f);
  }

  getTimebarMetrics(): TimebarMetric[] {
    const p = this.getUserProfile();
    if (p && p.timebarMetrics) {
      return p.timebarMetrics;
    }
    return [];
  }

  saveTimebarMetrics(t: TimebarMetric[]) {
    this.setTimebarMetrics(t);
  }

  transferUserPrefs() {
    const p = this.getUserPrefs();
    this._g.transfer2UserPrefs(p);
  }

  transferIsStoreUserProfile() {
    const p = this.getUserProfile();
    if (p && p.userPref && typeof p.userPref.isStoreUserProfile === 'boolean') {
      this._g.userPrefs.isStoreUserProfile.next(p.userPref.isStoreUserProfile);
    }
  }

  saveUserPrefs() {
    const p = this.getUserProfile();
    if (p) {
      p.userPref = this.userPref2RawData();
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      const up = this.userPref2RawData();
      localStorage.setItem('profile', JSON.stringify({ userPref: up }));
    }
  }

}
