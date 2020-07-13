import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TimebarService } from '../timebar.service';
import { TIME_UNITS, MIN_DATE, MAX_DATE } from '../constants';
import flatpickr from 'flatpickr';
import { Locale } from 'flatpickr/dist/types/locale';
import { GlobalVariableService } from '../global-variable.service';
import { debounce, HIDE_EMPTY_TIMEBAR_DELAY } from '../constants';

@Component({
  selector: 'app-timebar',
  templateUrl: './timebar.component.html',
  styleUrls: ['./timebar.component.css']
})
export class TimebarComponent implements OnInit {

  s: TimebarService;
  playImg: string;
  pauseImg: string;
  currPlayIcon: string;
  statsRange1Str: string;
  statsRange2Str: string;
  cssLeftDate1 = 0;
  cssLeftDate2 = 0;
  isHide = true;
  @ViewChild('dateInp1', { static: false }) dateInp1: ElementRef;
  @ViewChild('dateInp2', { static: false }) dateInp2: ElementRef;

  constructor(timebarService: TimebarService, private _g: GlobalVariableService) {
    this.s = timebarService;
  }

  ngOnInit() {
    this.playImg = '../assets/img/play-button.svg';
    this.pauseImg = '../assets/img/pause-symbol.svg';
    this.currPlayIcon = this.playImg;
    this.s.onStatsChanged(this.setStatsRangeStr.bind(this));
    this.s.onGraphChanged(this.setGraphRangeStr.bind(this));
    const r = this.s.getGraphRangeRatio();
    this.cssLeftDate1 = (1 - r) / 2 * 100;
    this.cssLeftDate2 = (1 + r) / 2 * 100;
    this.s.setShowHideFn(this.showHide.bind(this));
    this._g.cy.on('add remove', debounce(this.hideIfEmpty, HIDE_EMPTY_TIMEBAR_DELAY).bind(this));
  }

  playTiming() {
    this.s.playTiming(this.changePlayIcon.bind(this));
  }

  changePlayIcon(isShowPlay: boolean) {
    if (isShowPlay) {
      this.currPlayIcon = this.playImg;
    } else {
      this.currPlayIcon = this.pauseImg;
    }
  }

  private setStatsRangeStr(d1: number, d2: number) {
    if (!d1 || !d2) {
      console.log('rangeMaxDate or rangeMinDate is falsy!');
      return;
    }
    this.statsRange1Str = this.date2str(d1);
    this.statsRange2Str = this.date2str(d2);
  }

  private setGraphRangeStr(d1: number, d2: number) {
    if (!d1 || !d2) {
      console.log('rangeMaxDate or rangeMinDate is falsy!');
      return;
    }
    this.setFlatPickrInstance(this.dateInp1, d1, true);
    this.setFlatPickrInstance(this.dateInp2, d2, false);
  }

  setFlatPickrInstance(domElem: ElementRef<any>, date: number, isStart: boolean) {
    let instance = domElem.nativeElement._flatpickr;

    if (instance) {
      domElem.nativeElement._flatpickr.setDate(date);
    } else {
      instance = flatpickr(domElem.nativeElement, {
        defaultDate: new Date(date), minDate: MIN_DATE, maxDate: MAX_DATE, enableTime: true, enableSeconds: true, time_24hr: true, formatDate: this.formatDate.bind(this)
      });
      instance.setDate(date);
      if (isStart) {
        instance.config.onChange.push((selectedDates) => { this.s.setChartRange(selectedDates[0].getTime(), null); });
      } else {
        instance.config.onChange.push((selectedDates) => { this.s.setChartRange(null, selectedDates[0].getTime()); });
      }
    }
  }

  formatDate(date: Date, format: string, locale: Locale): string {
    return this.date2str(date);
  }

  date2str(d: number | Date): string {
    let date = d;
    if (typeof d === 'number') {
      date = new Date(d);
    }
    let s = date.toString();
    const arr = s.split(' ');
    arr.splice(0, 1);
    arr.splice(arr.length - 2, 2);
    const u = this.s.getCurrTimeUnit();
    const isGreaterThanDay = u >= TIME_UNITS.day;
    const hasNeedMs = u < TIME_UNITS.second;
    if (isGreaterThanDay) {
      arr.splice(arr.length - 1, 1);
    }
    s = arr.join(' ');
    if (hasNeedMs) {
      s += '.' + (date as Date).getMilliseconds();
    }
    return s;
  }

  showHide(isHide: boolean) {
    this.isHide = isHide;
  }

  hideIfEmpty() {
    if (this.isHide) {
      return;
    }
    if (this._g.cy.$().length < 1) {
      this.isHide = true;
    }
  }

}
