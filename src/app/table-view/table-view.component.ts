import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF } from '../constants';
import { iTableViewInput } from './table-view-types';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements OnInit {

  private highlighterFn: (ev: any) => void;
  @Input() params: iTableViewInput;
  @Output() onPageChanged = new EventEmitter<number>();
  @Output() onDataForQueryResult = new EventEmitter<number>();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.highlighterFn = this._cyService.highlightNeighbors();
  }

  private getDataForQueryResult(id: number) {
    this.onDataForQueryResult.emit(id);
  }

  private onMouseEnter(id: number) {
    this.highlighterFn({ target: this._g.cy.$('#n' + id), type: EV_MOUSE_ON });
  }

  private onMouseExit(id: number) {
    this.highlighterFn({ target: this._g.cy.$('#n' + id), type: EV_MOUSE_OFF });
  }

  private pageChanged(newPage: number) {
    this.onPageChanged.emit(newPage);
  }

  private isNumber(v: any) {
    return typeof v === 'number';
  }

}
