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
  isRangeSet: boolean;
  rangeMinDate: number;
  rangeMaxDate: number;
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
  speed: number;
  step: number;
  private readonly IDEAL_SAMPLE_CNT: number;
  private readonly MIN_SAMPLE_CNT: number;
  currTimeUnit: number;
  selectedTimeUnit: string;
  private inclusionType = 1;
  private beginPropertyName = 'begin_datetime';
  private endPropertyName = 'end_datetime';
  private defaultBeginDate = -631159200000; // 1950 
  private defaultEndDate = 2524597200000; // 2050 

  constructor(private _g: GlobalVariableService) {
    this.cursorPos = 0;
    this.sampleCount = 100;
    this.IDEAL_SAMPLE_CNT = 60;
    this.MIN_SAMPLE_CNT = 10;
    this.playTimerId = -1;
    this.isRangeSet = false;
    this.onlyDates = [];
    this.isHideDisconnectedNodes = false;
    this.speed = -100;
    this.step = 50;
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
    this.renderChart(false);
    if (!this.isRangeSet) {
      this.setChartRange(this.rangeMinDate, this.rangeMaxDate);
      this.isRangeSet = true;
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
    this.resetMinMaxDate();
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
            }
          },
          'snapToData': false
        }
      },
      'state': {
        'range': {
          'start': new Date(MIN_DATE),
          'end': new Date(MAX_DATE)
        }
      }
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
      },
      // The pie chart will use the columns 'Name' and 'Donuts eaten'
      // out of all the available ones.
      // 'view': { 'columns': [0,1,2,3,4] }
    });

    dashboard.bind(controlWrapper, chartWrapper);
    this.dashboard = dashboard;
    this.chartWrapper = chartWrapper;
    this.controlWrapper = controlWrapper;
    const fn = debounce(this.rangeChange, 500, false);
    google.visualization.events.addListener(this.controlWrapper, 'statechange', fn.bind(this));
  }

  getTimeFilteredElems(start: number, end: number) {
    let elems = this._g.cy.collection();
    let propNamesSelector = '';
    // filter by begin_datetime, end_datetime
    for (let c in ModelDescription.timebarDataMapping) {
      const p1 = ModelDescription.timebarDataMapping[c][this.beginPropertyName];
      const p2 = ModelDescription.timebarDataMapping[c][this.endPropertyName];
      propNamesSelector += `[^${p1}][^${p2}]`
      let selector = '';
      if (this.inclusionType == 0) {
        // completely contained by
        selector = `[${p1} >= ${start}][${p2} <= ${end}]`;
      } else if (this.inclusionType == 1) {
        // overlaps
        selector = `[${p1} <= ${end}][${p2} > ${start}]`;
      } else if (this.inclusionType == 2) {
        // completely contains the gap
        selector = `[${start} >= ${p1}][${end} <= ${p2}]`;
      }
      elems = elems.union(selector);
    }

    // there might be elements that don't have begin_datetime, end_datetime properties
    elems = elems.union(propNamesSelector);
    return elems;
  }

  rangeChange(isSetCursorPos = true, isRandomize = false) {
    const [s, e] = this.getChartRange();

    let shownElems = this.getTimeFilteredElems(s, e);
    if (isSetCursorPos) {
      this.cursorPos = 0;
    }
    if (this.isHideDisconnectedNodes) {
      let edges = shownElems.edges()
      shownElems = edges.union(edges.connectedNodes());
    }
    let alreadyVisible = this._g.cy.nodes(':visible');
    let shownNodes = shownElems.nodes().difference(alreadyVisible);
    this._g.layoutUtils.placeNewNodes(shownNodes);
    this._g.viewUtils.show(shownElems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(shownElems));
    this._g.applyClassFiltering();
    this._g.performLayout(isRandomize);
    if (this.selectedTimeUnit) {
      this.setTicksForBarChart();
    }
  }

  renderChart(isSetState: boolean) {
    if (!this.times || this.times.length < 1) {
      return;
    }
    $('#timebar').removeClass('d-none');

    this.prepareData3();

    if (isSetState) {
      let [minVal, maxVal] = this.getVisibleRange();
      this.setChartRange(minVal, maxVal);
    }

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

  // stats in continous fashion
  prepareData() {

    let arr = [['instance no', ...this.shownMetrics.map(x => x.name)]];
    this.graphDates = [];
    let unitLength = (this.rangeMaxDate - this.rangeMinDate) / (this.sampleCount);
    let idx1 = 0;
    let idx2 = 0;
    let cnts = new Array(this.shownMetrics.length).fill(0);
    let previousCloses = new Array(this.shownMetrics.length).fill(0);;

    for (let i = 0; i < this.sampleCount; i++) {
      let rangeStart = this.rangeMinDate + i * unitLength;
      let rangeEnd = this.rangeMinDate + (i + 1) * unitLength;
      let dateInUnix = Math.round((rangeStart + rangeEnd) / 2);
      let avgDate = new Date(dateInUnix);

      // find index positions
      while (idx1 < this.times.length && rangeStart < this.times[idx1].d) {
        idx1++;
      }
      idx2 = idx1;
      while (idx2 < this.times.length && rangeEnd > this.times[idx2].d) {
        idx2++;
      }

      let avgCnts = new Array(this.shownMetrics.length).fill(0);

      for (let k = 0; k < cnts.length; k++) {
        let v1 = Number.MAX_SAFE_INTEGER, v2 = previousCloses[k], v3 = cnts[k], v4 = -1;
        v2 = previousCloses[k];

        for (let j = idx1 + 1; j < idx2; j++) {
          if (this.shownMetrics[k].incrementFn(this.times[j])) {
            cnts[k]++;
          }
          if (this.shownMetrics[k].decrementFn(this.times[j])) {
            cnts[k]--;
          }
          [v1, previousCloses[k], v3, v4] = this.updateRangeValues(cnts[k], v1, previousCloses[k], v3, v4)
        }
        [v1, previousCloses[k], v3, v4] = this.updateRangeValues(cnts[k], v1, previousCloses[k], v3, v4)
        avgCnts[k] = (v2 + v3) / 2;
      }

      idx1 = idx2 - 1;
      this.graphDates.push(dateInUnix);
      arr.push([avgDate, ...avgCnts]);
    }

    const data = google.visualization.arrayToDataTable(arr, false); // 'false' means that the first row contains labels, not data.
    this.dashboard.draw(data);
  }

  // time unit based stats
  prepareData2() {
    let metricsWithTooltips = [];
    for (let m of this.shownMetrics) {
      metricsWithTooltips.push(m.name);
      metricsWithTooltips.push({ type: 'string', role: 'tooltip', p: { 'html': true } });
    }
    let arr = [['instance no', ...metricsWithTooltips]];
    // let [startTime, endTime] = this.getFluctuatingRange();
    const quantizationData = this.quantizeDateRange(this.rangeMinDate, this.rangeMaxDate, this.IDEAL_SAMPLE_CNT);
    let rangeStart = quantizationData.rangeStart;
    let rangeEnd = this.getQuantizedTime(quantizationData.selectedUnit, rangeStart, true).getTime();

    let idx1 = 0;
    let idx2 = 0;
    let cnts = new Array(this.shownMetrics.length).fill(0);
    this.graphDates = [];

    while (rangeEnd < this.rangeMaxDate) {

      // rangeStart might be smaller than the first index
      if (rangeStart > this.times[0].d) {
        while (idx1 < this.times.length && rangeStart < this.times[idx1].d) {
          idx1++;
        }
      }

      idx2 = idx1;
      // rangeEnd might me smaller than the first index
      if (rangeEnd > this.times[0].d) {
        while (idx2 < this.times.length && rangeEnd > this.times[idx2].d) {
          idx2++;
        }
      } else {
        idx2++;
      }

      cnts = new Array(this.shownMetrics.length).fill(0);
      for (let k = 0; k < cnts.length; k++) {
        for (let j = idx1 + 1; j < idx2; j++) {
          if (this.shownMetrics[k].incrementFn(this.times[j])) {
            cnts[k]++;
          }
        }
      }
      idx1 = idx2 - 1;
      let tippedData = this.getToolTippedData(rangeStart, quantizationData.selectedUnit, cnts);
      arr.push([new Date(rangeStart), ...tippedData]);
      this.graphDates.push(rangeStart);
      rangeStart = this.getQuantizedTime(quantizationData.selectedUnit, rangeStart, true).getTime();
      rangeEnd = this.getQuantizedTime(quantizationData.selectedUnit, rangeStart, true).getTime();
    }

    const data = google.visualization.arrayToDataTable(arr, false); // 'false' means that the first row contains labels, not data.
    this.dashboard.draw(data);
  }

  prepareData3() {
    let metricsWithTooltips = [];
    for (let m of this.shownMetrics) {
      metricsWithTooltips.push(m.name);
      metricsWithTooltips.push({ type: 'string', role: 'tooltip', p: { 'html': true } });
    }
    let arr = [['instance no', ...metricsWithTooltips]];
    // let [startTime, endTime] = this.getFluctuatingRange();
    const quantizationData = this.quantizeDateRange(this.rangeMinDate, this.rangeMaxDate, this.IDEAL_SAMPLE_CNT);
    this.selectedTimeUnit = quantizationData.selectedUnit;
    let rangeStart = quantizationData.rangeStart;
    let rangeEnd = this.getQuantizedTime(quantizationData.selectedUnit, rangeStart, true).getTime();

    let cnts = new Array(this.shownMetrics.length).fill(0);
    this.graphDates = [];

    while (rangeEnd < this.rangeMaxDate) {
      cnts = this.getMetricsForRange(rangeStart, rangeEnd);
      let tippedData = this.getToolTippedData(rangeStart, quantizationData.selectedUnit, cnts);
      arr.push([new Date((rangeStart + rangeEnd) / 2), ...tippedData]);
      this.graphDates.push((rangeStart + rangeEnd) / 2);
      rangeStart = this.getQuantizedTime(quantizationData.selectedUnit, rangeStart, true).getTime();
      rangeEnd = this.getQuantizedTime(quantizationData.selectedUnit, rangeStart, true).getTime();
    }
    this.setTicksForBarChart();
    const data = google.visualization.arrayToDataTable(arr, false); // 'false' means that the first row contains labels, not data.
    this.dashboard.draw(data);
  }

  setTicksForBarChart() {
    let [s, e] = this.getChartRange();
    if (s < this.rangeMinDate) {
      s = this.rangeMinDate;
    }
    if (e > this.rangeMaxDate) {
      e = this.rangeMaxDate;
    }
    let rangeStart = this.getQuantizedTime(this.selectedTimeUnit, s, false).getTime();
    let ticks = [];
    while (rangeStart <= e) {
      const d = new Date(rangeStart);
      ticks.push({ v: d, f: this.getTickStrForDate(d) });
      rangeStart = this.getQuantizedTime(this.selectedTimeUnit, rangeStart, true).getTime();
    }
    const d = new Date(rangeStart);
    ticks.push({ v: d, f: this.getTickStrForDate(d) });
    this.chartWrapper.setOption('hAxis.ticks', ticks);
  }

  getToolTippedData(rangeStart: number, selectedUnit: string, cnts: number[]) {
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
    if (selectedUnit == 'century') {
      s = year + '-' + (year + 100);
    }
    if (selectedUnit == 'decade') {
      s = year + 's';
    }
    if (selectedUnit == 'year') {
      s = year + '';
    }
    if (selectedUnit == 'quarter') {
      s = 'Quarter ' + Math.ceil(month / 3) + ' ' + year;
    }
    if (selectedUnit == 'month') {
      s = MONTHS[month - 1] + ' ' + year;
    }
    if (selectedUnit == 'week') {
      s = 'Week ' + SHORT_MONTHS[month - 1] + ' ' + dayOfMonth;
    }
    if (selectedUnit == 'day') {
      s = 'Day ' + dayOfMonth;
    }
    if (selectedUnit == 'hour') {
      s = 'Hour ' + hour;
    }
    if (selectedUnit == 'minute' || selectedUnit == '5min') {
      s = 'Minute ' + minute;
    }
    if (selectedUnit == 'second' || selectedUnit == '5sec') {
      s = 'Second ' + second;
    }
    if (selectedUnit == '50ms' || selectedUnit == 'ms') {
      s = 'Millisecond ' + ms;
    }
    for (let cnt of cnts) {
      r.push(cnt);
      r.push(`${s} <b>${cnt}</b>`);
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

  getFluctuatingRange(): number[] {
    let idxLow = 0;
    for (let i = 0; i < this.times.length; i++) {
      let d = this.times[i];
      for (let j = 0; j < this.shownMetrics.length; j++) {
        let m = this.shownMetrics[j];
        if ((!m.incrementFn(d)) || this.rangeMinDate > d.d) {
          idxLow++;
        } else {
          // get out of for-for
          i = this.times.length;
          j = this.shownMetrics.length;
        }
      }
    }

    let idxHigh = this.times.length - 1;
    for (let i = this.times.length - 1; i > -1; i--) {
      let d = this.times[i];
      for (let j = 0; j < this.shownMetrics.length; j++) {
        let m = this.shownMetrics[j];
        if ((!m.incrementFn(d)) || this.rangeMaxDate < d.d) {
          idxHigh--;
        } else {
          // get out of for-for
          i = -1;
          j = this.shownMetrics.length;
        }
      }
    }

    return [this.times[idxLow].d, this.times[idxHigh].d]
  }

  quantizeDateRange(d1: number, d2: number, cnt: number): { rangeStart: number, unit: number, selectedUnit: string } {
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

    let quantizedD1 = this.getQuantizedTime(selectedUnit, d1, true).getTime();
    this.currTimeUnit = TIME_UNITS[selectedUnit];
    return { rangeStart: quantizedD1, unit: TIME_UNITS[selectedUnit], selectedUnit: selectedUnit };
  }

  getQuantizedTime(timeUnit: string, d: number, isGreater: boolean): Date {
    let date = new Date(d);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayOfMonth = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let milliSecond = date.getMilliseconds();

    if (timeUnit == 'decade' || timeUnit == 'century') {
      const yearCnt = timeUnit == 'decade' ? 10 : 100;
      let opt1 = year - (year % yearCnt);
      if (isGreater) {
        return new Date(opt1 + yearCnt, 0, 1);
      }
      return new Date(opt1, 0, 1);
    }
    if (timeUnit == 'year') {
      if (isGreater) {
        return new Date(year + 1, 0, 1);
      }
      return new Date(year, 0, 1);
    }
    if (timeUnit == 'quarter') {
      let opt1 = Math.ceil(month / 3) * 3 - 2;
      if (isGreater) {
        return new Date(year, opt1 + 2, 1);
      }
      return new Date(year, opt1, 1);
    }
    if (timeUnit == 'month') {
      if (isGreater) {
        return new Date(year, month, 1);
      }
      return new Date(year, month - 1, 1);
    }
    if (timeUnit == 'week') {
      let dayOfWeek = (date.getDay() + 6) % 7; // set monday is 0, sunday is 6
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth - dayOfWeek + 7);
      }
      return new Date(year, month - 1, dayOfMonth - dayOfWeek);
    }
    if (timeUnit == 'day') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth + 1);
      }
      return new Date(year, month - 1, dayOfMonth);
    }
    if (timeUnit == 'hour') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour);
    }
    if (timeUnit == '5min') {
      let min = Math.floor(minute / 5) * 5;
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, min + 5);
      }
      return new Date(year, month - 1, dayOfMonth, hour, min);
    }
    if (timeUnit == 'minute') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute);
    }
    if (timeUnit == '5sec') {
      let sec = Math.floor(second / 5) * 5
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, sec + 5);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, sec);
    }
    if (timeUnit == 'second') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, second + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, second);
    }
    if (timeUnit == '50ms') {
      let ms = Math.floor(milliSecond / 50) * 50;
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, second, ms + 50);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, second, ms);
    }
    if (timeUnit == 'ms') {
      if (isGreater) {
        return new Date(year, month - 1, dayOfMonth, hour, minute, second, milliSecond + 1);
      }
      return new Date(year, month - 1, dayOfMonth, hour, minute, second, milliSecond);
    }
    throw 'unknown timeUnit: ' + timeUnit;
  }

  // update min, first, last, max values for a range
  updateRangeValues(currCnt, v1, previousClose, v3, v4) {
    if (currCnt > v4) {
      v4 = currCnt;
    }
    if (currCnt < v1) {
      v1 = currCnt;
    }
    previousClose = v3;
    v3 = currCnt;

    return [v1, previousClose, v3, v4];
  }

  changeZoom(isIncrease: boolean) {
    let [s, e] = this.getChartRange();
    const m = (e + s) / 2;
    const ratio = (m - this.rangeMinDate) / (this.rangeMaxDate - this.rangeMinDate);
    let step = Math.round(0.1 * (this.rangeMaxDate - this.rangeMinDate));

    if (!isIncrease) {
      step = -step;
    }

    const oldMin = this.rangeMinDate;
    const oldMax = this.rangeMaxDate;

    this.rangeMinDate += step * ratio;
    this.rangeMaxDate -= step * (1 - ratio);

    const max = this.times[this.times.length - 1].d;
    const min = this.times[0].d;

    if (this.rangeMinDate < min) {
      this.rangeMinDate = min;
    }
    if (this.rangeMaxDate > max) {
      this.rangeMaxDate = max;
    }

    this.keepChartRange(oldMin, oldMax);
    this.renderChart(false);
    this.rangeChange();
  }

  keepChartRange(oldMin: number, oldMax: number) {
    let [start, end] = this.getChartRange();
    const oldDelta = oldMax - oldMin;
    const center = (end + start) / 2;
    const chartRange = end - start;

    const ratio = (center - oldMin) / oldDelta;
    const newDelta = this.rangeMaxDate - this.rangeMinDate;
    const newCenter = this.rangeMinDate + newDelta * ratio;
    const newChartRange = chartRange * newDelta / oldDelta;

    let newStart = newCenter - newChartRange / 2;
    let newEnd = newCenter + newChartRange / 2

    if (this.rangeMaxDate <= this.rangeMinDate) {
      console.log('set rangeMaxDate badly');
      debugger;
    }

    if (newStart >= newEnd) {
      console.log('set chart range badly');
      debugger;
    }
    this.setChartRange(newStart, newEnd);
  }

  getChartRange(): number[] {
    const curr = this.controlWrapper.getState();
    let start = curr.range.start.getTime();
    let end = curr.range.end.getTime();

    return [start, end];
  }

  setChartRange(start: number, end: number) {
    if (start < this.onlyDates[0]) {
      start = this.onlyDates[0];
    }
    if (end > this.onlyDates[this.onlyDates.length - 1]) {
      end = this.onlyDates[this.onlyDates.length - 1];
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
    return 0;
  }

  // google charts always set range from provided data
  moveCursor(isLeft: boolean) {
    let [start, end] = this.getChartRange();
    let delta = Math.ceil(end - start);
    let change = Math.ceil(delta * this.step / 100);
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
      this.rangeMaxDate = this.rangeMaxDate + start - currMinDate;
      this.rangeMinDate = start;
    }
    if (end >= currMaxDate) {
      this.rangeMinDate = this.rangeMinDate + end - currMaxDate;
      this.rangeMaxDate = end;
    }

    this.setChartRange(start, end);
    this.renderChart(false);

    let [s2, e2] = this.getChartRange();
    if (!isClose(s2, start) || !isClose(e2, end)) {
      return false;
    }
    this.rangeChange(false);
    return true;
  }

  coverAllTimes(isRenderChart: boolean, isRandomize: boolean) {
    this.resetMinMaxDate();
    if (isRenderChart) {
      this.renderChart(true);
    }
    this.rangeChange(true, isRandomize);
  }

  resetMinMaxDate() {
    this.rangeMinDate = this.onlyDates[0];
    this.rangeMaxDate = this.onlyDates[this.onlyDates.length - 1];
  }

  playTiming(callback) {
    if (this.playTimerId < 0) {
      this.playTimerId = window.setInterval(() => {
        if (this.moveCursor(false)) {
          callback(false);
          this.controlWrapper.draw();
        } else {
          this.stopPlayTimer(callback);
        }
      }, this.speed * -1);
    } else {
      this.stopPlayTimer(callback);
    }
  }

  stopPlayTimer(callback) {
    callback(true);
    clearTimeout(this.playTimerId);
    this.playTimerId = -1
  }

  statusChanged(isActive: boolean) {
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
  }

  changeSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  changeStep(newStep) {
    this.step = newStep;
  }

  changeInclusionType(i: number) {
    if (i < 0 || i > 2) {
      throw 'timebar inclusion type is not defined'
    }
    this.inclusionType = i;
  }

  getMetricsForRange(start: number, end: number): number[] {
    let eles: iTimebarItem[];
    if (this.inclusionType == 0) {
      eles = this.items.filter(x => x.start > start && x.end < end);
    } else if (this.inclusionType == 1) {
      eles = this.items.filter(x => x.start < end && x.end > start);
    } else if (this.inclusionType == 2) {
      eles = this.items.filter(x => x.start < start && x.end > end);
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
