import { Injectable } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { ApplicationRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarqueeZoomService {

  private areCtrlShiftKeysDown = false;
  private onKeyUpFn = null;
  private onKeyDownFn = null;
  private changeClassFn: (arg0: boolean) => void;

  constructor(private _g: GlobalVariableService, private cdr: ApplicationRef) {
    this.onKeyDownFn = this.onKeyDown.bind(this);
    this.onKeyUpFn = this.onKeyUp.bind(this);
  }

  init() {
    // if ('ctrl' + 'shift') or ('cmd' + 'shift') are down, enable MarqueeZoom
    document.addEventListener('keydown', this.onKeyDownFn);
    // if 'ctrl' or 'shift' or 'cmd' is up, disable MarqueeZoom
    document.addEventListener('keyup', this.onKeyUpFn);
  }

  private onKeyDown(event: KeyboardEvent) {
    if (this.areCtrlShiftKeysDown) {
      return;
    }

    // ('ctrl' + 'shift') or ('cmd' + 'shift') combinations is pressed
    if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
      this.changeCursor(true);
      this.areCtrlShiftKeysDown = true;
    }
  }

  private onKeyUp(ev: KeyboardEvent) {
    if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
      this.changeCursor(false);
      this.areCtrlShiftKeysDown = false;
    }
  }

  private changeCursor(isSetZoomMode: boolean) {
    this.changeClassFn(isSetZoomMode);
  }

  setChangeClassFn(fn: (arg0: boolean) => void) {
    this.changeClassFn = fn;
  }
}
