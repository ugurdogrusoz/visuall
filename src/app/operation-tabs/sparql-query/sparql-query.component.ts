import { Component, OnInit, ViewChild, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { SparqlDbService } from 'src/app/db-service/sparql-db.service';
import { FormControl } from '@angular/forms'
import { BehaviorSubject, Observable, config } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { IPosition } from 'angular2-draggable';
import { TableViewInput, TableFiltering, TableDataType, TableData, TableRowMeta } from 'src/app/table-view/table-view-types';
import { EV_MOUSE_ON, debounce, EV_MOUSE_OFF } from 'src/app/constants';
import { GlobalVariableService } from 'src/app/global-variable.service';
import { Subject } from 'rxjs';
import { CytoscapeService } from 'src/app/cytoscape.service';
import { DbAdapterService } from 'src/app/db-service/db-adapter.service';

import * as $ from 'jquery'

import { Yasgui } from '@triply/yasgui';
import { Yasqe } from '@triply/yasqe'
import { isTimeValidByConfig } from 'ng-zorro-antd';







@Component({
  selector: 'sparql-query',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sparql-query.component.html',
  styleUrls: ['./sparql-query.component.css']
})




export class SparqlQueryComponent {



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

  constructor(private spq: SparqlDbService, private _http: HttpClient, private _g: GlobalVariableService, private _cyService: CytoscapeService, private _dbService: DbAdapterService) { }


  inData() {

    const url = `http://10.122.123.125:8086/sparql?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=visuall_hkt`;
    let param: any = {"query": this.inputValue, "ruleMode": false }
    this.tableInput.results = [];
    this._http.post(url, param).subscribe(resp => {
      this.spqData = resp;

      for (let i = 0; i < this.spqData.data.result.nodes.length; i++) {
        const curr = this.spqData.data.result.nodes[i];
        //this.objects.push(this.spqData.data.result);
        let row: TableData[] = [{ val: curr.id, type: TableDataType.string }];
        row.push({ val: curr.properties.label, type: TableDataType.string });
        this.tableInput.results.push(row);
        for (let i = 0; i < this.spqData.data.result.nodes.length; i++) {
          this.searchData.push(this.spqData.data.result.nodes[i].properties.label);
        }
      }
      this.tableFilled.next(true);
    }
    );
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
    this._dbService.getNeighbors(e.dbIds, (x) => { this._cyService.loadElementsFromDatabase(x, true) });
  }

}
