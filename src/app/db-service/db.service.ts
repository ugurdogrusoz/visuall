import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariableService } from '../global-variable.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private dbConfig = {
    url: 'http://ivis.cs.bilkent.edu.tr:3001/db/data/transaction/commit',
    username: 'neo4j',
    password: '123'
  };

  constructor(private _http: HttpClient, private _g: GlobalVariableService) {
    this._g.getConfig().subscribe(x => { this.dbConfig = x['database'] }, error => console.log('getConfig err: ', error));
  }

  runQuery(query: string, cb, isGraphResponse = true) {
    const url = this.dbConfig.url;
    const username = this.dbConfig.username;
    const password = this.dbConfig.password;
    let requestType = isGraphResponse ? 'graph' : 'row';
    console.log(query);
    this._g.setLoadingStatus(true);
    const requestBody = {
      'statements': [{
        'statement': query,
        'parameters': null,
        'resultDataContents': [requestType]
      }]
    };
    this._http.post(url, requestBody, {
      headers: {
        Accept: 'application/json; charset=UTF-8',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    }).subscribe((data) => {
      this._g.setLoadingStatus(false);

      if (isGraphResponse) {
        cb(this.extractGraphFromQueryResponse(data));
      } else {
        cb(this.extractTableFromQueryResponse(data));
      }
    },
      (err) => { this._g.setLoadingStatus(true); console.log('err db.service line 34: ', err) });

  }

  private extractGraphFromQueryResponse(response) {
    let nodes = {};
    let edges = {};

    const results = response.results[0];
    if (!results) {
      console.error('Invalid query!', response.errors[0]);
      return;
    }

    const data = response.results[0].data;
    for (let i = 0; i < data.length; i++) {
      const graph = data[i].graph;
      const graph_nodes = graph.nodes;
      const graph_edges = graph.relationships;

      for (let node of graph_nodes) {
        const node_id = node.id;
        nodes[node_id] = node;
      }

      for (let edge of graph_edges) {
        const edge_id = edge.id;
        edges[edge_id] = edge;
      }
    }

    return { 'nodes': nodes, 'edges': edges };
  }

  private extractTableFromQueryResponse(response) {
    if (response.errors && response.errors.length > 0) {
      console.error('DB server returns erronous result', response.errors);
      return;
    }
    return { columns: response.results[0].columns, data: response.results[0].data.map(x => x.row) };
  }

}
