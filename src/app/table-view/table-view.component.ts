import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF } from '../constants';
import { TableViewInput } from './table-view-types';
import { IPosition } from 'angular2-draggable';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements OnInit {

  private highlighterFn: (ev: { target: any, type: string, cySelector?: string }) => void;
  // column index is also a column
  columnLimit: number;
  isDraggable: boolean = false;
  position: IPosition = { x: 0, y: 0 };
  @Input() params: TableViewInput;
  @Input() changeState: Subject<boolean>;
  @Output() onPageChanged = new EventEmitter<number>();
  @Output() onDataForQueryResult = new EventEmitter<number>();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.highlighterFn = this._cyService.highlightNeighbors();
    this._g.userPrefs.tableColumnLimit.subscribe(x => { this.columnLimit = x; if (this.params.columnLimit) { this.columnLimit = this.params.columnLimit; } });
    this.position.x = 0;
    this.position.y = 0;
    if (this.changeState) {
      this.changeState.subscribe({ next: (isDraggable) => { this.resetPosition(isDraggable); }, error: (x) => { console.log('error in changeState.subscribe', x); } });
    }
  }

  getDataForQueryResult(id: number) {
    this.onDataForQueryResult.emit(id);
  }

  onMouseEnter(id: string) {
    if (this.params.isUseCySelector4Highlight) {
      this.highlighterFn({ target: null, type: EV_MOUSE_ON, cySelector: id });
    } else {
      let target = this._g.cy.$('#n' + id);
      if (!this.params.isNodeData) {
        target = this._g.cy.$('#e' + id);
      }
      this.highlighterFn({ target: target, type: EV_MOUSE_ON });
    }
  }

  onMouseExit(id: string) {
    if (this.params.isUseCySelector4Highlight) {
      this.highlighterFn({ target: null, type: EV_MOUSE_OFF, cySelector: id });
    } else {
      let target = this._g.cy.$('#n' + id);
      if (!this.params.isNodeData) {
        target = this._g.cy.$('#e' + id);
      }
      this.highlighterFn({ target: target, type: EV_MOUSE_OFF });
    }
  }

  pageChanged(newPage: number) {
    this.onPageChanged.emit(newPage);
  }

  isNumber(v: any) {
    return typeof v === 'number';
  }

  resetPosition(isDraggable: boolean) {
    this.isDraggable = isDraggable;
    if (this.isDraggable) {
      this.position = { x: -130, y: 0 };
    } else {
      this.position = { x: 0, y: 0 };
    }
  }

}
