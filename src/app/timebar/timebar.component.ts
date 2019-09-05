import { Component, OnInit } from '@angular/core';
import { TimebarService } from '../timebar.service';
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
  rangeStartStr: string;
  rangeEndStr: string;

  constructor(timebarService: TimebarService) {
    this.s = timebarService;
  }

  ngOnInit() {
    this.playImg = '../assets/img/play-button.svg';
    this.pauseImg = '../assets/img/pause-symbol.svg';
    this.currPlayIcon = this.playImg;
    this.s.onVisibleRangeChanged(this.setRangeStrings.bind(this));
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
  private setRangeStrings() {
    const d1 = this.s.graphDates[0];
    const d2 = this.s.graphDates[this.s.graphDates.length - 1];
    if (!d1 || !d2) {
      console.log('rangeMaxDate or rangeMinDate is falsy!');
      return;
    }
    this.rangeStartStr = this.date2str(d1);
    this.rangeEndStr = this.date2str(d2);
  }

  date2str(d: number): string {
    const date = new Date(d);
    let s = date.toString();
    let arr = s.split(' ');
    arr.splice(0, 1);
    arr.splice(arr.length - 2, 2);
    s = arr.join(' ');
    s += '.' + date.getMilliseconds(); 
    return s;
  }

}