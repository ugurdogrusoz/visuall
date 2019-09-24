import { Injectable } from '@angular/core';
import * as $ from 'jquery';

import { debounce, MIN_DATE, MAX_DATE, isClose, TIME_UNITS, MONTHS, SHORT_MONTHS } from './constants';
import { GlobalVariableService } from './global-variable.service';
import ModelDescription from '../model_description.json';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class TimebarService {

  cyElemChangeHandler: Function;
  windowResizer: any;
  statsRange1: number;
  statsRange2: number;
  times: iTimebarUnitData[];
  items: iTimebarItem[];
  onlyDates: number[];
  graphDates: number[];
  dashboard: any;
  chartWrapper: any;
  controlWrapper: any;
  cursorPos: number;
  shownMetrics: iTimebarMetric[];
  sampleCount: number;
  playTimerId: number;
  isHideDisconnectedNodes: boolean;
  playingSpeed: number;
  playingStep: number;
  zoomingStep: number = 0.2;
  private readonly IDEAL_SAMPLE_CNT: number;
  private readonly MIN_SAMPLE_CNT: number;
  private readonly MIN_ZOOM_RANGE: number;
  currTimeUnit: number;
  selectedTimeUnit: string;
  private statsInclusionType = 0;
  private graphInclusionType = 0;
  private beginPropertyName = 'begin_datetime';
  private endPropertyName = 'end_datetime';
  private defaultBeginDate = -631159200000; // 1950 
  private defaultEndDate = 2524597200000; // 2050 
  private setStatsRangeStrFn: () => void;
  private setGraphRangeStrFn: () => void;
  private GRAPH_RANGE_RATIO = 0.33;
  private dataColors = ['#3366cc', '#dc3912', '#ff9900'];
  private isRefreshChart = false;
  private ignoreEndNodesForEdgeInclusion: boolean = true;

  constructor(private _g: GlobalVariableService) {
    this.cursorPos = 0;
    this.sampleCount = 100;
    this.IDEAL_SAMPLE_CNT = 60;
    this.MIN_SAMPLE_CNT = 10;
    this.MIN_ZOOM_RANGE = 10; // means 10 ms
    this.playTimerId = -1;
    this.onlyDates = [];
    this.isHideDisconnectedNodes = false;
    this.playingSpeed = -1350;
    this.playingStep = 50;
    this.graphDates = [];
    this.currTimeUnit = 3600000;
  }

  init() {
    this.loadGoogleChart();
    this.unbindCommands();
    this.bindCommands();
    this.unbindEventListeners();
    this.bindEventListeners();
    // this.shownMetrics = [{ incrementFn: (x) => x.isBegin && x.id[0] === 'n', decrementFn: (x) => !x.isBegin && x.id[0] === 'n', name: '# of nodes' },
    // { incrementFn: (x) => x.isBegin && x.id[0] === 'e', decrementFn: (x) => !x.isBegin && x.id[0] === 'e', name: '# of edges' },
    // { incrementFn: (x) => x.isBegin, decrementFn: (x) => !x.isBegin, name: '# of nodes + # of edges' }];
    this.shownMetrics = [{ incrementFn: (x) => x.id[0] === 'n', decrementFn: (x) => false, name: '# of nodes' },
    { incrementFn: (x) => x.id[0] === 'e', decrementFn: (x) => false, name: '# of edges' },
    { incrementFn: (x) => true, decrementFn: (x) => false, name: '# of nodes + # of edges' }];
  }

  setRefreshFlag(b: boolean) {
    this.isRefreshChart = b;
  }

  bindEventListeners() {
    this.cyElemChangeHandler = debounce(this.cyElemListChanged, 200, false).bind(this);
    this._g.cy.on('add remove', this.cyElemChangeHandler);

    this.windowResizer = debounce(this.renderChart, 200, false).bind(this);
    window.addEventListener('resize', this.windowResizer);
  }

  unbindEventListeners() {
    this._g.cy.off('add remove', this.cyElemChangeHandler);
    window.removeEventListener('resize', this.windowResizer);
  }

  getTimeRange(ele: { data: object, classes: string[] }): any[] {
    ele.classes = ele.classes.map(x => x.toLowerCase());

    if (!ModelDescription.timebarDataMapping) {
      return [this.defaultBeginDate, this.defaultEndDate];
    }
    for (let c in ModelDescription.timebarDataMapping) {
      const idx = ele.classes.findIndex(x => x == c.toLowerCase());
      if (idx != -1) {
        const p1 = ModelDescription.timebarDataMapping[c][this.beginPropertyName];
        const p2 = ModelDescription.timebarDataMapping[c][this.endPropertyName];
        const v1 = ele.data[p1];
        const v2 = ele.data[p2];
        if (v1 && v2) {
          return [v1, v2];
        }
        // if there is only 1, use the same as begin and end
        else if ((v1 && !v2) || (!v1 && v2)) {
          return [v1 || v2, v1 || v2]
        }
      }
    }
    return [this.defaultBeginDate, this.defaultEndDate];
  }

  cyElemListChanged() {
    if (!this._g.isTimebarEnabled) {
      return;
    }
    const eles = this._g.cy.$().map(x => { return { data: x.data(), classes: x.classes() } });
    let times: iTimebarUnitData[] = [];
    this.items = [];

    for (let i = 0; i < eles.length; i++) {
      const [d1, d2] = this.getTimeRange(eles[i]);
      times.push({ isBegin: true, d: d1, id: eles[i].data.id });
      times.push({ isBegin: false, d: d2, id: eles[i].data.id });
      this.items.push({ start: d1, end: d2, id: eles[i].data.id });
    }
    if (times.length < 1) {
      return;
    }
    this.prepareChartData(times);
    if (this.isRefreshChart) {
      this.coverAllTimes();
      this.isRefreshChart = false;
    } else {
      this.renderChart();
      this.setStatsRangeByRatio(true);
    }
  }

  bindCommands() {
    $('#filter_div').on('mousewheel', (e) => this.changeZoom(e.originalEvent.wheelDelta > 0));
  }

  unbindCommands() {
    $('#filter_div').off('mousewheel');
  }

  prepareChartData(times: iTimebarUnitData[]) {
    if (times.length < 1) {
      return;
    }
    this.times = times;
    this.times.sort((a, b) => a.d - b.d);
    this.onlyDates = this.times.map(x => x.d);
    this.resetStatsRange();
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
            'enableInteractivity': false,
            'chartArea': controlPaddings,
            'legend': 'none',
            'hAxis': { textStyle: { fontSize: 11 } },
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
        'legend': { 'textPosition': 'right', textStyle: { fontSize: 11 } },
        'tooltip': { isHtml: true },
        // get text size of va-small-text
        'hAxis': { textStyle: { fontSize: 11 } },
        'vAxis': { textStyle: { fontSize: 11 } },
        'chartArea': chartPaddings,
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
    this.setChartRange(MIN_DATE, MAX_DATE);
    this.controlWrapper.draw();
    const fn = debounce(this.rangeChange, 500, false);
    google.visualization.events.addListener(this.controlWrapper, 'statechange', fn.bind(this));
  }

  getTimeFilteredGraphElems(start: number, end: number) {
    let elems = this._g.cy.collection();
    let propNamesSelector = '';
    // filter by begin_datetime, end_datetime
    for (let c in ModelDescription.timebarDataMapping) {
      const p1 = ModelDescription.timebarDataMapping[c][this.beginPropertyName];
      const p2 = ModelDescription.timebarDataMapping[c][this.endPropertyName];
      propNamesSelector += `[^${p1}][^${p2}]`
      let selector = '';
      if (this.graphInclusionType == 0) {
        // overlaps
        selector = `[${p1} <= ${end}][${p2} >= ${start}]`;
      } else if (this.graphInclusionType == 1) {
        // completely contains the object's lifetime
        selector = `[${p1} >= ${start}][${p2} <= ${end}]`;
      } else if (this.graphInclusionType == 2) {
        // completely contained by the object's lifetime
        selector = `[${p1} <= ${start}][${p2} >= ${end}]`;
      }
      elems = elems.union(selector);
    }

    // there might be elements that don't have begin_datetime, end_datetime properties
    elems = elems.union(propNamesSelector);
    // get nodes of edges
    if (this.ignoreEndNodesForEdgeInclusion) {
      elems = elems.union(elems.edges().connectedNodes());
    }
    return elems;
  }

  rangeChange(isSetCursorPos = true, isRandomize = false) {
    this.setGraphRangeStrFn();
    const [s, e] = this.getChartRange();
    let shownElems = this.getTimeFilteredGraphElems(s, e);
    shownElems = this._g.filterByClass(shownElems);
    if (isSetCursorPos) {
      this.cursorPos = 0;
    }
    if (this.isHideDisconnectedNodes) {
      let disconnectedComponents = shownElems.components().filter(x => x.length < 2);
      let disconnecteds = this._g.cy.collection();
      for (let i = 0; i < disconnectedComponents.length; i++) {
        disconnecteds = disconnecteds.union(disconnectedComponents[i]);
      }
      shownElems = shownElems.not(disconnecteds);
    }
    let alreadyVisible = this._g.cy.nodes(':visible');
    if (alreadyVisible.length > 0) {
      let shownNodes = shownElems.nodes().difference(alreadyVisible);
      this._g.layoutUtils.placeNewNodes(shownNodes);
    }
    this._g.viewUtils.show(shownElems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(shownElems));
    this._g.performLayout(isRandomize);
    if (this.selectedTimeUnit) {
      this.setTicksForBarChart();
    }
    this.setStatsRangeByRatio(false);
  }

  renderChart() {
    if (!this.times || this.times.length < 1) {
      console.log('there is no data to render chart');
      return;
    }
    $('#timebar').removeClass('d-none');
    this.prepareData3();
    this.controlWrapper.draw();
  }

  getVisibleRange() {
    let visibleItems = this._g.cy.filter(function (e) {
      return e.visible();
    }).map(x => { return { data: x.data(), classes: x.classes() } });

    let max = MIN_DATE;
    let min = MAX_DATE;
    for (let i = 0; i < visibleItems.length; i++) {
      const [d1, d2] = this.getTimeRange(visibleItems[i]);
      if (d1 < min) {
        min = d1;
      }
      if (d2 > max) {
        max = d2;
      }
    }

    // objects does not have date property
    if (min === MAX_DATE) {
      return [MIN_DATE, MAX_DATE];
    }
    return [min, max];
  }

  prepareData3() {
    let metricsWithTooltips = [];
    for (let m of this.shownMetrics) {
      metricsWithTooltips.push(m.name);
      metricsWithTooltips.push({ type: 'string', role: 'tooltip', p: { 'html': true } });
    }
    let arr = [['instance no', ...metricsWithTooltips]];
    let rangeStart = this.quantizeDateRange(this.statsRange1, this.statsRange2, this.IDEAL_SAMPLE_CNT);
    let rangeEnd = this.getQuantizedTime(rangeStart, true).getTime();
    this.graphDates = [];

    // push a begin date
    this.putStatDataForRange(this.statsRange1, rangeStart, this.statsRange1, arr);
    while (rangeEnd < this.statsRange2) {
      this.putStatDataForRange(rangeStart, rangeEnd, (rangeStart + rangeEnd) / 2, arr);
      rangeStart = this.getQuantizedTime(rangeStart, true).getTime();
      rangeEnd = this.getQuantizedTime(rangeStart, true).getTime();
    }
    // push an end date
    this.putStatDataForRange(rangeEnd, this.statsRange2, this.statsRange2, arr);

    this.setStatsRangeStrFn();
    this.setTicksForBarChart();
    const data = google.visualization.arrayToDataTable(arr, false); // 'false' means that the first row contains labels, not data.
    this.dashboard.draw(data);
  }

  putStatDataForRange(s: number, e: number, data4arr: number, arr: any[]) {
    let cnts = this.getStatsForRange(s, e);
    arr.push([new Date(data4arr), ...(this.getToolTippedData(s, cnts))]);
    this.graphDates.push(data4arr);
  }

  setTicksForBarChart() {
    let [s, e] = this.getChartRange();
    if (s < this.statsRange1) {
      s = this.statsRange1;
    }
    if (e > this.statsRange2) {
      e = this.statsRange2;
    }
    let rangeStart = this.getQuantizedTime(s, false).getTime();
    let ticks = [];
    while (rangeStart <= e) {
      const d = new Date(rangeStart);
      ticks.push({ v: d, f: this.getTickStrForDate(d) });
      rangeStart = this.getQuantizedTime(rangeStart, true).getTime();
    }
    const d = new Date(rangeStart);
    ticks.push({ v: d, f: this.getTickStrForDate(d) });
    this.chartWrapper.setOption('hAxis.ticks', ticks);
    this.controlWrapper.draw();
  }

  getToolTippedData(rangeStart: number, cnts: number[]) {
    const tu = this.selectedTimeUnit;
    let date = new Date(rangeStart);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayOfMonth = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let ms = date.getMilliseconds();

    let r = [];
    let s = '';
    if (tu == 'century') {
      s = year + '-' + (year + 100);
    }
    if (tu == 'decade') {
      s = year + 's';
    }
    if (tu == 'year') {
      s = year + '';
    }
    if (tu == 'quarter') {
      s = 'Quarter ' + Math.ceil(month / 3) + ' ' + year;
    }
    if (tu == 'month') {
      s = MONTHS[month - 1] + ' ' + year;
    }
    if (tu == 'week') {
      s = 'Week ' + SHORT_MONTHS[month - 1] + ' ' + dayOfMonth;
    }
    if (tu == 'day') {
      s = 'Day ' + dayOfMonth;
    }
    if (tu == 'hour') {
      s = 'Hour ' + hour;
    }
    if (tu == 'minute' || tu == '5min') {
      s = 'Minute ' + minute;
    }
    if (tu == 'second' || tu == '5sec') {
      s = 'Second ' + second;
    }
    if (tu == '50ms' || tu == 'ms') {
      s = 'Millisecond ' + ms;
    }
    let i = 0;
    for (let cnt of cnts) {
      r.push(cnt);
      r.push(`<div style="border:2px solid ${this.dataColors[i++]};">${s} <b>${cnt}</b></div>`);
    }
    return r;
  }

  getTickStrForDate(d: Date): string {
    if (this.selectedTimeUnit == 'decade' || this.selectedTimeUnit == 'century' || this.selectedTimeUnit == 'year') {
      return '' + d.getFullYear();
    }
    if (this.selectedTimeUnit == 'quarter' || this.selectedTimeUnit == 'month') {
      return '' + (d.getMonth() + 1);
    }
    if (this.selectedTimeUnit == 'week' || this.selectedTimeUnit == 'day') {
      return '' + d.getDate();
    }
    if (this.selectedTimeUnit == 'hour') {
      return '' + d.getHours();
    }
    if (this.selectedTimeUnit == 'minute' || this.selectedTimeUnit == '5min') {
      return '' + d.getMinutes();
    }
    if (this.selectedTimeUnit == 'second' || this.selectedTimeUnit == '5sec') {
      return '' + d.getSeconds();
    }
    if (this.selectedTimeUnit == '50ms' || this.selectedTimeUnit == 'ms') {
      return '' + d.getMilliseconds();
    }
    return '?';
  }

  quantizeDateRange(d1: number, d2: number, cnt: number): number {
    let range = d2 - d1;
    let minDiff = Number.MAX_SAFE_INTEGER;
    let selectedUnit = '';
    let minDiff2 = Number.MAX_SAFE_INTEGER;
    let selectedUnit2 = '';

    for (let [k, v] of Object.entries(TIME_UNITS)) {
      let candidateCnt = Math.round(range / v);
      const diff = Math.abs(candidateCnt - cnt);
      if (diff < minDiff) {
        minDiff = diff;
        selectedUnit = k;
      }
      if (diff < minDiff2 && candidateCnt > this.MIN_SAMPLE_CNT) {
        minDiff2 = diff;
        selectedUnit2 = k;
      }
    }

    if (selectedUnit2 != '') {
      selectedUnit = selectedUnit2;
    }
    this.currTimeUnit = TIME_UNITS[selectedUnit];
    this.selectedTimeUnit = selectedUnit;
    let quantizedD1 = this.getQuantizedTime(d1, true).getTime();

    return quantizedD1;
  }

  getQuantizedTime(d: number, isGreater: boolean): Date {
    const tu = this.selectedTimeUnit;
    let date = new Date(d);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayOfMonth = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let milliSecond = date.getMilliseconds();

    if (tu == 'decade' || tu == 'century') {
      const yearCnt = tu == 'decade' ? 10 : 100;
      let opt1 = year - (year % yearCnt);
      if (isGreater) {
        return new Date(opt1 + yearCnt, 0, 1);
      }
      return new Date(opt1, 0, 1);
    }
    if (tu == 'year') {
      if (isGreater) {
        return new Date(year + 1, 0, 1);
      }
      return new Date(year, 0, 1);
    }
    if (tu == 'quarter') {
      let opt1 = Math.ceil(month / 3) * 3 - 2;
      if (isGreater) {
        return new Date(year, opt1 + 2, 1);
      }
      return new Date(year, opt1, 1);
    }
    if (tu == 'month') {
      if (isGreater) {
        return new Date(year, month, 1);
      }
      return new Date(year, month - 1, 1);
    }
    if (tu == 'week') {
      let dayOfWeek = (date.getDay() + 6) % 7; // set monday is 0, sunday is 6
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth - dayOfWeek + 7);
      }
      return new Date(year, month - 1, dayOfMonth - dayOfWeek);
    }
    if (tu == 'day') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth + 1);
      }
      return new Date(year, month - 1, dayOfMonth);
    }
    if (tu == 'hour') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour);
    }
    if (tu == '5min') {
      let min = Math.floor(minute / 5) * 5;
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, min + 5);
      }
      return new Date(year, month - 1, dayOfMonth, hour, min);
    }
    if (tu == 'minute') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute);
    }
    if (tu == '5sec') {
      let sec = Math.floor(second / 5) * 5
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, sec + 5);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, sec);
    }
    if (tu == 'second') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, second + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, second);
    }
    if (tu == '50ms') {
      let ms = Math.floor(milliSecond / 50) * 50;
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, second, ms + 50);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, second, ms);
    }
    if (tu == 'ms') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, second, milliSecond + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, second, milliSecond);
    }
    throw 'unknown timeUnit: ' + tu;
  }

  changeZoom(isIncrease: boolean) {
    let [s, e] = this.getChartRange();
    const delta = e - s;

    if (delta <= this.MIN_ZOOM_RANGE && isIncrease) {
      return;
    }
    let step = Math.floor(this.zoomingStep * (delta));

    if (!isIncrease) {
      step = -step;
    }
    s += step;
    e -= step;
    if (s <= MIN_DATE) {
      return;
    }
    this.setChartRange(s, e);
    this.rangeChange(true, false);
  }

  getChartRange(): number[] {
    const curr = this.controlWrapper.getState();
    let start = curr.range.start.getTime();
    let end = curr.range.end.getTime();

    return [start, end];
  }

  setChartRange(start: number, end: number) {
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
    this.setGraphRangeStrFn();
    return 0;
  }

  moveCursor(isLeft: boolean) {
    let [start, end] = this.getChartRange();
    let delta = Math.ceil(end - start);
    let change = Math.ceil(delta * this.playingStep / 100);
    const max = this.times[this.times.length - 1].d;
    const min = this.times[0].d;
    if ((this.cursorPos === -1 && isLeft) || (this.cursorPos === 1 && !isLeft)) {
      return false;
    }

    if (change >= (start - min) && isLeft) {
      end = end - (start - min);
      start = min;
      this.cursorPos = -1;
    } else if (change >= (max - end) && !isLeft) {
      start = start + max - end;
      end = max;
      this.cursorPos = 1;
    } else if (isLeft) {
      start -= change;
      end -= change;
      this.cursorPos = 0;
    } else if (!isLeft) {
      start += change;
      end += change;
      this.cursorPos = 0;
    }

    const currMinDate = this.graphDates[0];
    const currMaxDate = this.graphDates[this.graphDates.length - 1];
    if (start >= end) {
      end = start + this.currTimeUnit;
    }

    // shift shown data range
    if (start <= currMinDate) {
      this.statsRange2 = this.statsRange2 + start - currMinDate;
      this.statsRange1 = start;
    }
    if (end >= currMaxDate) {
      this.statsRange1 = this.statsRange1 + end - currMaxDate;
      this.statsRange2 = end;
    }

    this.setChartRange(start, end);
    this.renderChart();

    let [s2, e2] = this.getChartRange();
    if (!isClose(s2, start) || !isClose(e2, end)) {
      return false;
    }
    this.rangeChange(false);
    return true;
  }

  coverAllTimes() {
    this.resetStatsRange();
    this.renderChart();
    // can not set chart range when there is no data
    this.setChartRange(this.statsRange1, this.statsRange2);
    this.rangeChange(true, true);
  }

  setStatsRangeByRatio(isCallGraphRangeStrFn: boolean) {
    let [s, e] = this.getChartRange();
    let center = (e + s) / 2;
    let diff = e - s;
    if (diff < this.MIN_ZOOM_RANGE) {
      s = center - this.MIN_ZOOM_RANGE / 2;
      e = center + this.MIN_ZOOM_RANGE / 2;
      this.setChartRange(s, e);
      diff = this.MIN_ZOOM_RANGE;
    }
    let perimeter = diff / (2 * this.GRAPH_RANGE_RATIO);
    const s1 = this.statsRange1;
    const s2 = this.statsRange2;

    this.statsRange1 = center - perimeter;
    this.statsRange2 = center + perimeter;
    const min = ModelDescription.template.timebar_min || MIN_DATE;
    const max = ModelDescription.template.timebar_max || MAX_DATE;
    if (this.statsRange1 < min) {
      this.statsRange2 += min - this.statsRange1;
      this.statsRange1 = min;
      this.setGraphRangeByRatio(s1, s2, false);
    }
    if (this.statsRange2 > max) {
      this.statsRange1 -= this.statsRange2 - max;
      this.statsRange2 = max;
      this.setGraphRangeByRatio(s1, s2, true);
    }
    this.renderChart();
    if (isCallGraphRangeStrFn) {
      this.setGraphRangeStrFn();
    }
  }

  setGraphRangeByRatio(prevStatsRange1: number, prevStatsRange2: number, isOnMax: boolean) {
    const currStatsGap = this.statsRange2 - this.statsRange1;
    const prevStatsGap = prevStatsRange2 - prevStatsRange1;

    // set graphRange/statsRange to previous state
    if (currStatsGap > prevStatsGap && !isClose(currStatsGap, prevStatsGap)) {
      if (isOnMax) {
        // let statsRange2 stay max
        this.statsRange1 = prevStatsRange1;
      } else {
        // let statsRange1 stay min
        this.statsRange2 = prevStatsRange2;
      }
    }
    this.setGraphRangeByStatsRange(this.statsRange1, this.statsRange2);
  }

  setGraphRangeByStatsRange(r1: number, r2: number) {
    const gap = r2 - r1;
    const diff = gap * (1 - this.GRAPH_RANGE_RATIO) / 2;
    const s = r1 + diff;
    const e = r2 - diff;
    this.setChartRange(s, e);
  }

  coverVisibleRange() {
    let [minVal, maxVal] = this.getVisibleRange();
    this.setChartRange(minVal, maxVal);
    this.renderChart();
    this.rangeChange(true, false);
  }

  resetStatsRange() {
    this.statsRange1 = this.onlyDates[0];
    this.statsRange2 = this.onlyDates[this.onlyDates.length - 1];
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    if (this.playTimerId < 0) {
      callback(false);
      this.playTimerId = window.setInterval(() => {
        if (this.moveCursor(false)) {
          callback(false);
          this.controlWrapper.draw();
        } else {
          this.stopPlayTimer(callback);
        }
      }, this.playingSpeed * -1);
    } else {
      this.stopPlayTimer(callback);
    }
  }

  stopPlayTimer(callback: (isShowPlay: boolean) => void) {
    callback(true);
    clearTimeout(this.playTimerId);
    this.playTimerId = -1
  }

  showHideTimebar(isActive: boolean) {
    this._g.isTimebarEnabled = isActive;

    if (isActive) {
      this.bindEventListeners();
      this.windowResizer();
      this.bindCommands();
    } else {
      this.setChartRange(this.onlyDates[0], this.onlyDates[this.onlyDates.length - 1]);
      this.rangeChange(false);
      this.controlWrapper.draw();
      this.unbindEventListeners();
      this.unbindCommands();
    }
  }

  setisHideDisconnectedNodes(val: boolean) {
    this.isHideDisconnectedNodes = val;
    this.rangeChange(false);
  }

  changeSpeed(newSpeed: number) {
    this.playingSpeed = newSpeed;
  }

  changeZoomStep(n: number) {
    // 0 => 0.005, 50 => 0.25, 100 => 0.5
    this.zoomingStep = 0.000001 * n * n + 0.00485 * n + 0.005;
  }

  changeStep(newStep: number) {
    this.playingStep = newStep;
  }

  changeGraphInclusionType(i: number) {
    if (i < 0 || i > 2) {
      throw 'graphInclusionType is not defined'
    }
    this.graphInclusionType = i;
    this.rangeChange(true, false);
  }

  changeStatsInclusionType(i: number) {
    if (i < 0 || i > 3) {
      throw 'statsInclusionType is not defined'
    }
    this.statsInclusionType = i;
    this.renderChart();
  }

  onStatsChanged(fn: () => void) {
    this.setStatsRangeStrFn = fn;
  }

  onGraphChanged(fn: () => void) {
    this.setGraphRangeStrFn = fn;
  }

  getStatsForRange(start: number, end: number): number[] {
    let eles: iTimebarItem[];
    // represent element with begin
    if (this.statsInclusionType == 1) {
      eles = this.items.filter(x => x.start >= start && x.start <= end);
    } // represent element with middle
    else if (this.statsInclusionType == 2) {
      eles = this.items.filter(x => (x.start + x.end) / 2 >= start && (x.start + x.end) / 2 <= end);
    } // represent element with end
    else if (this.statsInclusionType == 3) {
      eles = this.items.filter(x => x.end >= start && x.end <= end);
    } // represent element with range
    else if (this.statsInclusionType == 0) {
      eles = this.items.filter(x => x.start <= end && x.end >= start);
    }
    let cnts = new Array(this.shownMetrics.length).fill(0);

    for (let i = 0; i < this.shownMetrics.length; i++) {
      let m = this.shownMetrics[i];
      for (let j = 0; j < eles.length; j++) {
        if (m.incrementFn(eles[j])) {
          cnts[i]++;
        }
      }
    }
    return cnts;
  }
}

interface iTimebarMetric {
  incrementFn: (x: any) => boolean;
  decrementFn: (x: any) => boolean;
  name: string;
}

interface iTimebarUnitData {
  isBegin: boolean;
  d: number;
  id: string;
}

interface iTimebarItem {
  start: number;
  end: number;
  id: string;
}
