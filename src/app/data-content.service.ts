import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GlobalVariableService } from './global-variable.service';

import { CytoscapeService } from './cytoscape.service';

@Injectable({
  providedIn: 'root'
})
export class DataContentService {

  curNodeId = '';

  constructor(private http: HttpClient, private _g: GlobalVariableService, private cyto: CytoscapeService) { }

  getElemId(event) {
    const ele = event.target || event.cyTarget;
    this.curNodeId = ele.data().id.slice(1);
    console.log(this.curNodeId)
    return this.curNodeId;
  }

  getMovieDb() {

    //const selectedId = this._g.cy.$(':selected').jsons()[0].data.id.slice(1);
   // const url = `http://10.122.123.125:9000/getMostSimilar?model_id=14820191580380909&numSimilar=10&uri=neo4j://individuals/${this.curNodeId}`;
   // const url = `http://10.122.123.125:9000/getMostSimilar?model_id=14820191580380909&numSimilar=10&uri=neo4j://individuals/${this.curNodeId}`;
    const url = `http://10.122.123.125:9000/getMostSimilar?model_id=14017151571196665&numSimilar=10&uri=${encodeURIComponent(this.curNodeId)}`;
    return this.http.get(url);
  }
}
