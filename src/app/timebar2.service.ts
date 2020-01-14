import { Injectable } from '@angular/core';
import * as $ from 'jquery';

import { debounce, MIN_DATE, MAX_DATE, isClose, TIME_UNITS, MONTHS, SHORT_MONTHS, CSS_SM_TEXT_SIZE, CSS_FONT_NAME } from './constants';
import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../assets/app_description.json';
import { TimebarUnitData, TimebarItem, TimebarMetric } from './operation-tabs/filter-tab/filtering-types';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class Timebar2Service {

  windowResizer: any;
  dashboard: any;
  chartWrapper: any;
  controlWrapper: any;
  shownMetrics: TimebarMetric[] = [];
  private setStatsRangeStrFn: () => void;
  private setGraphRangeStrFn: () => void;
  private timebarExt: any;
  private textStyle = { fontSize: CSS_SM_TEXT_SIZE, fontName: CSS_FONT_NAME };
  GRAPH_RANGE_RATIO = 0.33;

  constructor(private _g: GlobalVariableService) { }

  changeShownElems(shownElems, isRandomize: boolean) {
    let alreadyVisible = this._g.cy.nodes(':visible');
    if (alreadyVisible.length > 0) {
      let shownNodes = shownElems.nodes().difference(alreadyVisible);
      this._g.layoutUtils.placeNewNodes(shownNodes);
    }
    this._g.viewUtils.show(shownElems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(shownElems));
    this._g.performLayout(isRandomize);
  }

  bindEventListeners() {
    this.windowResizer = debounce(this.controlWrapper.draw, 200, false);
    window.addEventListener('resize', this.windowResizer);
  }

  unbindEventListeners() {
    window.removeEventListener('resize', this.windowResizer);
  }

  bindCommands() {
    $('#filter_div').on('mousewheel', (e) => this.timebarExt.changeZoom(e.originalEvent.wheelDelta > 0));
  }

  unbindCommands() {
    $('#filter_div').off('mousewheel');
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    this.timebarExt.playTiming(callback);
  }

  loadGoogleChart() {
    // Load the Visualization API and the corechart package.
    google.charts.load('current', { 'packages': ['corechart', 'controls'] });

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(() => this.initChart());
  }

  initChart() {
    const dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
    const chartPaddings = { 'left': 20, 'top': 7, 'bottom': 25 };
    const controlPaddings = { 'left': 5, 'right': 5, 'bottom': 0 };
    // Create a range slider, passing some options
    let controlWrapper = new google.visualization.ControlWrapper({
      'controlType': 'ChartRangeFilter',
      'containerId': 'filter_div',
      'options': {
        'filterColumnIndex': 0,
        'ui': {
          // 'minRangeSize': '864000000',
          'chartType': 'LineChart',
          'chartOptions': {
            'colors': this.shownMetrics.map(x => x.color),
            'enableInteractivity': false,
            'chartArea': controlPaddings,
            'legend': 'none',
            'hAxis': { textStyle: this.textStyle },
            'vAxis': {
              'textPosition': 'none',
              'gridlines': { 'color': 'none' }
            },

          },
          'snapToData': false
        }
      },
    });

    let chartWrapper = new google.visualization.ChartWrapper({
      'chartType': 'ColumnChart',
      'containerId': 'chart_div',
      'options': {
        'legend': { textStyle: this.textStyle },
        'tooltip': { isHtml: true },
        // get text size of va-small-text
        'hAxis': { textStyle: this.textStyle, 'textPosition': 'in' },
        'vAxis': { textStyle: this.textStyle },
        'chartArea': chartPaddings,
        'colors': this.shownMetrics.map(x => x.color)
        // 'animation':{
        //   duration: 350,
        //   easing: 'out',
        //   'startup': true
        // },
      },
      // The pie chart will use the columns 'Name' and 'Donuts eaten'
      // out of all the available ones.
      // 'view': { 'columns': [0,1,2,3,4] }
    });

    dashboard.bind(controlWrapper, chartWrapper);
    this.dashboard = dashboard;
    this.chartWrapper = chartWrapper;
    this.controlWrapper = controlWrapper;
    window['controlWrapper'] = controlWrapper;
    window['chartWrapper'] = chartWrapper;
    // this.setChartRange(MIN_DATE, MAX_DATE);

    this.timebarExt = this._g.cy.timebar(AppDescription.timebarDataMapping, AppDescription.appPreferences.timebar, {
      getChartRange: this.getChartRange.bind(this), setChartRange: this.setChartRange.bind(this), maintainHiding: this.maintainHiding.bind(this),
      changeShownElems: this.changeShownElems.bind(this), drawData: this.drawData.bind(this), drawControl: this.drawControl.bind(this), setTicks: this.setTicksForBarChart.bind(this)
    }, this.shownMetrics);
    this.timebarExt.init();
    $('#timebar').removeClass('d-none');
    const fn = debounce(this.timebarExt.rangeChange.bind(this.timebarExt), 500, false);
    google.visualization.events.addListener(this.controlWrapper, 'statechange', fn);

    this.unbindCommands();
    this.bindCommands();
    this.unbindEventListeners();
    this.bindEventListeners();
  }

  maintainHiding(elems: any) {
    return this._g.filterByClass(elems);
  }

  drawData(arr: any[]) {
    // 'false' means the first row contains labels, not data.
    const data = google.visualization.arrayToDataTable(arr, false);
    this.dashboard.draw(data);
  }

  drawControl() {
    this.controlWrapper.draw();
  }

  setColors() {
    if (!this.chartWrapper || !this.controlWrapper) {
      return;
    }
    let colors = this.shownMetrics.map(x => x.color);
    for (let i = 0; i < colors.length; i++) {
      if (!colors[i]) {
        colors[i] = '#000000';
      }
    }
    this.chartWrapper.setOption('colors', colors);
    this.controlWrapper.setOption('ui.chartOptions.colors', colors);
  }

  setTicksForBarChart(ticks: any[]) {
    this.chartWrapper.setOption('hAxis.ticks', ticks);
    this.controlWrapper.draw();
  }

  changeZoom(isIncrease: boolean) {
    if (isIncrease) {
      this.timebarExt.zoomIn();
    } else {
      this.timebarExt.zoomOut();
    }
  }

  // get chart range from 3rd party chart library such as google charts.js
  getChartRange(): number[] {
    const curr = this.controlWrapper.getState();
    let start = curr.range.start.getTime();
    let end = curr.range.end.getTime();

    return [start, end];
  }

  // set chart range for 3rd party chart library such as google charts.js
  setChartRange(start: number, end: number) {
    if (!start || !end) {
      let [s, e] = this.getChartRange();
      if (!start) {
        start = s;
      }
      if (!end) {
        end = e;
      }
    }
    // note that chart might show a range which does not contain any data
    // to prevent that data sample count should be like 10
    if (start >= end) {
      console.log('can not set start > end ');
      debugger;
      return;
    }
    this.controlWrapper.setState({
      'range': {
        'start': new Date(start),
        'end': new Date(end)
      }
    });
    this.controlWrapper.draw();
    return 0;
  }

  moveCursor(isLeft: boolean) {
    if (isLeft) {
      this.timebarExt.backward();
    } else {
      this.timebarExt.forward();
    }
  }

  getMinMaxGraphDates() {
    return this.timebarExt.getMinMaxDates();
  }

  coverAllTimes() {
    this.timebarExt.showAllRange();
  }

  coverVisibleRange() {
    this.timebarExt.coverVisibleRange();
  }

  rangeChange(b1?: boolean, b2?: boolean) {
    this.timebarExt.rangeChange(b1, b2);
  }

  renderChart() {
    if (this.timebarExt) {
      this.timebarExt.draw();
    }
  }

  getCurrTimeUnit() {
    return this.timebarExt.getCurrTimeUnit();
  }

  showHideTimebar(isActive: boolean) {
    this._g.userPrefs.timebar.isEnabled.next(isActive);

    if (isActive) {
      this.bindEventListeners();
      this.windowResizer();
      this.bindCommands();
    } else {
      // let [s, e] = this.timebarExt.getMinMaxDates();
      // this.setChartRange(s, e);
      this.timebarExt.rangeChange(false);
      this.controlWrapper.draw();
      this.unbindEventListeners();
      this.unbindCommands();
    }
  }

  setisHideDisconnectedNodes(val: boolean) {
    this._g.userPrefs.timebar.isHideDisconnectedNodesOnAnim.next(val);
    this.timebarExt.rangeChange(false);
  }

  changeSpeed(newSpeed: number) {
    this._g.userPrefs.timebar.playingSpeed.next(newSpeed);
    this.timebarExt.setSetting('playingSpeed', newSpeed);
  }

  changeZoomStep(n: number) {
    // 0 => 0.005, 50 => 0.25, 100 => 0.5
    let v = 0.000001 * n * n + 0.00485 * n + 0.005;
    this._g.userPrefs.timebar.zoomingStep.next(v);
    this.timebarExt.setSetting('playingSpeed', v);
  }

  changeStep(newStep: number) {
    this._g.userPrefs.timebar.playingStep.next(newStep);
    this.timebarExt.setSetting('playingStep', newStep);
  }

  changeGraphInclusionType(i: number) {
    if (i < 0 || i > 2) {
      throw 'graphInclusionType is not defined'
    }
    this._g.userPrefs.timebar.graphInclusionType.next(i);
    this.timebarExt.setSetting('graphInclusionType', i);
    this.timebarExt.rangeChange(true, false);
  }

  changeStatsInclusionType(i: number) {
    if (i < 0 || i > 3) {
      throw 'statsInclusionType is not defined'
    }
    this._g.userPrefs.timebar.statsInclusionType.next(i);
    this.timebarExt.setSetting('statsInclusionType', i);
    this.timebarExt.draw();
  }

  onStatsChanged(fn: () => void) {
    this.setStatsRangeStrFn = fn;
  }

  onGraphChanged(fn: () => void) {
    this.setGraphRangeStrFn = fn;
  }

  cyElemListChanged() {
    this.timebarExt.cyElemListChanged();
  }

}


