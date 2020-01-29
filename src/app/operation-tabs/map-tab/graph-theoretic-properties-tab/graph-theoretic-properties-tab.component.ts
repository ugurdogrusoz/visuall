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

  private getCySelector(): string {
    let cySelector = '';
    if (this.isOnSelected) {
      cySelector = ':selected';
    }
    return cySelector;
  }

  degreeCentrality() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    for (let i = 0; i < elems.length; i++) {
      let r = this._g.cy.$(cySelector).degreeCentrality({ root: elems[i] });
      console.log('r: ', r);
    }
  }

  degreeCentralityNormalized() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$().degreeCentralityNormalized();
    for (let i = 0; i < elems.length; i++) {
      console.log('r: ', r.degree(elems[i]));
    }
  }

  closenessCentrality() {
    let cySelector = this.getCySelector();
    let elems = this._g.cy.nodes(cySelector);
    for (let i = 0; i < elems.length; i++) {
      let r = this._g.cy.$(cySelector).closenessCentrality({ root: elems[i] });
      console.log('r: ', r);
    }
  }

  closenessCentralityNormalized() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$().closenessCentralityNormalized();
    for (let i = 0; i < elems.length; i++) {
      console.log('r: ', r.closeness(elems[i]));
    }
  }

  betweennessCentrality() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$().betweennessCentrality();
    for (let i = 0; i < elems.length; i++) {
      console.log('r: ', r.betweenness(elems[i]));
      console.log('r norm: ', r.betweennessNormalized(elems[i]));
    }
  }

  pageRank() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$().pageRank();
    for (let i = 0; i < elems.length; i++) {
      console.log('r: ', r.rank(elems[i]));
    }
  }
}
