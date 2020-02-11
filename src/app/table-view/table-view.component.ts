import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF, debounce } from '../constants';
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
  filterTxt: string = '';
  isInitial: boolean = true;
  isRowVisible: boolean[] = [];
  isRowChecked: boolean[] = [];
  sortingIdx: number = -1;
  sortDirection: 'asc' | 'desc' | '' = '';
  filterTxtChanged: () => void;
  @Input() params: TableViewInput;
  @Input() changeState: Subject<boolean>;
  @Output() onPageChanged = new EventEmitter<number>();
  @Output() onDataForQueryResult = new EventEmitter<number[] | string[]>();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.highlighterFn = this._cyService.highlightNeighbors();
    this._g.userPrefs.tableColumnLimit.subscribe(x => { this.columnLimit = x; if (this.params.columnLimit) { this.columnLimit = this.params.columnLimit; } });
    this.position.x = 0;
    this.position.y = 0;
    if (this.changeState) {
      this.changeState.subscribe({ next: (isDraggable) => { this.resetPosition(isDraggable); }, error: (x) => { console.log('error in changeState.subscribe', x); } });
    }
    this.filterTxtChanged = debounce(this.filterBy.bind(this), 100, false);

  }

  filterBy() {
    if (!this.filterTxt || this.filterTxt.length < 1) {
      this.isRowVisible = this.params.results.map(_ => true);
      return;
    }
    this.isInitial = false;
    this.isRowVisible = [];

    for (let i = 0; i < this.params.results.length; i++) {
      this.isRowVisible.push(true);
      let anyMatch = false;
      // first column is ID
      for (let j = 1; j < this.params.results[i].length; j++) {
        let curr = this.params.results[i][j];
        if ((curr.val + '').toLowerCase().includes(this.filterTxt.toLowerCase())) {
          anyMatch = true;
        }
      }
      if (!anyMatch) {
        this.isRowVisible[this.isRowVisible.length - 1] = false;
      }
    }
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
    this.sortingIdx = i;
    if (this.sortDirection == 'asc') {
      this.params.results.sort((a, b) => a[i + 1].val < b[i + 1].val ? 1 : a[i + 1].val > b[i + 1].val ? -1 : 0);
      this.sortDirection = 'desc';
    } else if (this.sortDirection == 'desc') {
      this.params.results.sort(() => Math.random() - 0.5);
      this.sortDirection = '';
    } else if (this.sortDirection == '') {
      this.params.results.sort((a, b) => a[i + 1].val < b[i + 1].val ? -1 : a[i + 1].val > b[i + 1].val ? 1 : 0);
      this.sortDirection = 'asc';
    }
  }

  cbChanged() {
    if (this.isRowChecked.length != this.params.results.length) {
      this.isRowChecked = this.params.results.map(_ => false);
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
