import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/global-variable.service';
import { formatNumber } from '@angular/common';
import { CytoscapeService } from 'src/app/cytoscape.service';
import { ColorPickerComponent } from 'src/app/color-picker/color-picker.component';
import { debounce2 } from 'src/app/constants';

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
  selectedPropFn: string = '';
  poppedData: { popper: HTMLDivElement, elem: any, fn: Function }[] = [];
  UPDATE_POPPER_WAIT = 100;
  cySelector = '';
  badgeColor = '#007bff';
  isBadgeVisible = true;
  readonly ZOOM_THRESHOLD = 0.6;
  maxPropValue = 0;

  constructor(private _g: GlobalVariableService, private _cyService: CytoscapeService) { }

  ngOnInit() {
    this._cyService.setRemovePoppersFn(this.destroyCurrentPoppers.bind(this));
    this._g.cy.on('remove', (e) => { this.destroyPopper(e.target.id()) })
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
    this._cyService.setNodeSizeOnGraphTheoreticProp(m);
    this.setBadgeColors();
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

    if (this.isMapNodeSizes) {
      let sum = 0;
      for (let i = 0; i < badges.length; i++) {
        sum += badges[i];
      }
      e.data('__graphTheoreticProp', sum / badges.length);
      e.removeClass('graphTheoreticDisplay');
      e.addClass('graphTheoreticDisplay');
    }

    this.setBadgeCoords(e, div);

    let fn = debounce2(() => { this.setBadgeCoords(e, div); }, this.UPDATE_POPPER_WAIT, () => { this.showHideBadge(false, div); }).bind(this);

    e.on('position', fn);
    this._g.cy.on('pan zoom resize', fn);
    this.poppedData.push({ popper: div, elem: e, fn: fn });
  }

  private setBadgeCoords(e, div: HTMLDivElement) {
    // let the nodes resize first
    setTimeout(() => {
      let z1 = this._g.cy.zoom() / 2;
      const p = e.renderedPosition();
      const eW = e.renderedWidth() / 2;
      const eH = e.renderedHeight() / 2;
      const w = div.clientWidth;
      div.style.transform = `translate(${p.x + eW - w * z1}px, ${p.y - eH}px) scale(${z1})`;
      this.showHideBadge(true, div);
    }, 0);
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
      this._g.cy.off('pan zoom resize', this.poppedData[i].fn);
    }
    this.poppedData[i].elem.removeClass('graphTheoreticDisplay');
    this.poppedData[i].elem.data('__graphTheoreticProp', undefined);
    this.poppedData.splice(i, 1);
  }

  getHtml(badges: number[]): string {
    let s = '';
    let c = ColorPickerComponent.getAntiColor(this.badgeColor);
    for (let i = 0; i < badges.length; i++) {
      s += `<span class="badge badge-pill badge-primary strokeme">${formatNumber(badges[i], 'en', '1.0-2')}</span>`
    }
    return s;
  }

  hideShownBadgesOnZoom() {
    let z = this._g.cy.zoom();

    if (z > this.ZOOM_THRESHOLD && !this.isBadgeVisible) {
      this.showHideBadges(true);
      this.isBadgeVisible = true;
    }
    if (z <= this.ZOOM_THRESHOLD && this.isBadgeVisible) {
      this.showHideBadges(false);
      this.isBadgeVisible = false;
    }
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

  setBadgeColors() {
    for (let i = 0; i < this.poppedData.length; i++) {
      let c = ColorPickerComponent.mapColor(this.badgeColor, this.maxPropValue, this.poppedData[i].elem.data('__graphTheoreticProp'));
      for (let j = 0; j < this.poppedData[i].popper.children.length; j++) {
        (this.poppedData[i].popper.children[j] as HTMLSpanElement).style.background = c;
      }
    }
  }

  colorSelected(s: string) {
    this.badgeColor = s;
  }

}
