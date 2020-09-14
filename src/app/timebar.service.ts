import { Injectable } from '@angular/core';
import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../custom/config/app_description.json';
import { TimebarMetric } from './operation-tabs/map-tab/query-types';
import { Timebar } from '../lib/timebar/Timebar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimebarService {

  shownMetrics = new BehaviorSubject<TimebarMetric[]>(null);
  isRandomizedLayout = false;
  private _timebarExt: Timebar;
  private _playingPeriod: number;
  private _prevElems: any = null;
  showHideFn: (isHide: boolean) => void;

  constructor(private _g: GlobalVariableService) { }

  // this function should show only the provided elements, then should make layout
  private shownOnlyElems(elems) {
    const alreadyVisible = this._g.cy.nodes(':visible');
    if (alreadyVisible.length > 0) {
      const shownNodes = elems.nodes().difference(alreadyVisible);
      this._g.layoutUtils.placeNewNodes(shownNodes);
    }
    this._g.viewUtils.show(elems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(elems));

    const isChanged = this.hasElemsChanged(this._prevElems, elems);
    this._prevElems = elems;
    if (!isChanged) {
      return;
    }
    if (this.isRandomizedLayout) {
      this._g.performLayout(true, false, this._playingPeriod);
      this.isRandomizedLayout = false;
    } else {
      if (!this._g.isLoadFromHistory && !this._g.isLoadFromExpandCollapse) {
        this._g.performLayout(false, false, this._playingPeriod);
      } else {
        if (!this._g.isLoadFromExpandCollapse) {
          this._g.cy.fit();
        }
        this._g.isLoadFromHistory = false;
        this._g.isLoadFromExpandCollapse = false;
      }
    }
    this._g.shownElemsChanged.next(true);
  }

  private hasElemsChanged(prev: any, curr: any) {
    if (prev == null || curr == null) {
      return true;
    }

    const d1 = {};
    for (const i of prev) {
      d1[i.id()] = true;
    }
    for (const i of curr) {
      if (!d1[i.id()]) {
        return true;
      }
    }

    const d2 = {};
    for (const i of curr) {
      d2[i.id()] = true;
    }
    for (const i of prev) {
      if (!d2[i.id()]) {
        return true;
      }
    }
    return false;
  }

  setShowHideFn(fn: (isHide: boolean) => void) {
    this.showHideFn = fn;
  }

  init() {
    const m = AppDescription.timebarDataMapping; // mapping for timebar
    const s = AppDescription.appPreferences.timebar; // settings for timebar
    const e = { // events (functions to be called in extension)
      maintainFiltering: (elems) => {
        return this._g.filterByClass(elems);
      },
      showOnlyElems: this.shownOnlyElems.bind(this),
      chartRendered: () => {
        const isEnabled = this._g.userPrefs.timebar.isEnabled.getValue() && this._g.cy.$().length > 0;
        if (!isEnabled) {
          this.showHideFn(true);
        } else {
          this.showHideFn(false);
        }
      },
    };
    s['events'] = e;
    const htmlElems = { chartElemId: 'chart_div', controllerElemId: 'filter_div' };
    this._timebarExt = this._g.cy.timebar(m, htmlElems, s);
    this.shownMetrics.subscribe(x => { this._timebarExt.setStats(x) });
  }

  coverVisibleRange() {
    this._timebarExt.coverVisibleRange();
  }

  coverAllTimes() {
    this._timebarExt.coverAllTimes();
  }

  changeZoom(isIncrease: boolean) {
    this._timebarExt.changeZoom(isIncrease);
  }

  moveCursor(isLeft: boolean) {
    this._timebarExt.moveCursor(isLeft);
  }

  setChartRange(s: number, e: number) {
    this._timebarExt.setGraphRange(s, e);
  }

  getChartRange(): number[] {
    return this._timebarExt.getGraphRange();
  }

  // ----------------------------------------- start of timebar settings  -----------------------------------------
  showHideTimebar(isActive: boolean) {
    this._timebarExt.setSetting('isEnabled', isActive);
  }

  setisHideDisconnectedNodes(val: boolean) {
    this._timebarExt.setSetting('isHideDisconnectedNodesOnAnim', val);
  }

  changePeriod(v: number) {
    this._playingPeriod = v;
    this._timebarExt.setSetting('playingPeriod', v);
  }

  changeStep(v: number) {
    this._timebarExt.setSetting('playingStep', v);
  }

  changeZoomStep(v: number) {
    this._timebarExt.setSetting('zoomingStep', v);
  }

  changeGraphInclusionType(i: number) {
    this._timebarExt.setSetting('graphInclusionType', i);
  }

  changeStatsInclusionType(i: number) {
    this._timebarExt.setSetting('statsInclusionType', i);
  }

  setIsMaintainGraphRange(v: boolean) {
    this._timebarExt.setSetting('isMaintainGraphRange', v);
  }
  // ----------------------------------------- end of timebar settings  -----------------------------------------


  onStatsChanged(f) {
    this._timebarExt.setEventListener('statsRangeChanged', f);
  }

  onGraphChanged(f) {
    this._timebarExt.setEventListener('graphRangeChanged', f);
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    this._timebarExt.playTiming(callback);
  }

  getCurrTimeUnit(): number {
    return this._timebarExt.getCurrTimeUnit();
  }

  getGraphRangeRatio(): number {
    return this._timebarExt.getGraphRangeRatio();
  }
}


