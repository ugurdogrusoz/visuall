import { Injectable } from '@angular/core';
import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../custom/config/app_description.json';
import { TimebarMetric } from './operation-tabs/map-tab/query-types';
import { Timebar } from '../../lib/timebar/Timebar';
import { BehaviorSubject } from 'rxjs';
import { MergedElemIndicatorTypes } from './user-preference';
import { COLLAPSED_EDGE_CLASS, COLLAPSED_NODE_CLASS } from './constants';

@Injectable({
  providedIn: 'root'
})
export class TimebarService {

  shownMetrics = new BehaviorSubject<TimebarMetric[]>(null);
  isRandomizedLayout = false;
  private _timebarExt: Timebar;
  private _playingPeriod: number;
  private _prevElems: any = null;
  isShowFromHide = false;
  showHideFn: (isHide: boolean) => void;
  rangeListenerSetterFn: () => void;
  hideCompoundsFn: (elems) => void;
  showCollapsedFn: (collapsedNodes, collapsedEdges) => void;

  constructor(private _g: GlobalVariableService) { }

  coverVisibleRange() {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.coverVisibleRange();
  }

  coverAllTimes() {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.coverAllTimes();
  }

  changeZoom(isIncrease: boolean) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.changeZoom(isIncrease);
  }

  moveCursor(isLeft: boolean) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.moveCursor(isLeft);
  }

  setChartRange(s: number, e: number) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setGraphRange(s, e);
  }

  getChartRange(): number[] {
    if (!this._timebarExt) {
      return;
    }
    return this._timebarExt.getGraphRange();
  }

  // ----------------------------------------- start of timebar settings  -----------------------------------------
  showHideTimebar(isActive: boolean) {
    // call init only once
    if (isActive && this._g.cy.$(':visible').length > 0 && !this._timebarExt) {
      this.init();
    }
    if (this._timebarExt) {
      this._timebarExt.setSetting('isEnabled', isActive);
      if (isActive) {
        this.rangeListenerSetterFn();
      }
    }
  }

  setisHideDisconnectedNodes(val: boolean) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setSetting('isHideDisconnectedNodesOnAnim', val);
  }

  changePeriod(v: number) {
    if (!this._timebarExt) {
      return;
    }
    this._playingPeriod = v;
    this._timebarExt.setSetting('playingPeriod', v);
  }

  changeStep(v: number) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setSetting('playingStep', v);
  }

  changeZoomStep(v: number) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setSetting('zoomingStep', v);
  }

  changeGraphInclusionType(i: number) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setSetting('graphInclusionType', i);
  }

  changeStatsInclusionType(i: number) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setSetting('statsInclusionType', i);
  }

  setIsMaintainGraphRange(v: boolean) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setSetting('isMaintainGraphRange', v);
  }
  // ----------------------------------------- end of timebar settings  -----------------------------------------

  onStatsChanged(f) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setEventListener('statsRangeChanged', f);
  }

  onGraphChanged(f) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.setEventListener('graphRangeChanged', f);
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    if (!this._timebarExt) {
      return;
    }
    this._timebarExt.playTiming(callback);
  }

  getCurrTimeUnit(): number {
    if (!this._timebarExt) {
      return;
    }
    return this._timebarExt.getCurrTimeUnit();
  }

  getGraphRangeRatio(): number {
    if (!this._timebarExt) {
      return;
    }
    return this._timebarExt.getGraphRangeRatio();
  }

  // this function should show only the provided elements, hide the remaining, then should make layout
  private shownOnlyElems(elems) {
    this._timebarExt.setSetting('isIgnoreElemChanges', true);
    const alreadyVisibleNodes = this._g.cy.nodes(':visible');
    if (alreadyVisibleNodes.length > 0) {
      const nodes2Show = elems.nodes().difference(alreadyVisibleNodes);
      this._g.layoutUtils.placeNewNodes(nodes2Show);
    }
    const alreadyVisible = this._g.cy.$(':visible');
    const elems2show = elems.difference(alreadyVisible);
    const elems2hide = alreadyVisible.difference(elems);
    this._g.viewUtils.show(elems);
    this.showCollapsedFn(elems.filter('.' + COLLAPSED_NODE_CLASS), elems.filter('.' + COLLAPSED_EDGE_CLASS));
    const remaining4Hide = this._g.cy.elements().difference(elems);
    // hide only non-compound nodes and edges
    this._g.viewUtils.hide(remaining4Hide);
    this.hideCompoundsFn(remaining4Hide);
    // `select` function of cytoscape should be called on visible elements
    this.handleHighlight(elems2show, elems2hide);

    const isChanged = this.hasElemsChanged(this._prevElems, elems);
    this._timebarExt.setSetting('isIgnoreElemChanges', false);
    this._prevElems = elems;
    if (!isChanged) {
      return;
    }
    if (this.isShowFromHide) {
      this.isShowFromHide = false;
      this._g.cy.fit();
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

  // only `elems` will be shown. Highlight elements to be shown "new" (previously hidden),
  // unhighlight elemenets to be hidden 
  private handleHighlight(elems2show, elems2hide) {
    const newElemIndicator = this._g.userPrefs.mergedElemIndicator.getValue();
    if (newElemIndicator == MergedElemIndicatorTypes.none) {
      return;
    }
    const isHighlightOnlyLatest = this._g.userPrefs.isOnlyHighlight4LatestQuery.getValue();

    if (isHighlightOnlyLatest) {
      if (newElemIndicator == MergedElemIndicatorTypes.highlight) {
        this._g.viewUtils.removeHighlights();
        this._g.highlightElems(elems2show);
      } else if (newElemIndicator == MergedElemIndicatorTypes.selection) {
        this._g.cy.$().unselect();
        elems2show.select();
      }
    } else {
      if (newElemIndicator == MergedElemIndicatorTypes.highlight) {
        this._g.viewUtils.removeHighlights(elems2hide);
        this._g.highlightElems(elems2show);
      } else if (newElemIndicator == MergedElemIndicatorTypes.selection) {
        elems2hide.unselect();
        elems2show.select();
      }
    }
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

  private init() {
    const m = AppDescription.timebarDataMapping; // mapping for timebar
    const s = this.getUserPrefs(); // settings for timebar
    const e = { // events (functions to be called in extension)
      maintainFiltering: (elems) => {
        return this._g.filterByClass(elems);
      },
      showOnlyElems: this.shownOnlyElems.bind(this),
      chartRendered: () => {
        const isEnabled = s.isEnabled && this._g.cy.$().length > 0;
        this.showHideFn(!isEnabled);
      },
    };
    s['events'] = e;
    s['defaultBeginDate'] = this._g.userPrefs.dbQueryTimeRange.start.getValue();
    s['defaultEndDate'] = this._g.userPrefs.dbQueryTimeRange.end.getValue();
    s['graphRangeRatio'] = AppDescription.appPreferences.timebar.graphRangeRatio;
    const htmlElems = { chartElemId: 'chart_div', controllerElemId: 'filter_div' };
    this._timebarExt = this._g.cy.timebar(m, htmlElems, s);
    this.shownMetrics.subscribe(x => { this._timebarExt.setStats(x); });
    this._g.userPrefs.dbQueryTimeRange.start.subscribe(x => {
      this._timebarExt.setSetting('defaultBeginDate', x)
    });

    this._g.userPrefs.dbQueryTimeRange.end.subscribe(x => {
      this._timebarExt.setSetting('defaultEndDate', x)
    });
  }

  private getUserPrefs(): any {
    const prefs = this._g.userPrefs.timebar;
    const r = {};
    for (const key of Object.keys(prefs)) {
      r[key] = prefs[key].getValue()
    }
    return r;
  }
}