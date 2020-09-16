import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from '../../../global-variable.service';
import { formatNumber } from '@angular/common';
import { CytoscapeService } from '../../../cytoscape.service';
import { ColorPickerComponent } from '../../../color-picker/color-picker.component';
import { debounce2, debounce } from '../../../constants';

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
  isDirectedGraph = false;
  isMapNodeSizes = true;
  isMapBadgeSizes = false;
  selectedPropFn: string = '';
  poppedData: { popper: HTMLDivElement, elem: any, fn: Function, fn2: Function }[] = [];
  UPDATE_POPPER_WAIT = 100;
  cySelector = '';
  badgeColor = '#007bff';
  isBadgeVisible = true;
  readonly ZOOM_THRESHOLD = 0.8;
  readonly NODE_SIZE = 40;
  maxPropValue = 0;
  currNodeSize = this.NODE_SIZE;
  constructor(private _g: GlobalVariableService, private _cyService: CytoscapeService) { }

  ngOnInit() {
    this._cyService.setRemovePoppersFn(this.destroyCurrentPoppers.bind(this));
    this._g.cy.on('remove', (e) => { this.destroyPopper(e.target.id()) });
    this._g.appDescription.subscribe(x => {
      if (x !== null && x.appPreferences.avgNodeSize) {
        this.currNodeSize = x.appPreferences.avgNodeSize;
      }
    })
  }

  runProperty() {
    this.cySelector = '';
    if (this.isOnSelected) {
      this.cySelector = ':selected';
    }
    this.destroyCurrentPoppers();
    if (!this[this.selectedPropFn]) {
      return;
    }
    this[this.selectedPropFn]();
    let m = Math.max(...this._g.cy.nodes().map(x => x.data('__graphTheoreticProp')));
    this.maxPropValue = m;
    this._cyService.setNodeSizeOnGraphTheoreticProp(m, this.currNodeSize);
    this.setBadgeColorsAndCoords();
  }

  degreeCentrality() {
    let elems = this._g.cy.nodes(this.cySelector);
    for (let i = 0; i < elems.length; i++) {
      let e = elems[i];
      let r = this._g.cy.$(this.cySelector).degreeCentrality({ root: e, directed: this.isDirectedGraph });
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
    let elems = this._g.cy.nodes(this.cySelector);
    let r = this._g.cy.$(this.cySelector).degreeCentralityNormalized({ directed: this.isDirectedGraph });
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
    let elems = this._g.cy.nodes(this.cySelector);
    for (let i = 0; i < elems.length; i++) {
      let e = elems[i];
      let r = this._g.cy.$(this.cySelector).closenessCentrality({ root: e, directed: this.isDirectedGraph });
      let badges = [r];
      this.generateBadge4Elem(e, badges);
    }
  }

  closenessCentralityNormalized() {
    let elems = this._g.cy.nodes(this.cySelector);
    let r = this._g.cy.$(this.cySelector).closenessCentralityNormalized({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.closeness(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  betweennessCentrality() {
    let elems = this._g.cy.nodes(this.cySelector);
    let r = this._g.cy.$(this.cySelector).betweennessCentrality({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.betweenness(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  betweennessCentralityNormalized() {
    let elems = this._g.cy.nodes(this.cySelector);
    let r = this._g.cy.$(this.cySelector).betweennessCentrality({ directed: this.isDirectedGraph });
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.betweennessNormalized(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  pageRank() {
    let elems = this._g.cy.nodes(this.cySelector);
    let r = this._g.cy.$(this.cySelector).pageRank();
    for (let i = 0; i < elems.length; i++) {
      let badges = [r.rank(elems[i])];
      this.generateBadge4Elem(elems[i], badges);
    }
  }

  generateBadge4Elem(e, badges: number[]) {
    let div = document.createElement('div');
    div.innerHTML = this.getHtml(badges);
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.left = '0px';
    document.getElementById('cy').appendChild(div);

    if (this.isMapNodeSizes || this.isMapBadgeSizes) {
      let sum = 0;
      for (let i = 0; i < badges.length; i++) {
        sum += badges[i];
      }
      e.data('__graphTheoreticProp', sum / badges.length);
    }
    if (this.isMapNodeSizes) {
      e.removeClass('graphTheoreticDisplay');
      e.addClass('graphTheoreticDisplay');
    }

    let fn = debounce2(() => { this.setBadgeCoords(e, div); }, this.UPDATE_POPPER_WAIT, () => { this.showHideBadge(false, div); }).bind(this);
    let fn2 = debounce(() => { this.setBadgeVisibility(e, div); }, this.UPDATE_POPPER_WAIT * 2).bind(this);

    e.on('position', fn);
    e.on('style', fn2);
    this._g.cy.on('pan zoom resize', fn);
    this.poppedData.push({ popper: div, elem: e, fn: fn, fn2: fn2 });
  }

  private setBadgeCoords(e, div: HTMLDivElement) {
    // let the nodes resize first
    setTimeout(() => {
      let ratio = 1;
      if (this.isMapBadgeSizes) {
        let b = this.currNodeSize + 20;
        let a = Math.max(5, this.currNodeSize - 20);
        let x = e.data('__graphTheoreticProp');
        ratio = ((b - a) * x / this.maxPropValue + a) / this.currNodeSize;
      } else {
        ratio = this.currNodeSize / this.NODE_SIZE;
      }
      ratio = ratio < this.ZOOM_THRESHOLD ? this.ZOOM_THRESHOLD : ratio;

      let z1 = this._g.cy.zoom() / 2 * ratio;
      const bb = e.renderedBoundingBox({ includeLabels: false, includeOverlays: false });
      const w = div.clientWidth;
      const h = div.clientHeight;
      const deltaW4Scale = (1 - z1) * w / 2;
      const deltaH4Scale = (1 - z1) * h / 2;
      div.style.transform = `translate(${bb.x2 - deltaW4Scale - w * z1}px, ${bb.y1 - deltaH4Scale}px) scale(${z1})`;
      this.showHideBadge(e.visible(), div);
    }, 0);
  }

  private setBadgeVisibility(e, div: HTMLDivElement) {
    if (!e.visible()) {
      div.style.opacity = '0';
    }
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
    this.poppedData[i].popper.remove();
    // unbind previously bound functions
    if (this.poppedData[i].fn) {
      this.poppedData[i].elem.off('position', this.poppedData[i].fn);
      this.poppedData[i].elem.off('style', this.poppedData[i].fn2);
      this._g.cy.off('pan zoom resize', this.poppedData[i].fn);
    }
    this.poppedData[i].elem.removeClass('graphTheoreticDisplay');
    this.poppedData[i].elem.data('__graphTheoreticProp', undefined);
    this.poppedData.splice(i, 1);
  }

  getHtml(badges: number[]): string {
    let s = '';
    for (let i = 0; i < badges.length; i++) {
      s += `<span class="badge badge-pill badge-primary strokeme">${formatNumber(badges[i], 'en', '1.0-2')}</span>`
    }
    return s;
  }

  showHideBadges(isShow: boolean) {
    let z = this._g.cy.zoom();
    if (z <= this.ZOOM_THRESHOLD) {
      isShow = false;
    }
    let css = '0';
    if (isShow) {
      css = '1';
    }
    for (let i = 0; i < this.poppedData.length; i++) {
      this.poppedData[i].popper.style.opacity = css;
    }
  }

  showHideBadge(isShow: boolean, div: HTMLDivElement) {
    let z = this._g.cy.zoom();
    if (z <= this.ZOOM_THRESHOLD) {
      isShow = false;
    }
    let css = '0';
    if (isShow) {
      css = '1';
    }
    div.style.opacity = css;
  }

  setBadgeColorsAndCoords() {
    for (let i = 0; i < this.poppedData.length; i++) {
      let c = ColorPickerComponent.mapColor(this.badgeColor, this.maxPropValue, this.poppedData[i].elem.data('__graphTheoreticProp'));
      for (let j = 0; j < this.poppedData[i].popper.children.length; j++) {
        (this.poppedData[i].popper.children[j] as HTMLSpanElement).style.background = c;
      }
      this.setBadgeCoords(this.poppedData[i].elem, this.poppedData[i].popper);
    }
  }

  colorSelected(s: string) {
    this.badgeColor = s;
  }

  avgNodeSizeChanged() {
    if (this.currNodeSize < 5) {
      this.currNodeSize = 5;
    }
  }

}
