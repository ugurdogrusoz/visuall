import { Component, OnInit } from '@angular/core';
import { TimebarService } from '../timebar.service';
import { TIME_UNITS } from '../constants';

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
  graphRange1Str: string;
  graphRange2Str: string;

  constructor(timebarService: TimebarService) {
    this.s = timebarService;
  }

  ngOnInit() {
    this.playImg = '../assets/img/play-button.svg';
    this.pauseImg = '../assets/img/pause-symbol.svg';
    this.currPlayIcon = this.playImg;
    this.s.onStatsChanged(this.setStatsRangeStr.bind(this));
    this.s.onGraphChanged(this.setGraphRangeStr.bind(this));
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
    const d1 = this.s.graphDates[0];
    const d2 = this.s.graphDates[this.s.graphDates.length - 1];
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
    this.graphRange1Str = this.date2str(d1);
    this.graphRange2Str = this.date2str(d2);
  }

  date2str(d: number): string {
    const date = new Date(d);
    let s = date.toString();
    let arr = s.split(' ');
    arr.splice(0, 1);
    arr.splice(arr.length - 2, 2);
    const isGreaterThanDay = this.s.currTimeUnit >= TIME_UNITS['day'];
    const hasNeedMs = this.s.currTimeUnit < TIME_UNITS['second'];
    if (isGreaterThanDay) {
      arr.splice(arr.length-1, 1);
    }
    s = arr.join(' ');
    if (hasNeedMs) {
      s += '.' + date.getMilliseconds(); 
    }
    return s;
  }

}
