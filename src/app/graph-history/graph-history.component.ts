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
  graphHistory: GraphHistoryItem[];
  position = { x: -130, y: 0 };

  constructor(private _g: GlobalVariableService) { }

  ngOnInit(): void {
    this.graphHistory = this._g.graphHistory;
    this._g.showHideGraphHistory.subscribe(
      x => {
        this.isShow = x;
        if (x) {
          this.graphHistory = this._g.graphHistory;
        }
      });
  }

  load(i: number) {
    let g = this.graphHistory[i];
    this._g.cy.json({ elements: JSON.parse(g.json) });
  }

  delete(i: number) {
    this._g.graphHistory.splice(i, 1);
  }

}
