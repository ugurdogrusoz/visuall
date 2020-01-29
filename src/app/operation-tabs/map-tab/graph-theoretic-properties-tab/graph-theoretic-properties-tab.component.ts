import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/global-variable.service';

@Component({
  selector: 'app-graph-theoretic-properties-tab',
  templateUrl: './graph-theoretic-properties-tab.component.html',
  styleUrls: ['./graph-theoretic-properties-tab.component.css']
})
export class GraphTheoreticPropertiesTabComponent implements OnInit {


  theoreticProps: { text: string, fn: string, arg: any }[] = [
    { text: 'Degree Centrality', fn: 'degreeCentrality', arg: '' }, { text: 'Normalized Degree Centrality', fn: 'degreeCentralityNormalized', arg: '' },
    { text: 'Closeness Centrality', fn: 'closenessCentrality', arg: '' }, { text: 'Normalized Closeness Centrality', fn: 'closenessCentralityNormalized', arg: '' },
    { text: 'Betweenness Centrality', fn: 'betweennessCentrality', arg: '' }, { text: 'Page Rank', fn: 'pageRank', arg: '' }];
  isOnSelected = false;
  selectedPropFn: string = '';

  constructor(private _g: GlobalVariableService) { }

  ngOnInit() {
  }

  runProperty() {
    let cySelector = '';
    if (this.isOnSelected) {
      cySelector = ':selected';
    }
    let r = this[this.selectedPropFn]();
  }

  degreeCentrality() {
    let cySelector = '';
    if (this.isOnSelected) {
      cySelector = ':selected';
    }

    let elems = this._g.cy.nodes();
    for (let i = 0; i < elems.length; i++) {
      let r = this._g.cy.$(cySelector).degreeCentrality({ root: elems[i] });
      console.log('r: ', r);
    }
  }

}
