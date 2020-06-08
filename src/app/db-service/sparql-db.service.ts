import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariableService } from '../global-variable.service';
import { GraphResponse, TableResponse, DbService, DbQueryType } from './data-types';
import { ClassBasedRules, Rule } from '../operation-tabs/map-tab/filtering-types';
import AppDescription from '../../assets/app_description.json';
import properties from '../../assets/generated/properties.json'
import { TableFiltering } from '../table-view/table-view-types';
import { templateJitUrl } from '@angular/compiler';
import { Neo4jDb } from './neo4j-db.service';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { SharedService } from '../shared.service';
import { TEXT_OPERATORS, NUMBER_OPERATORS, LIST_OPERATORS, ENUM_OPERATORS, GENERIC_TYPE, isNumber, DATETIME_OPERATORS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class SparqlDbService implements DbService {

  // default database config, in case it is not read from visuall-config.json
  private dbConfig = {
    url: 'http://10.122.123.125:7575/db/data/transaction/commit',
    username: 'neo4j',
    password: '123'
  };

  condition: any;
  elemN: any;
  sparqlData:any;
  spqNodes = [];
  filterInput:any;
  
  
  

  constructor(private _http: HttpClient, private _g: GlobalVariableService, private neo4j: Neo4jDb, private shredService : SharedService) {
    this._g.getConfig().subscribe(x => { this.dbConfig = x['database'] }, error => console.log('getConfig err: ', error));
  }

  getNeighbors(elemIds: any, callback: (x: GraphResponse) => any, graphResponse = true,) {
    /*for (let i = 0; i < elemIds.length; i++) {
      if (i == elemIds.length - 1) {
        this.condition += elemIds;
      } else {
        this.condition += elemIds;
      }
    }*/
    this.condition = elemIds[0];
    this.showNeighbors(callback, graphResponse);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    this.showSampleData(callback);
  }

  getAllData(callback: (x: GraphResponse) => any) {
    this.showAllData(callback);
  }
  getFilteringResult(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    
    this.filterResult(callback, type);
  }
  filterTable(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
  }

  private showSampleData( callback: (X: any) => any, graphResponse = true) {
    const url = `http://10.122.123.125:7575/getSampleData?limit=33`;
    this._http.get(url).subscribe(x => {
      this._g.setLoadingStatus(false);
      if (graphResponse) {
        callback(this.extractGraph(x));
      } else {
        callback(this.extractTable(x));
      }
    })
  }

  private showAllData(callback: (X: any) => any, graphResponse = true) {
    const url = `http://10.122.123.125:7575/getAllData`;
    
    this._g.setLoadingStatus(true);
    this._http.get(url).subscribe(x => {
      this._g.setLoadingStatus(false);
      if (graphResponse) {
        callback(this.extractGraph(x));
      } else {
        callback(this.extractTable(x));
      }
    })
  }
  private showNeighbors(callback: (X: any) => any, graphResponse = true) {

    const url = `http://10.122.123.125:7575/getNeighbors?uri=${encodeURIComponent(this.condition)}`;
    this._g.setLoadingStatus(true);
    this._http.get(url).subscribe(x => {
      this._g.setLoadingStatus(false);
      if (graphResponse) {
        callback(this.extractGraph(x));
      } else {
        callback(this.extractTable(x));
      }
    })
  }
  sparqlQuery(){
    const url = `http://10.122.123.125:8086/sparql?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=visuall_hkt`;
    let requestBdy: any = {"query":"prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nprefix owl: <http://www.w3.org/2002/07/owl#>\n\nSELECT ?subject ?object\nWHERE {\n  ?subject a ?object\n}\nLIMIT 25","ruleMode":false}
    this._http.post(url,requestBdy).subscribe(resp => {
      this.sparqlData = resp;
      return this.spqNodes;
      }
    );
  }

  saveSelectedClass(value){
    this.shredService.setlblElem(value);
  }

  saveSelectedInput(value){
   this.shredService.setFilterInput(value);
  }
  
  saveOpKey(value){
    this.shredService.setOpKeys(value);
  }
  saveProp(value){
    this.shredService.setProp(value);
  }
  
  private filterResult(callback: (x: any) => any, type: DbQueryType) {
    const url = `http://10.122.123.125:7575/getFilteringResult`;
    this._g.setLoadingStatus(true);
    let requestBody: any;
    let lblElem = this.shredService.getlblElem();
    let filterInput = this.shredService.getFilterInput();
    let opKeys = this.shredService.getOpKeys();
    let prop = this.shredService.getProp();
    let operator;
    switch(opKeys){
      case 'contains' :{
        operator = "M";
        break;
      }
      case 'equal to' :{
        operator = "M";
        break;
      }
      case 'starts with' :{
        operator = "M";
        break;
      }
      case 'ends with' :{
        operator = "M";
        break;
      }
      case '=' :{
        operator = "C";
      }
      case '≠' :{
        operator = "C";
      }
      case '<' :{
        operator = "C";
      }
      case '>' :{
        operator = "C";
      }
      case '≤' :{
        operator = "C";
      }
      case '≥' :{
        operator = "C";
      }
      case 'one of' :{
        operator = "C";
      }
    }
        if(type == DbQueryType.count){
      requestBody = {
        "rules": [
          [
            "<http://schema.huawei.com/" + lblElem + ">",
            "<http://www.w3.org/2000/01/rdf-schema#" + prop + ">" ,
            opKeys,
            filterInput,
            "OR",
            operator
          ]
        ],
        "type": "graph"
      }
    }
    if (type == DbQueryType.std) {
      requestBody =
      {
        "rules": [
          [
            "<http://schema.huawei.com/" + lblElem + ">",
            "<http://www.w3.org/2000/01/rdf-schema#" + prop + ">",
            opKeys,
            filterInput,
            "OR",
            operator
          ]
        ],
        "type": "graph",
        "limit": 10
      }
    } else if (type == DbQueryType.table) {
      requestBody = {
        "rules": [
          [
            "<http://schema.huawei.com/"+ lblElem + ">",
            "<http://www.w3.org/2000/01/rdf-schema#" + prop + ">",
            opKeys,
            filterInput,
            "OR",
            operator
          ]
        ],
        "type": "text",
        "limit": 10
      }
    }
    this._http.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .subscribe(x => {
        this._g.setLoadingStatus(false);
        if (type == DbQueryType.count) {
          callback({ data: x['results'].data[0] });
          
        }
        if(type == DbQueryType.std){
          let nodes = [];
          let relationships = [];
          for (let i = 0; i < x['results'].data.length; i++) {      
            const nodesOfElem = x['results'].data[i];
            nodes.push(...nodesOfElem.graph.nodes)
            relationships.push(...nodesOfElem.graph.relationships);
          }
          this.elemN = {nodes, relationships}
          callback(this.elemN)
        }
        if(type == DbQueryType.table){
          let tableC = {data:x['results'].data};
          callback(tableC)
        }
      })
  }

  private extractGraph(response): GraphResponse {
    let nodes = [];
    let edges = [];

    const results = response.results;
    if (!results) {
      console.error('Invalid query!', response.errors[0]);
      return;
    }

    const data = response.results.data;
    for (let i = 0; i < data.length; i++) {
      const graph = data[i].graph;
      const graph_nodes = graph.nodes;
      const graph_edges = graph.relationships;

      for (let node of graph_nodes) {
        nodes.push(node);
      }

      for (let edge of graph_edges) {
        edges.push(edge);
      }
    }

    return { 'nodes': nodes, 'edges': edges };
  }


  private extractTable(response): TableResponse {
    if (response.errors && response.errors.length > 0) {
      console.error('DB server returns erronous result', response.errors);
      return;
    }
    return { columns: response.results[0].columns, data: response.results[0].data.map(x => x.row) };
  }

}
/*----------------------------------------------------------Conversation--------------------------------------------------*/

export interface BodyRequest {


}