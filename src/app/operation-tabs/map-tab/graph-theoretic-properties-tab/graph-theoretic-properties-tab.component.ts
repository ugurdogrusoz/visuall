import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/global-variable.service';
import { formatNumber } from '@angular/common';
import { CytoscapeService } from 'src/app/cytoscape.service';
import { debounce } from 'src/app/constants';

@Component({
  selector: 'app-graph-theoretic-properties-tab',
  templateUrl: './graph-theoretic-properties-tab.component.html',
  styleUrls: ['./graph-theoretic-properties-tab.component.css']
})
export class GraphTheoreticPropertiesTabComponent implements OnInit {


  theoreticProps: { text: string, fn: string, arg: any }[] = [
    { text: 'Degree Centrality', fn: 'degreeCentrality', arg: '' }, { text: 'Normalized Degree Centrality', fn: 'degreeCentralityNormalized', arg: '' },
    { text: 'Closeness Centrality', fn: 'closenessCentrality', arg: '' }, { text: 'Normalized Closeness Centrality', fn: 'closenessCentralityNormalized', arg: '' },
    { text: 'Betweenness Centrality', fn: 'betweennessCentrality', arg: '' }, { text: 'Normalized Betweenness Centrality', fn: 'betweennessCentralityNormalized', arg: '' },
    { text: 'Page Rank', fn: 'pageRank', arg: '' }];
  isOnSelected = false;
  isDirectedGraph = true;
  isMapNodeSizes = true;
  selectedPropFn: string = '';
  poppedData: { popper: any, elem: any, fn: Function }[] = [];
  UPDATE_POPPER_WAIT = 100;

  constructor(private _g: GlobalVariableService, private _cyService: CytoscapeService) { }

  ngOnInit() {
    this._cyService.setRemovePoppersFn(this.destroyCurrentPoppers.bind(this));
    this._g.cy.on('remove', (e) => { this.destroyPopper(e.target.id()) })
  }

  runProperty() {
    let cySelector = '';
    if (this.isOnSelected) {
      cySelector = ':selected';
    }
    this.destroyCurrentPoppers();
    this[this.selectedPropFn]();
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
      let e = elems[i];
      let r = this._g.cy.$(cySelector).degreeCentrality({ root: e, directed: this.isDirectedGraph });
      let badges = [];
      if (this.isDirectedGraph) {
        badges.push(r.indegree);
        badges.push(r.outdegree);
      } else {
        badges.push(r.degree);
      }
      this.generateBadge4Elem(e, badges);
    }
  }

  degreeCentralityNormalized() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$(cySelector).degreeCentralityNormalized({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [];
      let e = elems[i];
      if (this.isDirectedGraph) {
        badges.push(r.indegree(e));
        badges.push(r.outdegree(e));
      } else {
        badges.push(r.degree(e));
      }
      this.generateBadge4Elem(e, badges);
    }
  }

  closenessCentrality() {
    let cySelector = this.getCySelector();
    let elems = this._g.cy.nodes(cySelector);
    for (let i = 0; i < elems.length; i++) {
      let e = elems[i];
      let r = this._g.cy.$(cySelector).closenessCentrality({ root: e, directed: this.isDirectedGraph });
      let badges = [r];
      this.generateBadge4Elem(e, badges);
    }
  }

  closenessCentralityNormalized() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$(cySelector).closenessCentralityNormalized({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.closeness(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  betweennessCentrality() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$(cySelector).betweennessCentrality({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.betweenness(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  betweennessCentralityNormalized() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$(cySelector).betweennessCentrality({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.betweennessNormalized(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  pageRank() {
    let cySelector = this.getCySelector();

    let elems = this._g.cy.nodes(cySelector);
    let r = this._g.cy.$(cySelector).pageRank();
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.rank(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  generateBadge4Elem(e, badges: number[]) {
    let popper = e.popper({
      content: () => {
        let div = document.createElement('div');
        div.innerHTML = this.getHtml(badges);
        document.getElementById('cy').appendChild(div);
        return div;
      },
      popper: { removeOnDestroy: true, placement: 'top-end' }
    });

    let update = debounce(() => { popper.scheduleUpdate(); console.log('pud'); }, this.UPDATE_POPPER_WAIT, false);
    e.on('position', update);
    this._g.cy.on('pan zoom resize', update);
    this.poppedData.push({ popper: popper, elem: e, fn: update });
  }

  destroyCurrentPoppers() {
    let size = this.poppedData.length;
    for (let i = 0; i < size; i++) {
      this.destroyPopper('', 0);
    }
  }

  destroyPopper(id: string, i: number = -1) {
    if (i < 0) {
      i = this.poppedData.findIndex(x => x.elem.id() == id);
      if (i < 0) {
        return;
      }
    }
    this.poppedData[i].popper.destroy();
    // unbind previously bound functions
    this.poppedData[i].elem.off('position', this.poppedData[i].fn);
    this._g.cy.off('pan zoom resize', this.poppedData[i].fn);
    this.poppedData.splice(i, 1);
  }

  getHtml(badges: number[]) {
    let s = '';
    for (let i = 0; i < badges.length; i++) {
      s += `<span class="badge badge-pill badge-primary">${formatNumber(badges[i], 'en', '1.0-2')}</span>`
    }
    return s;
  }
}
