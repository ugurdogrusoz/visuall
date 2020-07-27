import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/global-variable.service';
import properties from '../../../../assets/generated/properties.json';
import { DbAdapterService } from 'src/app/db-service/db-adapter.service';
import { CytoscapeService } from 'src/app/cytoscape.service';
import { TableViewInput, property2TableData, getClassNameFromProperties, TableData } from 'src/app/table-view/table-view-types';
import { Subject } from 'rxjs';
import { DbQueryType, Neo4jEdgeDirection } from 'src/app/db-service/data-types';
import { getCyStyleFromColorAndWid } from 'src/app/constants';

@Component({
  selector: 'app-advanced-queries',
  templateUrl: './advanced-queries.component.html',
  styleUrls: ['./advanced-queries.component.css']
})
export class AdvancedQueriesComponent implements OnInit {

  queries: string[];
  selectedQuery: string;
  selectedIdx: number;
  nodeEdgeClasses: string[] = [];
  ignoredTypes: string[] = [];
  lengthLimit = 2;
  isDirected = true;
  isMerge = true;
  isGraph = true;
  selectedNodes: { dbId: string, label: string }[] = [];
  selectedClass = '';
  targetOrRegulator = 0;
  tableInput: TableViewInput = {
    columns: ['Title'], results: [], isEmphasizeOnHover: true, tableTitle: 'Query Results',
    resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: true, isMergeGraph: true, isNodeData: true
  };
  tableFilled = new Subject<boolean>();

  constructor(private _g: GlobalVariableService, private _dbService: DbAdapterService, private _cyService: CytoscapeService) {
    this.queries = ['Get graph of interest', 'Get common targets/regulators'];
    this.selectedIdx = -1;
  }

  ngOnInit(): void {
    this.selectedQuery = '';
    for (const n in properties.nodes) {
      this.nodeEdgeClasses.push(n);
    }
    for (const e in properties.edges) {
      this.nodeEdgeClasses.push(e);
    }
  }

  changeAdvancedQuery(event) {
    this.selectedIdx = this.queries.findIndex(x => x == event.target.value);
  }

  addSelectedNodes() {
    const selectedNodes = this._g.cy.nodes(':selected');
    if (selectedNodes.length < 1) {
      return;
    }
    const dbIds = selectedNodes.map(x => x.id().slice(1));
    const labels = this._g.getLabels4Elems(dbIds).split(',');
    const types = selectedNodes.map(x => x.classes().join());
    for (let i = 0; i < labels.length; i++) {
      if (this.selectedNodes.findIndex(x => x.dbId == dbIds[i]) < 0) {
        this.selectedNodes.push({ dbId: dbIds[i], label: types[i] + ':' + labels[i] });
      }
    }
  }

  removeSelected(i: number) {
    this.selectedNodes.splice(i, 1);
  }

  removeAllSelectedNodes() {
    this.selectedNodes = [];
  }

  addIgnoredType() {
    if (!this.ignoredTypes.includes(this.selectedClass)) {
      this.ignoredTypes.push(this.selectedClass);
    }
  }

  removeIgnoredType(i: number) {
    this.ignoredTypes.splice(i, 1);
  }

  runQuery() {
    const loadGraphFn = (x) => { this._cyService.loadElementsFromDatabase(x, this.isMerge); this.higlightSeedNodes(); };
    const setDataCntFn = (x) => { this.tableInput.resultCnt = x.data[0]; }

    if (this.selectedIdx == 0) {
      const dbIds = this.selectedNodes.map(x => x.dbId);
      this._dbService.getGraphOfInterest(dbIds, this.ignoredTypes, this.lengthLimit, this.isDirected, DbQueryType.count, setDataCntFn);
      this._dbService.getGraphOfInterest(dbIds, this.ignoredTypes, this.lengthLimit, this.isDirected, DbQueryType.table, this.fillTable.bind(this));
      if (this.isGraph) {
        this._dbService.getGraphOfInterest(dbIds, this.ignoredTypes, this.lengthLimit, this.isDirected, DbQueryType.std, loadGraphFn);
      }
    } else if (this.selectedIdx == 1) {

      let dir: Neo4jEdgeDirection = this.targetOrRegulator;
      if (!this.isDirected) {
        dir = Neo4jEdgeDirection.BOTH;
      }

      const dbIds = this.selectedNodes.map(x => x.dbId);
      this._dbService.getCommonStream(dbIds, this.ignoredTypes, this.lengthLimit, dir, DbQueryType.count, setDataCntFn);
      this._dbService.getCommonStream(dbIds, this.ignoredTypes, this.lengthLimit, dir, DbQueryType.table, this.fillTable.bind(this));
      if (this.isGraph) {
        this._dbService.getCommonStream(dbIds, this.ignoredTypes, this.lengthLimit, dir, DbQueryType.std, loadGraphFn);
      }
      this._dbService.getCommonStream(dbIds, this.ignoredTypes, this.lengthLimit, dir, DbQueryType.count, this.fillTable.bind(this));
    }
  }

  private fillTable(data) {
    let arr = data['data'][0][0];

    this.tableInput.results = [];
    let cols = new Set<string>();
    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      delete d['tconst'];
      delete d['nconst'];
      let className = getClassNameFromProperties(Object.keys(d));
      let row: TableData[] = [];
      for (let k in d) {
        row.push(property2TableData(k, d[k], className, false));
        cols.add(k);
      }
      this.tableInput.results.push(row);
    }
    this.tableInput.columns = Array.from(cols);
    this.tableFilled.next(true);
  }

  private higlightSeedNodes() {
    const dbIds = this.selectedNodes.map(x => x.dbId);
    const seedNodes = this._g.cy.nodes(dbIds.map(x => '#n' + x).join());
    // add a new higlight style
    if (this._g.userPrefs.highlightStyles.length < 2) {
      const cyStyle = getCyStyleFromColorAndWid('#0b9bcd', 4.5);
      this._g.viewUtils.addHighlightStyle(cyStyle.nodeCss, cyStyle.edgeCss);
    }
    const currHighlightIdx = this._g.userPrefs.currHighlightIdx.getValue();
    if (currHighlightIdx == 0) {
      this._g.viewUtils.highlight(seedNodes, 1);
    } else {
      this._g.viewUtils.highlight(seedNodes, 0);
    }
  }
}
