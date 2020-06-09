import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF, debounce } from '../constants';
import { TableViewInput, TableFiltering } from './table-view-types';
import { IPosition } from 'angular2-draggable';
import { Subject } from 'rxjs';

@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {

    if (!value || !strToReplace || !replacementStr) {
      return value;
    }

    return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}
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
  sortingIdx: number = -1;
  isLoading: boolean = false;
  isShowTable: boolean = false;
  filterTxtChanged: () => void;
  @ViewChild('dynamicDiv', { static: false }) dynamicDiv;
  checkedIdx: any = {};
  selectFn: Function;
  idsOfSelected = {};

  @Input() params: TableViewInput;
  @Input() tableFilled = new Subject<boolean>();
  @Input() clearFilter = new Subject<boolean>();
  @Output() onFilteringChanged = new EventEmitter<TableFiltering>();
  @Output() onDataForQueryResult = new EventEmitter<{ dbIds: number[] | string[], tableIdx: number[] }>();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.tableFilled.subscribe(this.onTableFilled.bind(this));
    this.clearFilter.subscribe(this.onClearFilter.bind(this));
    this._g.userPrefs.tableColumnLimit.subscribe(x => { this.columnLimit = x; if (this.params.columnLimit) { this.columnLimit = this.params.columnLimit; } });
    this.highlighterFn = this._cyService.highlightNeighbors();
    this.position.x = 0;
    this.position.y = 0;
    this.filterTxtChanged = debounce(this.filterBy.bind(this), 1000);
    if (this.params.isHightlightSelected) {
      this.selectFn = this.elemSelectionChanged.bind(this);
      this._g.cy.on('select unselect', this.selectFn);
    }
  }

  ngOnDestroy() {
    if (this.params.isHightlightSelected) {
      this._g.cy.off('select unselect', this.selectFn);
    }
  }

  private elemSelectionChanged() {
    this.idsOfSelected = {};
    const ids = this._g.cy.$(':selected').map(x => x.id());
    for (const id of ids) {
      this.idsOfSelected[id.substr(1)] = true;
    }
  }

  private onTableFilled() {
    this.isLoading = false;
    this.checkedIdx = {};
    if (this.params.results && this.params.results.length > 0) {
      this.isShowTable = true;
    } else if (this.filterTxt.length == 0) {
      this.isShowTable = false;
    }
  }

  private onClearFilter() {
    this.filterTxt = '';
    this.sortingIdx = -1;
    this.sortDirection = '';
  }

  filterBy() {
    this.isLoading = true;
    this.onFilteringChanged.emit({ txt: this.filterTxt, orderBy: this.params.columns[this.sortingIdx], orderDirection: this.sortDirection });
  }

  onMouseEnter(id: string) {
    if (this.params.isDisableHover) {
      return;
    }
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
    if (this.params.isDisableHover) {
      return;
    }
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
    let o = this.params.columns[this.sortingIdx];
    let skip = (newPage - 1) * this.params.pageSize;
    this.onFilteringChanged.emit({ txt: this.filterTxt, orderBy: o, orderDirection: this.sortDirection, skip: skip });
  }

  isNumber(v: any) {
    return typeof v === 'number';
  }

  resetPosition(isDraggable: boolean) {
    this.isDraggable = isDraggable;
    if (this.isDraggable) {
      this.position = { x: -130, y: 0 };
      this.columnLimit = this.params.columns.length;
    } else {
      this.position = { x: 0, y: 0 };
      this.columnLimit = this._g.userPrefs.tableColumnLimit.getValue();
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

  cbChanged(idx: number, isChecked: boolean) {
    delete this.checkedIdx[idx];

    if (isChecked) {
      this.checkedIdx[idx] = true;
    }
  }

  loadGraph4Checked() {
    // index 0 keeps database IDs
    let dbIds = this.params.results.filter((_, i) => this.checkedIdx[i]).map(x => x[0].val) as number[];
    let idxes = [];
    for (let i in this.checkedIdx) {
      idxes.push(Number(i) + 1);
    }
    if (dbIds.length > 0) {
      this.onDataForQueryResult.emit({ dbIds: dbIds, tableIdx: idxes });
    }
  }

  cb4AllChanged(isChecked: boolean) {
    this.checkedIdx = {};
    let elems = document.getElementsByClassName('row-cb');
    let elemsArr: HTMLInputElement[] = [];
    for (let i = 0; i < elems.length; i++) {
      elemsArr.push(elems[i] as HTMLInputElement);
    }
    elemsArr = elemsArr.filter(x => !x.parentElement.hidden);

    if (isChecked) {
      for (let i = 0; i < this.params.results.length; i++) {
        this.checkedIdx[i] = true;
        elemsArr[i].checked = true;
      }
    } else {
      for (let i = 0; i < elemsArr.length; i++) {
        elemsArr[i].checked = false;
      }
    }
  }

  tableStateChanged() {
    this.isDraggable = !this.isDraggable;
    this.resetPosition(this.isDraggable);
    if (!this.isDraggable) {
      const e = this.dynamicDiv.nativeElement;
      e.style.width = '';
      e.style.height = '';
    }
  }
}
