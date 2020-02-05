import { Injectable } from '@angular/core';
import * as $ from 'jquery';
import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../assets/app_description.json';
import { TimebarMetric } from './operation-tabs/map-tab/filtering-types';
import { Timebar } from '../lib/timebar/Timebar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimebarService {

  shownMetrics = new BehaviorSubject<TimebarMetric[]>(null);
  isRandomizedLayout : boolean = false;
  private _timebarExt: Timebar;
  private _playingPeriod: number;

  constructor(private _g: GlobalVariableService) { }

  // this function should show only the provided elements, then should make layout
  private shownOnlyElems(elems, isRandomize: boolean) {
    let alreadyVisible = this._g.cy.nodes(':visible');
    if (alreadyVisible.length > 0) {
      let shownNodes = elems.nodes().difference(alreadyVisible);
      this._g.layoutUtils.placeNewNodes(shownNodes);
    }
    this._g.viewUtils.show(elems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(elems));
    if (this.isRandomizedLayout) {
      this._g.performLayout(true, false, this._playingPeriod);
      this.isRandomizedLayout = false;
    } else {
      this._g.performLayout(false, false, this._playingPeriod);
    }
    this._g.shownElemsChanged.next(true);
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
        $('#timebar').removeClass('d-none');
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


