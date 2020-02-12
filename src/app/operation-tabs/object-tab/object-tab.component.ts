import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GlobalVariableService } from '../../global-variable.service';
import { getPropNamesFromObj, DATE_PROP_END, DATE_PROP_START, findTypeOfAttribute, debounce } from '../../constants';
import properties from '../../../assets/generated/properties.json';
import * as $ from 'jquery';
import AppDescription from '../../../assets/app_description.json';
import { TableViewInput, TableData, TableDataType, TableFiltering } from 'src/app/table-view/table-view-types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-object-tab',
  templateUrl: './object-tab.component.html',
  styleUrls: ['./object-tab.component.css']
})
export class ObjectTabComponent implements OnInit {

  nodeClasses: Set<string>;
  edgeClasses: Set<string>;
  selectedClasses: string;
  selectedItemProps: any[];
  tableFilled = new Subject<boolean>();

  @Output() onTabChanged = new EventEmitter<number>();
  tableInput: TableViewInput = {
    columns: ['Type', 'Count', 'Selected', 'Hidden'], isHide0: true, results: [], resultCnt: 0, currPage: 1, pageSize: 20,
    isLoadGraph: true, columnLimit: 5, isMergeGraph: false, isNodeData: false, isUseCySelector4Highlight: true, isHideLoadGraph: true
  };
  private NODE_TYPE = '_NODE_';
  private EDGE_TYPE = '_EDGE_';

  constructor(private _g: GlobalVariableService) {
    this.selectedItemProps = [];
  }

  ngOnInit() {
    let showPropFn = debounce(this.showObjectProps, 200, false);
    this._g.cy.on('select unselect', showPropFn.bind(this));
    properties.edges = properties.edges;
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
    for (const key in properties.nodes) {
      this.nodeClasses.add(key);
    }

    for (const key in properties.edges) {
      this.edgeClasses.add(key);
    }
    this._g.cy.on('select unselect add remove tap', debounce(this.showStats, 200, false).bind(this));
    this._g.shownElemsChanged.subscribe(() => { this.showStats() });
  }

  showObjectProps(event) {
    if (event.type == 'select') {
      // do not change tab if selection is originated from load
      if (this._g.isSelectFromLoad && this._g.userPrefs.mergedElemIndicator.getValue() == 0) {
        this._g.isSelectFromLoad = false;
      } else {
        this.onTabChanged.emit(0);
      }
    }
    const selectedItems = this._g.cy.$(':selected');
    let props, classNames;
    [props, classNames] = this.getCommonObjectProps(selectedItems);

    // remove undefined but somehow added properties (cuz of extensions)
    let definedProperties = getPropNamesFromObj([properties.nodes, properties.edges], false);
    for (let k in props) {
      if (!definedProperties.has(k)) {
        delete props[k];
      }
    }

    // remove classes added from extensions and other stuff
    classNames = classNames.filter(x => this.nodeClasses.has(x) || this.edgeClasses.has(x));

    this.renderObjectProps(props, classNames, selectedItems.length);
  }

  renderObjectProps(props, classNames, selectedCount) {

    if (classNames && classNames.length > 0) {
      classNames = classNames.join(' & ');
    }

    this.selectedClasses = classNames;
    this.selectedItemProps.length = 0;

    let propKeys = Object.keys(props);
    // get ordered keys if only one item is selected
    if (selectedCount === 1) {
      propKeys = this.orderPropertyKeysIf1Selected(classNames) || propKeys;
    }
    for (const key of propKeys) {

      // Replace - and _ with space
      let renderedKey = key.replace(/[_\-]/g, ' ');
      let renderedValue = props[key];

      const attributeType = findTypeOfAttribute(key, properties.nodes, properties.edges);
      if (attributeType === 'datetime') {
        renderedValue = new Date(renderedValue).toLocaleString();
      }

      if (key.toLowerCase() === DATE_PROP_START ||
        key.toLowerCase() === DATE_PROP_END) {
        this.selectedItemProps.push({ key: renderedKey, val: renderedValue });
        continue;
      }
      renderedValue = this.getMappedProperty(this.selectedClasses, key, renderedValue);
      this.selectedItemProps.push({ key: renderedKey, val: renderedValue });
    }
  }

  // get common key-value pairs for non-nested properties
  getCommonObjectProps(eleList) {
    let superObj = {};
    let superClassNames = {};
    let commonProps = {};
    let commonClassNames = [];
    let firstElem = null;

    // Assume ele is instance of Cytoscape.js element
    eleList.forEach(ele => {
      const e = ele.json();
      const data = e.data;
      const classes = e.classes;
      const classArray = classes.split(' ');

      // construct superClassNames
      for (let i = 0; i < classArray.length; i++) {
        const c = classArray[i];
        if (superClassNames[c]) {
          superClassNames[c] += 1;
        } else {
          superClassNames[c] = 1;
        }
      }

      if (firstElem === null) {
        firstElem = $.extend(firstElem, data);
      }

      if (eleList.length === 1) {
        commonClassNames = classArray;
        return;
      }

      // count common key-value pairs
      this.countKeyValuePairs(data, superObj);
    });

    if (eleList.length === 1) {
      return [firstElem, commonClassNames];
    }

    const eleCount = eleList.length;

    // get common key-value pairs
    for (const [k, v] of Object.entries(superObj)) {
      for (const [, v2] of Object.entries(v)) {
        if (v2 === eleCount) {
          commonProps[k] = firstElem[k];
        }
      }
    }

    // get common class names
    for (const [k, v] of Object.entries(superClassNames)) {
      if (v === eleCount) {
        commonClassNames.push(k);
      }
    }

    return [commonProps, commonClassNames];
  }

