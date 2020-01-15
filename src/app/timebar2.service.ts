import { Injectable } from '@angular/core';
import * as $ from 'jquery';

import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../assets/app_description.json';
import { TimebarMetric } from './operation-tabs/filter-tab/filtering-types';


@Injectable({
  providedIn: 'root'
})
export class Timebar2Service {

  shownMetrics: TimebarMetric[];
  GRAPH_RANGE_RATIO = 0.33;
  private timebarExt: any;

  constructor(private _g: GlobalVariableService) { }

  init() {
    const m = AppDescription.timebarDataMapping; // mapping for timebar
    const s = AppDescription.appPreferences.timebar; // settings for timebar
    const e = { // events (functions to be called in extension)
      maintainFiltering: (elems) => {
        return this._g.filterByClass(elems);
      },
      showOnlyElems: (elems, isRandomize) => {
        let alreadyVisible = this._g.cy.nodes(':visible');
        if (alreadyVisible.length > 0) {
          let shownNodes = elems.nodes().difference(alreadyVisible);
          this._g.layoutUtils.placeNewNodes(shownNodes);
        }
        this._g.viewUtils.show(elems);
        this._g.viewUtils.hide(this._g.cy.elements().difference(elems));
        this._g.performLayout(isRandomize);
      },
      chartRendered: () => {
        $('#timebar').removeClass('d-none');
      }
    };
    this.timebarExt = this._g.cy.timebar(m, s, e, this.shownMetrics);
    this.timebarExt.init();
  }

  showHideTimebar(isActive: boolean) {
    this.timebarExt.showHideTimebar(isActive);
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

  getChartRange() {
    return this.timebarExt.getChartRange();
  }

  rangeChange(isSetCursorPos = true, isRandomize = false) {
    this.timebarExt.rangeChange(isSetCursorPos, isRandomize);
  }

  // ----------------------------------------- start of timebar settings  -----------------------------------------
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

  setRefreshFlag(b: boolean) {
    this.timebarExt.setRefreshFlag(b);
  }

  onStatsChanged(f) {
    this.timebarExt.onStatsChanged(f);
  }

  onGraphChanged(f) {
    this.timebarExt.onGraphChanged(f);
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    this.timebarExt.playTiming(callback);
  }

  getStatsRange() {
    return this.timebarExt.getStatsRange();
  }

  getCurrTimeUnit() {
    return this.timebarExt.getCurrTimeUnit();
  }

}


