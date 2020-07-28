import { Component, OnInit, DoCheck, Input, Type } from '@angular/core';
import Yasgui from '@triply/yasgui';
import Yasqe from '@triply/yasqe';
import { GlobalVariableService } from 'src/app/global-variable.service';
import { TableDataType, TableData, TableRowMeta, TableViewInput } from 'src/app/table-view/table-view-types';
import { Subject } from 'rxjs';
import { CytoscapeService } from 'src/app/cytoscape.service';
import { DbAdapterService } from 'src/app/db-service/db-adapter.service';
import * as superagent from "superagent";
import {HistoryMetaData } from 'src/app/db-service/data-types';
import { ClassBasedRules } from '../../../map-tab/query-types';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
})

@Input()

export class EditorComponent implements OnInit {


  spqData: any;
  objects = []; //Nodes & Edges
  searchData = []; //Node Names
  inputValue: any;
  options: string[] = [];
  queryRule: ClassBasedRules;

  tableFilled = new Subject<boolean>();

  tableInput: TableViewInput = {
    columns: ['Label'], isHide0: true, results: [], resultCnt: 0, currPage: 1, pageSize: 20,
    isLoadGraph: false, columnLimit: 5, isMergeGraph: true, isNodeData: true, isUseCySelector4Highlight: false, isHideLoadGraph: false
  };


  constructor(private _g: GlobalVariableService,private _cyService: CytoscapeService, private _dbService: DbAdapterService) { }


  ngOnInit(): void {
    Yasqe.defaults.requestConfig.endpoint = "http://10.122.123.125:8086/sparql?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=visuall_hkt";
/*     const yasgui = new Yasgui(document.getElementById('yasgui'), {
      requestConfig: {
        endpoint: Yasqe.defaults.requestConfig.endpoint,
        headers: {
          Accept: 'application/json; charset=UTF-8',
          'Content-Type': 'application/json',
        }
      }, copyEndpointOnNewTab: false
    }); */
    const yasqe = new Yasqe(document.getElementById('yasqe'));
    yasqe.on("queryResponse", (instance: Yasqe, req: superagent.SuperAgentRequest, duration: number) => {
      this.spqData = req.body.data.result;
      for (let i = 0; i < this.spqData.nodes.length; i++) {
        const curr = this.spqData.nodes[i];
        let row: TableData[] = [{ val: curr.id, type: TableDataType.string }];
        row.push({ val: curr.properties.label, type: TableDataType.string });
        this.tableInput.results.push(row);
        for (let i = 0; i < this.spqData.nodes.length; i++) {
          this.searchData.push(this.spqData.nodes[i].properties.label);
        }
      }
      this.tableFilled.next(true);
    });

/*     const tab = yasgui.addTab(true, { ...Yasgui.Tab.getDefaults(), name: `Sparql Query` });
    tab.getYasr().on(`drawn`, (yasrResult) => {
      this.spqData = yasrResult.results.getAsJson();
      for (let i = 0; i < this.spqData.data.result.nodes.length; i++) {
        const curr = this.spqData.data.result.nodes[i];
        let row: TableData[] = [{ val: curr.id, type: TableDataType.string }];
        row.push({ val: curr.properties.label, type: TableDataType.string });
        this.tableInput.results.push(row);
        for (let i = 0; i < this.spqData.data.result.nodes.length; i++) {
          this.searchData.push(this.spqData.data.result.nodes[i].properties.label);
        }
      }
      this.tableFilled.next(true);
    }); */
  }

  fillTable() {
    for (let i = 0; i < this.spqData.data.result.nodes.length; i++) {
      const curr = this.spqData.data.result.nodes[i];
      this.objects.push(this.spqData.data.result);
      let row: TableData[] = [{ val: curr.id, type: TableDataType.string }];
      row.push({ val: curr.properties.label, type: TableDataType.string });
      this.tableInput.results.push(row);
    }
    this.tableFilled.next(true);
  }

  filterTable() {
    console.log('filter table: ', arguments);
  }

  getDataForQueryResult(e: TableRowMeta) {
    let fn = (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph) };
    let historyMeta: HistoryMetaData =  { customTxt: 'Loaded from table: ', isNode: true, labels: e.tableIdx.join(',') }
    this._dbService.getElems(e.dbIds, fn, { isEdgeQuery: true }, historyMeta);


  /*   console.log('get data for query result: ', e);
    this._dbService.getNeighbors(e.dbIds, (x) => { this._cyService.loadElementsFromDatabase(x, true) }); */
  }

  



}
