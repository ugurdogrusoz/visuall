import { Component, OnInit, DoCheck, Input, Type } from '@angular/core';
import Yasgui from '@triply/yasgui';
import Yasqe from '@triply/yasqe';
import Yasr from '@triply/yasr';
import * as $ from 'jquery'
import { default as PersistedJson } from "node_modules/@triply/yasgui/build/ts/src/Tab";
import { GlobalVariableService } from 'src/app/global-variable.service';
import { Key } from 'protractor';
import { query } from '@angular/animations';
import * as superagent from "superagent";
import { TableDataType, TableData, TableRowMeta, TableViewInput } from 'src/app/table-view/table-view-types';
import { Subject } from 'rxjs';
import { CytoscapeService } from 'src/app/cytoscape.service';
import { DbAdapterService } from 'src/app/db-service/db-adapter.service';
import { listeners } from 'process';
import { default as Tab, PersistedJson as PersistedTabJson } from "node_modules/@triply/yasgui/build/ts/src/Tab";
import EndpointSelect from '@triply/yasgui/build/ts/src/endpointSelect';

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

  tableFilled = new Subject<boolean>();

  tableInput: TableViewInput = {
    columns: ['Label'], isHide0: true, results: [], resultCnt: 0, currPage: 1, pageSize: 20,
    isLoadGraph: false, columnLimit: 5, isMergeGraph: true, isNodeData: true, isUseCySelector4Highlight: false, isHideLoadGraph: false
  };


  constructor(private _g: GlobalVariableService,private _cyService: CytoscapeService, private _dbService: DbAdapterService) { }


  ngOnInit(): void {
    Yasqe.defaults.requestConfig.endpoint = "http://10.122.123.125:8086/sparql?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=visuall_hkt";
    const yasgui = new Yasgui(document.getElementById('yasgui'), {
      requestConfig: {
        endpoint: Yasqe.defaults.requestConfig.endpoint,
        headers: {
          Accept: 'application/json; charset=UTF-8',
          'Content-Type': 'application/json',
        }
      }, copyEndpointOnNewTab: false

    })

    const tab = yasgui.addTab(true, { ...Yasgui.Tab.getDefaults(), name: `Sparql Query` });
    tab.yasr.on(`drawn`, (yasrResult) => {
      this.spqData = yasrResult.results.json;
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
    });
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
    console.log('get data for query result: ', e);
    this._dbService.getNeighbors(e.dbIds, (x) => { this._cyService.loadElementsFromDatabase(x, true) }, null, true, null);
  }








}
