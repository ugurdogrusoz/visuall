import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
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
  // column index is also a column
  columnLimit: number;
  isDraggable: boolean = false;
  @Input() params: iTableViewInput;
  @Output() onPageChanged = new EventEmitter<number>();
  @Output() onDataForQueryResult = new EventEmitter<number>();
  @ViewChild('content', { static: false }) divContent: ElementRef;

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.highlighterFn = this._cyService.highlightNeighbors();
    this._g.userPrefs.tableColumnLimit.subscribe(x => { this.columnLimit = x; });
  }

  getDataForQueryResult(id: number) {
    this.onDataForQueryResult.emit(id);
  }

  onMouseEnter(id: number) {
    let target = this._g.cy.$('#n' + id);
    if (!this.params.isNodeData) {
      target = this._g.cy.$('#e' + id);
    }
    this.highlighterFn({ target: target, type: EV_MOUSE_ON });
  }

  onMouseExit(id: number) {
    let target = this._g.cy.$('#n' + id);
    if (!this.params.isNodeData) {
      target = this._g.cy.$('#e' + id);
    }
    this.highlighterFn({ target: target, type: EV_MOUSE_OFF });
  }

  pageChanged(newPage: number) {
    this.onPageChanged.emit(newPage);
  }

  isNumber(v: any) {
    return typeof v === 'number';
  }
}
