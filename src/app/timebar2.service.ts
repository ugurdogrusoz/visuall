import { Injectable } from '@angular/core';
import * as $ from 'jquery';

import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../assets/app_description.json';
import { TimebarMetric } from './operation-tabs/filter-tab/filtering-types';
import { Timebar } from 'C:/dev/cy-ext/cytoscape.js-timebar/src/core/Timebar'
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Timebar2Service {

  shownMetrics = new BehaviorSubject<TimebarMetric[]>(null);
  private timebarExt: Timebar;

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
    this._g.performLayout(isRandomize);
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
    const htmlElems = { chartElemId: 'chart_div', controllerElemId: 'filter_div' };
    this.timebarExt = this._g.cy.timebar(m, htmlElems, s, e, this.shownMetrics.getValue());
    this.shownMetrics.subscribe(x => { this.timebarExt.setMetrics(x) });
    this.timebarExt.setColors();
  }

  cyElemListChanged() {
    this.timebarExt.cyElemListChanged();
  }

  coverVisibleRange() {
    this.timebarExt.coverVisibleRange();
  }

  coverAllTimes() {
    this.timebarExt.coverAllTimes();
  }

  changeZoom(isIncrease: boolean) {
    this.timebarExt.changeZoom(isIncrease);
  }

  moveCursor(isLeft: boolean) {
    this.timebarExt.moveCursor(isLeft);
  }

  setChartRange(s: number, e: number) {
    this.timebarExt.setChartRange(s, e);
  }

  getChartRange(): number[] {
    return this.timebarExt.getChartRange();
  }

  rangeChange(isSetCursorPos = true, isRandomize = false) {
    this.timebarExt.rangeChange(isSetCursorPos, isRandomize);
  }

  // ----------------------------------------- start of timebar settings  -----------------------------------------
  showHideTimebar(isActive: boolean) {
    this.timebarExt.showHideTimebar(isActive);
  }

  setisHideDisconnectedNodes(val: boolean) {
    this.timebarExt.setisHideDisconnectedNodes(val);
  }

  changeSpeed(v: number) {
    this.timebarExt.changeSpeed(v);
  }

  changeStep(v: number) {
    this.timebarExt.changeStep(v);
  }

  changeZoomStep(v: number) {
    this.timebarExt.changeZoomStep(v);
  }

  changeGraphInclusionType(i: number) {
    this.timebarExt.changeGraphInclusionType(i);
  }

  changeStatsInclusionType(i: number) {
    this.timebarExt.changeStatsInclusionType(i);
  }

  setIsMaintainGraphRange(v: boolean) {
    this.timebarExt.setIsMaintainGraphRange(v);
  }
  // ----------------------------------------- end of timebar settings  -----------------------------------------

  setColors() {
    if (this.timebarExt) {
      this.timebarExt.setColors();
    }
  }

  renderChart() {
    if (this.timebarExt) {
      this.timebarExt.renderChart();
    }
  }

  refreshChart() {
    this.timebarExt.refreshChart();
  }

  onStatsChanged(f) {
    this.timebarExt.setEventListener('statsRangeChanged', f);
  }

  onGraphChanged(f) {
    this.timebarExt.setEventListener('graphRangeChanged', f);
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    this.timebarExt.playTiming(callback);
  }

  getCurrTimeUnit(): number {
    return this.timebarExt.getCurrTimeUnit();
  }

  getGraphRangeRatio(): number {
    return this.timebarExt.getGraphRangeRatio();
  }
}


