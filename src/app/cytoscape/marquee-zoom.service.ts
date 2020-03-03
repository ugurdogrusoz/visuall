import { Injectable } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { ApplicationRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarqueeZoomService {

  private areCtrlShiftKeysDown = false;
  private rect1 = null;
  private rect2 = null;
  private onKeyUpFn = null;
  private onKeyDownFn = null;
  private onTapStartFn = null;
  private onTapEndFn = null;
  private readonly ANIM_DURATION = 500;
  private changeClassFn: (arg0: boolean) => void;

  constructor(private _g: GlobalVariableService, private cdr: ApplicationRef) {
    this.onKeyDownFn = this.onKeyDown.bind(this);
    this.onKeyUpFn = this.onKeyUp.bind(this);
    this.onTapStartFn = this.onTapStart.bind(this);
    this.onTapEndFn = this.onTapEnd.bind(this);
  }

  init() {
    // if shift or ctrl key is down, emanle MarqueeZoom
    document.addEventListener('keydown', this.onKeyDownFn);
    // if shift or ctrl key is up, disable MarqueeZoom
    document.addEventListener('keyup', this.onKeyUpFn);
  }

  private onKeyDown(event: KeyboardEvent) {
    if (this.areCtrlShiftKeysDown) {
      return;
    }

    // ctrl + shift pressed
    if (event.shiftKey && (event.ctrlKey || event.keyCode == 91 || event.keyCode == 93 || event.keyCode == 224)) {
      this.changeCursor(true);
      this.areCtrlShiftKeysDown = true;
      this.rect1 = null;
      this.rect2 = null;
      //disable cytoscape shift+drage selection
      this._g.cy.autounselectify(true);

      // bind tap start event
      this._g.cy.one('tapstart', this.onTapStartFn);
      // bind tap end event
      this._g.cy.one('tapend', this.onTapEndFn);
    }
  }

  private onKeyUp(ev: KeyboardEvent) {

    if (ev.shiftKey || ev.ctrlKey || ev.keyCode == 91 || ev.keyCode == 93 || ev.keyCode == 224) {
      this.changeCursor(false);
      this.areCtrlShiftKeysDown = false;
      this.removeCyListeners();
    }
  }

  private removeCyListeners() {
    this._g.cy.off('tapstart', this.onTapStartFn);
    this._g.cy.off('tapend', this.onTapEndFn);
    this._g.cy.autounselectify(false);
  }

  private onTapEnd(ev) {
    this.rect2 = ev.position;
    // check whether corners of rectangle is undefined
    // abort shortcut zoom if one corner is undefined
    if (!this.rect1 || !this.rect2) {
      this.removeCyListeners();
      return;
    }
    //Reoder rectangle positions
    //Top left of the rectangle (rect1.x, rect1.y)
    //right bottom of the rectangle (rect2.x, rect2.y)
    if (this.rect1.x > this.rect2.x) {
      const temp = this.rect1.x;
      this.rect1.x = this.rect2.x;
      this.rect2.x = temp;
    }
    if (this.rect1.y > this.rect2.y) {
      const temp = this.rect1.y;
      this.rect1.y = this.rect2.y;
      this.rect2.y = temp;
    }

    //Extend sides of selected rectangle to 200px if less than 100px
    if (this.rect2.x - this.rect1.x < 200) {
      const extendPx = (200 - (this.rect2.x - this.rect1.x)) / 2;
      this.rect1.x -= extendPx;
      this.rect2.x += extendPx;
    }
    if (this.rect2.y - this.rect1.y < 200) {
      const extendPx = (200 - (this.rect2.y - this.rect1.y)) / 2;
      this.rect1.y -= extendPx;
      this.rect2.y += extendPx;
    }

    // Check whether rectangle intersects with bounding box of the graph
    // if not abort shortcut zoom
    const bb = this._g.cy.elements().boundingBox();
    if ((this.rect1.x > bb.x2) || (this.rect2.x < bb.x1) || (this.rect1.y > bb.y2) || (this.rect2.y < bb.y1)) {

      this.removeCyListeners();
      return;
    }

    //Calculate zoom level
    let zoomLevel = Math.min(this._g.cy.width() / (Math.abs(this.rect2.x - this.rect1.x)),
      this._g.cy.height() / Math.abs(this.rect2.y - this.rect1.y));

    let diff_x = this._g.cy.width() / 2 - (this._g.cy.pan().x + zoomLevel * (this.rect1.x + this.rect2.x) / 2);
    let diff_y = this._g.cy.height() / 2 - (this._g.cy.pan().y + zoomLevel * (this.rect1.y + this.rect2.y) / 2);

    this._g.cy.animate({
      panBy: { x: diff_x, y: diff_y },
      zoom: zoomLevel,
      duration: this.ANIM_DURATION,
      complete: function () {
        this.removeCyListeners();
      }.bind(this)
    });
  }

  private onTapStart(ev) {
    if (this.areCtrlShiftKeysDown) {
      this.rect1 = ev.position;
      this.rect2 = null;
    }
  }

  private changeCursor(isSetZoomMode: boolean) {
    this.changeClassFn(isSetZoomMode);
  }

  setChangeClassFn(fn: (arg0: boolean) => void) {
    this.changeClassFn = fn;
  }

}
