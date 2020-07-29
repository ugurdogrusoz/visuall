import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF, debounce } from '../constants';
import { TableViewInput, TableFiltering, TableData, getClassNameFromProperties } from './table-view-types';
import { IPosition } from 'angular2-draggable';
import { Subject, Subscription } from 'rxjs';
import { GraphElem } from '../db-service/data-types';

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
export class TableViewComponent implements OnInit, OnDestroy {
  private highlighterFn: (ev: { target: any, type: string, cySelector?: string }) => void;
  private readonly TXT_FILTER_DEBOUNCE = 1000;
  private readonly EMPHASIZE_DEBOUNCE = 50;
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
  emphasizeRowFn: Function;
  userPrefSubs: Subscription;
  hoveredElemId = '-';

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
    this.filterTxtChanged = debounce(this.filterBy.bind(this), this.TXT_FILTER_DEBOUNCE);
  }

  private resetHoverEvents() {
    this.ngOnDestroy();
    if (!this.params.isEmphasizeOnHover) {
      return;
    }
    this.userPrefSubs = this._g.userPrefs.isHighlightOnHover.subscribe(x => {
      if (x) {
        this.bindHoverListener();
      } else {
        this.unbindHoverListener();
      }
    });
  }

  private bindHoverListener() {
    if (!this.params.isEmphasizeOnHover) {
      return;
    }
    this.emphasizeRowFn = debounce(this.elemHovered.bind(this), this.EMPHASIZE_DEBOUNCE).bind(this);
    if (this.params.isNodeData) {
      this._g.cy.on('mouseover mouseout', 'node', this.emphasizeRowFn);
    } else {
      this._g.cy.on('mouseover mouseout', 'edge', this.emphasizeRowFn);
    }
  }

  private unbindHoverListener() {
    if (!this.emphasizeRowFn) {
      return;
    }
    if (this.params.isNodeData) {
      this._g.cy.off('mouseover mouseout', 'node', this.emphasizeRowFn);
    } else {
      this._g.cy.off('mouseover mouseout', 'edge', this.emphasizeRowFn);
    }
  }

  ngOnDestroy() {
    if (this.userPrefSubs) {
      this.userPrefSubs.unsubscribe();
    }
    this.unbindHoverListener();
  }

  private elemHovered(e) {
    if (e.type == 'mouseover') {
      if (this.params.isUseCySelector4Highlight) {
        this.hoveredElemId = '#' + e.target.id();
      } else {
        this.hoveredElemId = e.target.id().substr(1);
      }
    } else {
      this.hoveredElemId = '-';
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
    this.resetHoverEvents();
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
    if (this.params.isDisableHover || !this._g.userPrefs.isHighlightOnHover.getValue()) {
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
    if (this.params.isDisableHover || !this._g.userPrefs.isHighlightOnHover.getValue()) {
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

  downloadAsJSON4Checked() {
    let rows = this.params.results;
    if (!this.params.isLoadGraph) {
      rows = this.params.results.filter((_, i) => this.checkedIdx[i]);
    }

    let objs: GraphElem[] = [];
    let prefix = this.params.isNodeData ? 'n' : 'e';
    for (const r of rows) {
      const cName = getClassNameFromProperties(this.params.columns);
      const data = {};
      // first index is for ID
      for (let i = 1; i < r.length; i++) {
        data[this.params.columns[i - 1]] = r[i].val;
      }
      objs.push({ id: prefix + r[0].val, className: cName, data: data });
    }
    this._cyService.saveSelectedAsJson(objs)
  }
}
