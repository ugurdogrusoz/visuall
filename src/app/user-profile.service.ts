import { Injectable } from '@angular/core';
import { UserProfile } from './user-preference';
import { FilteringRule, TimebarMetric } from './operation-tabs/map-tab/filtering-types';
import { BehaviorSubject } from 'rxjs';
import { GlobalVariableService } from './global-variable.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private _g: GlobalVariableService) { }

  private getUserProfile() {
    let p = localStorage.getItem('profile');
    if (!p) {
      return null;
    }
    return JSON.parse(p) as UserProfile;
  }

  getFilteringRules(): FilteringRule[] {
    let p = this.getUserProfile();
    if (p && p.filteringRules) {
      return p.filteringRules;
    }
    return [];
  }

  isStoreProfile() {
    let p = this.getUserProfile();
    if (!p || !p.userPref || p.userPref.isStoreUserProfile == undefined || p.userPref.isStoreUserProfile == null) {
      return this._g.userPrefs.isStoreUserProfile;
    }
    return p.userPref.isStoreUserProfile;
  }

  saveFilteringRulesIfWanted(f: FilteringRule[]) {
    if (this._g.userPrefs.isStoreUserProfile.getValue()) {
      this.setFilteringRules(f);
    }
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

  getTimebarMetrics(): TimebarMetric[] {
    let p = this.getUserProfile();
    if (p && p.timebarMetrics) {
      return p.timebarMetrics;
    }
    return [];
  }

  saveTimebarMetricsIfWanted(t: TimebarMetric[]) {
    if (this.isStoreProfile()) {
      this.setTimebarMetrics(t);
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

  private getUserPrefs() {
    let p = this.getUserProfile();
    if (p) {
      return p.userPref;
    }
    return null;
  }

  setUserPrefs() {
    let p = this.getUserProfile();
    if (p) {
      p.userPref = this.userPref2RawData();
      localStorage.setItem('profile', JSON.stringify(p));
    } else {
      let up = this.userPref2RawData();
      localStorage.setItem('profile', JSON.stringify({ userPref: up }));
    }
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
}
