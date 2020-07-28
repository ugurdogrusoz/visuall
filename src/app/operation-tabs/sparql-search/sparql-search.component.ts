import { Component, OnInit } from '@angular/core';
import { TableDataType, TableData, TableRowMeta, TableViewInput } from 'src/app/table-view/table-view-types';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { CytoscapeService } from 'src/app/cytoscape.service';
import {HistoryMetaData } from 'src/app/db-service/data-types';
import { ClassBasedRules } from '../../../map-tab/query-types';
import { DbAdapterService } from 'src/app/db-service/db-adapter.service';


@Component({
  selector: 'sparql-search',
  templateUrl: './sparql-search.component.html',
  styleUrls: ['./sparql-search.component.css']
})
export class SparqlSearchComponent {
  spqData: any;
  objects = []; 
  inputValue: string;
  options: any;
  listValue: string[] = []; // Objects ID's
  valueE:any;


  tableInput: TableViewInput = {
    columns: ['Label'], isHide0: true, results: [], resultCnt: 0, currPage: 1, pageSize: 20,
    isLoadGraph: false, columnLimit: 5, isMergeGraph: true, isNodeData: true, isUseCySelector4Highlight: false, isHideLoadGraph: false
  };

  tableFilled = new Subject<boolean>();


  constructor(private _cyService: CytoscapeService,private _http: HttpClient,private _dbService: DbAdapterService) { }

  onInput(){
    let url = "http://10.122.123.125:8086/search?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=teydeb_demo_teydeb_hkt_1610";
    let param = {
      "param": this.inputValue,
    }
    this._http.post(url, param).subscribe(x => {
      this.options = x;
      for (let i = 0; i < this.options.length; i++) {
        this.listValue.push(this.options[i].id);
      }
      this.tableFilled.next(true);
    })
    return this.listValue;
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
  clearList(){
    this.listValue = [];
  }





}
