import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF, debounce } from '../constants';
import { TableViewInput, TableFiltering } from './table-view-types';
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
  filterTxt: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  isRowChecked: boolean[] = [];
  sortingIdx: number = -1;
  isLoading: boolean = false;
  isInitialized: boolean = false;
  filterTxtChanged: () => void;
  @Input() params: TableViewInput;
  @Input() tableFilled = new Subject<boolean>();
  @Output() onPageChanged = new EventEmitter<number>();
  @Output() onFilteringChanged = new EventEmitter<TableFiltering>();
  @Output() onDataForQueryResult = new EventEmitter<number[] | string[]>();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.highlighterFn = this._cyService.highlightNeighbors();
    this._g.userPrefs.tableColumnLimit.subscribe(x => { this.columnLimit = x; if (this.params.columnLimit) { this.columnLimit = this.params.columnLimit; } });
    this.position.x = 0;
    this.position.y = 0;
    this.filterTxtChanged = debounce(this.filterBy.bind(this), 1000, false);
    this.tableFilled.subscribe(() => { this.isLoading = false; this.isInitialized = true; });
  }

  filterBy() {
    this.isLoading = true;
    this.onFilteringChanged.emit({ txt: this.filterTxt, orderBy: this.params.columns[this.sortingIdx], orderDirection: this.sortDirection });
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

  columnClicked(i: number) {
    this.isLoading = true;
    this.sortingIdx = i;
    let o = this.params.columns[i];
    if (this.sortDirection == 'asc') {
      this.sortDirection = 'desc';
    } else if (this.sortDirection == 'desc') {
      this.sortDirection = '';
    } else if (this.sortDirection == '') {
      this.sortDirection = 'asc';
    }
    this.onFilteringChanged.emit({ txt: this.filterTxt, orderBy: o, orderDirection: this.sortDirection });
  }

  cbChanged() {
    if (this.isRowChecked.length != this.params.results.length) {
      let idx = this.isRowChecked.length - 1;
      let val = this.isRowChecked[idx];
      this.isRowChecked = this.params.results.map(_ => false);
      // maintain previous value
      this.isRowChecked[idx] = val;
    }
  }

  loadGraph4Checked() {
    let ids = this.params.results.filter((_, i) => this.isRowChecked[i]).map(x => x[0].val) as number[];
    if (ids.length > 0) {
      this.onDataForQueryResult.emit(ids);
    }
  }

  cb4AllChanged() {
    if (this.isRowChecked.length != this.params.results.length) {
      this.isRowChecked = this.params.results.map(_ => false);
    }
    for (let i = 0; i < this.isRowChecked.length; i++) {
      this.isRowChecked[i] = !this.isRowChecked[i];
    }
  }

  tableStateChanged() {
    this.isDraggable = !this.isDraggable;
    this.resetPosition(this.isDraggable);
  }

}