  countKeyValuePairs(data, superObj) {
    for (const [k, v] of Object.entries(data)) {
      const valueProperty = v + '';
      if (superObj[k]) {
        if (superObj[k][valueProperty]) {
          superObj[k][valueProperty] += 1;
        } else {
          superObj[k][valueProperty] = 1
        }
      } else {
        const o2 = {};
        o2[valueProperty] = 1;
        superObj[k] = o2;
      }
    }
  }

  orderPropertyKeysIf1Selected(classNames) {
    const nodeProps = properties.nodes[classNames];
    const edgeProps = properties.edges[classNames];
    if (nodeProps) {
      return Object.keys(nodeProps);
    } else if (edgeProps) {
      return Object.keys(edgeProps);
    }
    return null;
  }

  getMappedProperty(className: string, propertyName: string, propertyValue: string): string {
    let classes = Object.keys(AppDescription.enumMapping);
    let c = classes.find(x => x == className);
    if (!c) {
      return propertyValue;
    }

    let mapping = AppDescription.enumMapping[c][propertyName];
    if (!mapping) {
      return propertyValue;
    }
    return AppDescription.enumMapping[c][propertyName][propertyValue];
  }

  showStats() {
    let stat = {};

    let classSet = new Set<string>();

    for (let i = 0; i < this._g.cy.$().length; i++) {
      let curr = this._g.cy.$()[i];
      let c = curr.classes();
      let isSelected = curr.selected();
      let isVisible = curr.visible();
      for (let j = 0; j < c.length; j++) {
        if (!this.nodeClasses.has(c[j]) && !this.edgeClasses.has(c[j])) {
          continue;
        }
        classSet.add(c[j]);
        let TYPE_CLASS = curr.isNode() ? this.NODE_TYPE : this.EDGE_TYPE;
        this.increaseCountInObj(stat, TYPE_CLASS, 'total');
        this.increaseCountInObj(stat, c[j], 'total');

        if (isSelected) {
          this.increaseCountInObj(stat, c[j], 'selected');
          this.increaseCountInObj(stat, TYPE_CLASS, 'selected');
        }
        if (!isVisible) {
          this.increaseCountInObj(stat, c[j], 'hidden');
          this.increaseCountInObj(stat, TYPE_CLASS, 'hidden');
        }
      }
    }
    classSet.add(this.NODE_TYPE);
    classSet.add(this.EDGE_TYPE);
    this.setStatStrFromObj(stat, classSet);
  }

  private setStatStrFromObj(stat, classSet: Set<string>) {

    this.tableInput.results = [];
    for (let c of classSet) {
      if (stat[c] === undefined) {
        continue;
      }
      let cySelector = '.' + c;
      // first element must be ID, ID is irrelevant here
      let row: TableData[] = [{ val: cySelector, type: TableDataType.string }];
      if (c == this.NODE_TYPE) {
        row[0].val = 'node';
        row.push({ val: 'Node', type: TableDataType.string });
      } else if (c == this.EDGE_TYPE) {
        row[0].val = 'edge';
        row.push({ val: 'Edge', type: TableDataType.string });
      } else {
        row.push({ val: c, type: TableDataType.string });
      }
      row.push({ val: stat[c].total, type: TableDataType.number });

      if (stat[c]['selected']) {
        row.push({ val: stat[c]['selected'], type: TableDataType.number });
      } else {
        row.push({ val: 0, type: TableDataType.number });
      }
      if (stat[c]['hidden']) {
        row.push({ val: stat[c]['hidden'], type: TableDataType.number });
      } else {
        row.push({ val: 0, type: TableDataType.number });
      }
      this.tableInput.results.push(row);
    }
    this.tableFilled.next(true);
  }

  private increaseCountInObj(obj, p1: string, p2: string) {
    if (obj[p1]) {
      if (obj[p1][p2] === undefined) {
        obj[p1][p2] = 1;
      } else {
        obj[p1][p2] += 1;
      }
    } else {
      obj[p1] = {};
      obj[p1][p2] = 1;
    }
  }

  filterTable(filter: TableFiltering) {
    this.showStats();
    this.tableInput.currPage = 1;
    let idxHide = [];
    // filter by text
    for (let i = 0; i < this.tableInput.results.length; i++) {
      let isMatch = false;
      // first column is ID
      for (let j = 1; j < this.tableInput.results[i].length; j++) {
        let curr = this.tableInput.results[i][j].val;
        if (this._g.userPrefs.isIgnoreCaseInText.getValue()) {
          if ((curr + '').toLowerCase().includes(filter.txt.toLowerCase())) {
            isMatch = true;
            break;
          }
        } else {
          if ((curr + '').includes(filter.txt)) {
            isMatch = true;
            break;
          }
        }
      }
      if (!isMatch) {
        idxHide.push(i);
      }
    }

    this.tableInput.results = this.tableInput.results.filter((_, i) => !idxHide.includes(i));

    // order by
    if (filter.orderDirection.length > 0) {
      let i = this.tableInput.columns.findIndex(x => x == filter.orderBy);
      if (i < 0) {
        console.error('i < 0 !');
      }
      i++; // first column is for ID or for highlight
      if (filter.orderDirection == 'asc') {
        this.tableInput.results = this.tableInput.results.sort((a, b) => { if (a[i].val > b[i].val) return 1; if (b[i].val > a[i].val) return -1; return 0 });
      } else {
        this.tableInput.results = this.tableInput.results.sort((a, b) => { if (a[i].val < b[i].val) return 1; if (b[i].val < a[i].val) return -1; return 0 });
      }
    }
    this.tableFilled.next(true);
  }
}
