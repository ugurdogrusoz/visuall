import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Timebar2Service } from '../timebar2.service';
import { TIME_UNITS, MIN_DATE, MAX_DATE } from '../constants';
import flatpickr from 'flatpickr';
import { Locale } from 'flatpickr/dist/types/locale';

@Component({
  selector: 'app-timebar',
  templateUrl: './timebar.component.html',
  styleUrls: ['./timebar.component.css']
})
export class TimebarComponent implements OnInit {

  s: Timebar2Service;
  playImg: string;
  pauseImg: string;
  currPlayIcon: string;
  statsRange1Str: string;
  statsRange2Str: string;
  cssLeftDate1: number = 0;
  cssLeftDate2: number = 0;
  @ViewChild('dateInp1', { static: false }) dateInp1: ElementRef;
  @ViewChild('dateInp2', { static: false }) dateInp2: ElementRef;

  constructor(timebarService: Timebar2Service) {
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

  private setStatsRangeStr() {
    const [d1, d2] = this.s.getStatsRange();
    if (!d1 || !d2) {
      console.log('rangeMaxDate or rangeMinDate is falsy!');
      return;
    }
    this.statsRange1Str = this.date2str(d1);
    this.statsRange2Str = this.date2str(d2);
  }

  private setGraphRangeStr() {
    const [d1, d2] = this.s.getChartRange();
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
        instance.config.onChange.push((selectedDates) => { this.s.setChartRange(selectedDates[0].getTime(), null); this.s.rangeChange(true, false); });
      } else {
        instance.config.onChange.push((selectedDates) => { this.s.setChartRange(null, selectedDates[0].getTime()); this.s.rangeChange(true, false); });
      }
    }
  }

  formatDate(date: Date, format: string, locale: Locale): string {
    return this.date2str(date);
  }

  date2str(d: number | Date): string {
    let date = d;
    if (typeof d == 'number') {
      date = new Date(d);
    }
    let s = date.toString();
    let arr = s.split(' ');
    arr.splice(0, 1);
    arr.splice(arr.length - 2, 2);
    const u = this.s.getCurrTimeUnit();
    const isGreaterThanDay = u >= TIME_UNITS['day'];
    const hasNeedMs = u < TIME_UNITS['second'];
    if (isGreaterThanDay) {
      arr.splice(arr.length - 1, 1);
    }
    s = arr.join(' ');
    if (hasNeedMs) {
      s += '.' + (date as Date).getMilliseconds();
    }
    return s;
  }

}
