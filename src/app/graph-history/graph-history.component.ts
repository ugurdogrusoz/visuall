import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { GraphHistoryItem } from '../db-service/data-types';

@Component({
  selector: 'app-graph-history',
  templateUrl: './graph-history.component.html',
  styleUrls: ['./graph-history.component.css']
})
export class GraphHistoryComponent implements OnInit {

  isShow: boolean = false;
  imgSrc: string = null;
  graphHistory: GraphHistoryItem[];
  position = { x: -130, y: 0 };
  currSize: { width: number, height: number } = { width: 250, height: 150 };
  activeItemIdx = 0;

  constructor(private _g: GlobalVariableService) { }

  ngOnInit(): void {
    this.graphHistory = this._g.graphHistory;
    this._g.showHideGraphHistory.subscribe(x => {
      this.isShow = x;
      if (x) {
        this.graphHistory = this._g.graphHistory;
      }
    });
    this._g.addNewGraphHistoryItem.subscribe(x => {
      if (x) {
        this.activeItemIdx = this._g.graphHistory.length - 1;
      }
    });
    this._g.userPrefs.queryHistoryLimit.subscribe(x => {
      while (this._g.graphHistory.length > x) {
        this._g.graphHistory.splice(0, 1);
      }
      this.graphHistory = this._g.graphHistory;
    });
  }

  load(i: number) {
    this.activeItemIdx = i;
    let g = this.graphHistory[i];
    this._g.cy.json({ elements: JSON.parse(g.json) });
    this._g.isLoadFromHistory = true;
  }

  delete(i: number) {
    this._g.graphHistory.splice(i, 1);
  }

  onMouseOver(i: number) {
    this.imgSrc = this._g.graphHistory[i].base64png;
  }

  onMouseOut() {
    this.imgSrc = null;
  }

  closeClicked() {
    this._g.showHideGraphHistory.next(false);
    this.imgSrc = null;
  }

  onMoveEnd(e) {
    this.position = e;
  }

  onResizeStop(e) {
    this.currSize = e.size;
  }
}
