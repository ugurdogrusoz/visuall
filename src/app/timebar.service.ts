import { Injectable } from '@angular/core';
import * as $ from 'jquery';

import { debounce, MIN_DATE, MAX_DATE, isClose } from './constants';
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
  minDate: number;
  maxDate: number;
  times: any[];
  onlyDates: number[];
  dashboard: any;
  chartWrapper: any;
  controlWrapper: any;
  cursorPos: number;
  shownMetrics: any[];
  sampleCount: number;
  playTimerId: number;
  isHideDisconnectedNodes: boolean;
  speed: number;
  step: number;
  private beginPropertyName = 'begin_datetime';
  private endPropertyName = 'end_datetime';
  private defaultBeginDate = -631159200000; // 1950 
  private defaultEndDate = 2524597200000; // 1950 

  constructor(private _g: GlobalVariableService) {
    this.cursorPos = 0;
    this.sampleCount = 100;
    this.playTimerId = -1;
    this.isRangeSet = false;
    this.onlyDates = [];
    this.isHideDisconnectedNodes = false;
    this.speed = -100;
    this.step = 50;
  }

  init() {
    this.loadGoogleChart();
    this.unbindCommands();
    this.bindCommands();
    this.unbindEventListeners();
    this.bindEventListeners();
    this.shownMetrics = [{ incrementFn: (x) => x.isBegin && x.id[0] === 'n', decrementFn: (x) => !x.isBegin && x.id[0] === 'n', name: '# of nodes' },
    { incrementFn: (x) => x.isBegin && x.id[0] === 'e', decrementFn: (x) => !x.isBegin && x.id[0] === 'e', name: '# of edges' },
    { incrementFn: (x) => x.isBegin, decrementFn: (x) => !x.isBegin, name: '# of nodes + # of edges' }];
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
    const eles = this._g.cy.$().filter(x => x.visible()).map(x => { return { data: x.data(), classes: x.classes() } });
    let times = [];
    for (let i = 0; i < eles.length; i++) {
      const [d1, d2] = this.getTimeRange(eles[i]);
      times.push({ isBegin: true, d: d1, id: eles[i].data.id });
      times.push({ isBegin: false, d: d2, id: eles[i].data.id });
    }
    if (times.length < 1) {
      return;
    }
    this.prepareChartData(times);
    this.renderChart(false);
    if (!this.isRangeSet) {
      this.setChartRange(this.minDate, this.maxDate);
      this.isRangeSet = true;
    }
  }

  bindCommands() {
    $('#filter_div').on('mousewheel', (e) => this.changeZoom(e.originalEvent.wheelDelta > 0));
  }

  unbindCommands() {
    $('#filter_div').off('mousewheel');
  }

  prepareChartData(times) {
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
          'snapToData': true
        }
      },
      'state': {
        'range': {
          'start': new Date(2019, 3, 9),
          'end': new Date(2019, 3, 10)
        }
      }
    });

    let chartWrapper = new google.visualization.ChartWrapper({
      'chartType': 'ColumnChart',
      'containerId': 'chart_div',
      'options': {
        'legend': { 'textPosition': 'right', textStyle: { fontSize: 11 } },
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
      const selector = `[${p1} <= ${end}][${p2} > ${start}]`;
      propNamesSelector += `[^${p1}][^${p2}]`
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
    var alreadyVisible = this._g.cy.nodes(':visible');
    var shownNodes = shownElems.nodes().difference(alreadyVisible);
    this._g.layoutUtils.placeNewNodes(shownNodes);
    this._g.viewUtils.show(shownElems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(shownElems));
    this._g.applyClassFiltering();
    this._g.performLayout(isRandomize);
  }

  renderChart(isSetState) {
    if (!this.times || this.times.length < 1) {
      return;
    }
    $('#timebar').removeClass('d-none');

    this.prepareData();

    if (isSetState) {
      let [minVal, maxVal] = this.getVisibleRange();
      this.setChartRange(new Date(minVal), new Date(maxVal));
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

  prepareData() {

    let arr = [['instance no', ...this.shownMetrics.map(x => x.name)]];
    let unitLength = (this.maxDate - this.minDate) / (this.sampleCount);
    let idx1 = 0;
    let idx2 = 0;
    let cnts = new Array(this.shownMetrics.length).fill(0);
    let previousCloses = new Array(this.shownMetrics.length).fill(0);;

    for (let i = 0; i < this.sampleCount; i++) {
      let rangeStart = this.minDate + i * unitLength;
      let rangeEnd = this.minDate + (i + 1) * unitLength;
      let avgDate = new Date(Math.round((rangeStart + rangeEnd) / 2));

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
      arr.push([avgDate, ...avgCnts]);
    }

    const data = google.visualization.arrayToDataTable(arr, false); // 'false' means that the first row contains labels, not data.
    this.dashboard.draw(data);
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

  // assumes array is sorted
  // return the index of closest element (might be great or less)
  findClosest(arr, x, isUpperBound) {
    let i1 = 0;
    let i2 = arr.length - 1;

    while (i1 < i2) {
      let i3 = Math.round((i1 + i2) / 2);
      let curr = arr[i3];
      if (curr == x) {
        return i3;
      } else if (curr > x) {
        if (i3 === i2) {
          break;
        }
        i2 = i3;
      } else if (curr < x) {
        if (i3 === i1) {
          break;
        }
        i1 = i3;
      }
    }
    if (isUpperBound) {
      return i2;
    }
    return i1;
  }

  changeZoom(isIncrease) {
    let [s, e] = this.getChartRange();
    const m = (e + s) / 2;
    const ratio = (m - this.minDate) / (this.maxDate - this.minDate);
    let step = Math.round(0.1 * (this.maxDate - this.minDate));

    if (!isIncrease) {
      step = -step;
    }

    const oldMin = this.minDate;
    const oldMax = this.maxDate;

    this.minDate += step * ratio;
    this.maxDate -= step * (1 - ratio);

    const max = this.times[this.times.length - 1].d;
    const min = this.times[0].d;

    if (this.minDate < min) {
      this.minDate = min;
    }
    if (this.maxDate > max) {
      this.maxDate = max;
    }

    this.keepChartRange(oldMin, oldMax);
    this.renderChart(false);
    this.rangeChange();
  }

  keepChartRange(oldMin, oldMax) {
    let [start, end] = this.getChartRange();
    const oldDelta = oldMax - oldMin;

    const ratio1 = (start - oldMin) / oldDelta;
    const ratio2 = (oldMax - end) / oldDelta;

    const newDelta = this.maxDate - this.minDate;
    let newStart = ratio1 * newDelta + this.minDate;
    let newEnd = this.maxDate - ratio2 * newDelta;

    this.setChartRange(newStart, newEnd);
  }

  getChartRange() {
    const curr = this.controlWrapper.getState();
    let start = curr.range.start.getTime();
    let end = curr.range.end.getTime();

    return [start, end];
  }

  setChartRange(start, end) {
    if (start < this.onlyDates[0] || end > this.onlyDates[this.onlyDates.length - 1]) {
      return -1;
    }
    this.controlWrapper.setState({
      'range': {
        'start': new Date(start),
        'end': new Date(end)
      }
    });
    return 0;
  }

  moveCursor(isLeft, step = 0.5) {
    //chage the step and speed here 
    //initial step is 0.5 s will divide the parameter with 100
    //step = step / 100;
    //  this.step = this.step /100;
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

    // shift shown data range
    if (start <= this.minDate) {
      this.maxDate = this.maxDate + start - this.minDate;
      this.minDate = start;
    }
    if (end >= this.maxDate) {
      this.minDate = this.minDate + end - this.maxDate;
      this.maxDate = end;
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

  coverAllTimes(isSetState, isRandomize = true) {
    this.resetMinMaxDate();
    this.renderChart(isSetState);
    this.rangeChange(true, isRandomize);
  }

  resetMinMaxDate() {
    this.minDate = this.onlyDates[0];
    this.maxDate = this.onlyDates[this.onlyDates.length - 1];
  }

  playTiming(callback) {
    console.log(this.speed);
    console.log("this is the speed inside the timebar serv,ce ");
    let [s, e] = this.getChartRange();
    if (this.playTimerId < 0) {

      this.playTimerId = window.setInterval(() => {
        if (this.moveCursor(false, 0.1)) {
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
}


