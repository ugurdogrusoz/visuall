import { Component, OnInit, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as AColorPicker from 'a-color-picker';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

  @Output() onColorSelected = new EventEmitter<string>();
  constructor(private _modalService: NgbModal) { }
  pickedColors: string[] = [];
  picker: AColorPicker.ACPController = null;
  @Input() currColor: string;

  ngOnInit() { }

  open(ev: MouseEvent, content) {
    ev.preventDefault();
    // style="width: 232px; height: 363px;"
    this._modalService.open(content, { windowClass: 'picker-window' }).result.then((result) => {
      this.onColorSelected.emit(this.currColor);
    }, (reason) => {
      this.onColorSelected.emit(this.currColor);
    });
    this.setPicker();
  }

  private setPicker() {

    this.picker = AColorPicker.from('.picker', { palette: this.pickedColors })[0];
    this.picker.color = this.currColor;
    this.picker.off('change');
    this.picker.on('change', (_, color) => {
      this.currColor = AColorPicker.parseColor(color, 'hex')
    });
    this.picker.off('coloradd');
    this.picker.on('coloradd', (_, color) => {
      this.pickedColors.push(AColorPicker.parseColor(color, 'hex'));
    });
    this.picker.off('colorremove');
    this.picker.on('colorremove', (_, color) => {
      const c = AColorPicker.parseColor(color, 'hex');
      const i = this.pickedColors.findIndex(x => x == c);
      if (i > -1) {
        this.pickedColors.splice(i, 1);
      }
    });
  }

  static getAntiColor(color: string) {
    if (color[0] == '#') {
      color = color.slice(1, color.length);
    }
    let r = parseInt(color.slice(0, 2), 16);
    let g = parseInt(color.slice(2, 4), 16);
    let b = parseInt(color.slice(4, 6), 16);

    let rVal = 'FF';
    let gVal = 'FF';
    let bVal = 'FF';

    if (r > 128) {
      rVal = '00';
    }

    if (g > 128) {
      gVal = '00';
    }

    if (b > 128) {
      bVal = '00';
    }

    return '#' + rVal + gVal + bVal
  }

  static mapColor(colorEnd: string, valueEnd: number, val: number) {
    if (colorEnd[0] == '#') {
      colorEnd = colorEnd.slice(1, colorEnd.length);
    }
    let r = parseInt(colorEnd.slice(0, 2), 16);
    let g = parseInt(colorEnd.slice(2, 4), 16);
    let b = parseInt(colorEnd.slice(4, 6), 16);

    let rVal = Math.round(r + (255 - r) * (1 - val / valueEnd)).toString(16);
    let gVal = Math.round(g + (255 - g) * (1 - val / valueEnd)).toString(16);
    let bVal = Math.round(b + (255 - b) * (1 - val / valueEnd)).toString(16);
    if (rVal.length < 2) {
      rVal = '0' + rVal;
    }
    if (gVal.length < 2) {
      gVal = '0' + gVal;
    }
    if (bVal.length < 2) {
      bVal = '0' + bVal;
    }
    return '#' + rVal + gVal + bVal
  }

}
