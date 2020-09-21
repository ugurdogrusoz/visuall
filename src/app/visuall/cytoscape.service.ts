import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import * as C from './constants';
import { GlobalVariableService } from './global-variable.service';
import { TimebarService } from './timebar.service';
import { MarqueeZoomService } from './cytoscape/marquee-zoom.service';
import { GraphResponse, GraphElem } from './db-service/data-types';
import { UserPrefHelper } from './user-pref-helper';
import { MergedElemIndicatorTypes, TextWrapTypes, GroupingOptionTypes } from './user-preference';
import { UserProfileService } from './user-profile.service';
import { LouvainClustering } from '../../lib/louvain-clustering/LouvainClustering';
import { ErrorModalComponent } from './popups/error-modal/error-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CyExtService } from './cy-ext.service';
@Injectable({
  providedIn: 'root'
})
export class CytoscapeService {
  userPrefHelper: UserPrefHelper;
  removePopperFn: Function;
  showObjPropsFn: Function;
  showStatsFn: Function;
  louvainClusterer: LouvainClustering;
  constructor(private _g: GlobalVariableService, private _timebarService: TimebarService, private _cyExtService: CyExtService,
    private _marqueeZoomService: MarqueeZoomService, private _profile: UserProfileService, private _modalService: NgbModal) {
    this.userPrefHelper = new UserPrefHelper(this, this._timebarService, this._g, this._profile);
    this.louvainClusterer = new LouvainClustering();
  }

  initCy(containerElem) {
    this._cyExtService.registerExtensions();

    this._g.layout = this._g.getFcoseOptions();
    this._g.cy = cytoscape({
      container: containerElem,
      layout: this._g.layout,
      // initial viewport state:
      zoom: 1,
      pan: { x: 0, y: 0 },
      // interaction options:
      minZoom: 1e-50,
      maxZoom: 1e50,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single',
      touchTapThreshold: 8,
      desktopTapThreshold: 4,
      autolock: false,
      autoungrabify: false,
      autounselectify: false,
      // rendering options:
      headless: false,
      styleEnabled: true,
      hideEdgesOnViewport: false,
      hideLabelsOnViewport: false,
      textureOnViewport: false,
      motionBlur: false,
      motionBlurOpacity: 0.2,
      wheelSensitivity: 0.1,
      pixelRatio: 'auto'
    });
    this._cyExtService.bindExtensions();

    this.bindComponentSelector();
    this.bindSelectObjOfThisType();
    this._marqueeZoomService.init();
    (<any>window).cy = this._g.cy;
    this._g.cy.on('select unselect', (e) => { this.elemSelected(e) });
    this._g.cy.on('select unselect add remove tap', () => { this.statsChanged() });
    this._g.cy.on('add', C.debounce(this.applyStyle4NewElements, C.CY_BATCH_END_DELAY).bind(this));
    this.userPrefHelper.listen4UserPref();
    this._g.listen4graphEvents();
  }

  private runLayoutIfNoTimebar() {
    if (!this._g.userPrefs.timebar.isEnabled.getValue()) {
      this._g.performLayout(false);
    }
  }

  private elemSelected(e) {
    if (e.type == 'select') {
      if (this._g.isSwitch2ObjTabOnSelect) {
        this._g.operationTabChanged.next(0);
      }
    }
    if (this.showObjPropsFn) {
      this.showObjPropsFn();
    }
  }

  private statsChanged() {
    if (this.showStatsFn) {
      this.showStatsFn();
    }
  }

  private applyStyle4NewElements() {
    this._g.cy.startBatch();
    this.fitLabel2Node();
    this.showHideEdgeLabels();
    setTimeout(() => { this._g.cy.endBatch(); }, C.CY_BATCH_END_DELAY);
  }

  setNodeSizeOnGraphTheoreticProp(maxVal: number, avgSize: number) {
    if (maxVal <= 0) {
      maxVal = 1;
    }
    this._g.cy.style().selector('node.graphTheoreticDisplay')
      .style(
        {
          'width': (e) => {
            let b = avgSize + 20;
            let a = Math.max(5, avgSize - 20);
            let x = e.data('__graphTheoreticProp');
            return ((b - a) * x / maxVal + a) + 'px';
          },
          'height': (e) => {
            let b = avgSize + 20;
            let a = Math.max(5, avgSize - 20);
            let x = e.data('__graphTheoreticProp');
            return (((b - a) * x / maxVal + a) * e.height() / e.width()) + 'px';
          }
        })
      .update();
  }

  bindViewUtilitiesExtension() {
    this._cyExtService.bindViewUtilitiesExtension();
  }

  setNavigatorPosition() {
    this._cyExtService.setNavigatorPosition();
  }

  loadElementsFromDatabase(data: GraphResponse, isIncremental: boolean) {
    if (!data || !data.nodes || !data.edges) {
      console.error('Empty response from database!');
      return;
    }
    const nodes = data.nodes;
    const edges = data.edges;

    let current = this._g.cy.nodes(':visible');
    let elemIds: string[] = [];
    let cyNodes = [];
    for (let i = 0; i < nodes.length; i++) {
      let cyNodeId = 'n' + nodes[i].id;
      cyNodes.push(this.createCyNode(nodes[i], cyNodeId));
      elemIds.push(cyNodeId);
    }

    let cyEdges = [];
    let collapsedEdgeIds = {};
    if (isIncremental) {
      collapsedEdgeIds = this.getCollapsedEdgeIds();
    }
    for (let i = 0; i < edges.length; i++) {
      let cyEdgeId = 'e' + edges[i].id;
      if (collapsedEdgeIds[cyEdgeId]) {
        elemIds.push(collapsedEdgeIds[cyEdgeId]);
        continue;
      }
      cyEdges.push(this.createCyEdge(edges[i], cyEdgeId));
      elemIds.push(cyEdgeId)
    }

    this._g.switchLayoutRandomization(!isIncremental);

    if (!isIncremental) {
      this._g.cy.elements().remove();
    }
    let prevElems = this._g.cy.$(':visible');
    const wasEmpty = this._g.cy.elements().length < 2;

    this._g.cy.add(cyNodes);
    this._g.cy.add(cyEdges);
    let compoundEdgeIds = Object.values(collapsedEdgeIds) as string[];
    if (this._g.userPrefs.isCollapseMultiEdgesOnLoad.getValue()) {
      this.collapseMultiEdges();
    }
    let compoundEdgeIds2 = this._g.cy.edges('.' + C.COLLAPSED_EDGE_CLASS).map(x => x.id());
    elemIds.push(...C.arrayDiff(compoundEdgeIds, compoundEdgeIds2));
    // elements might already exist but hidden, so show them
    this._g.viewUtils.show(this._g.cy.$(elemIds.map(x => '#' + x).join(',')));

    this._g.applyClassFiltering();

    if (isIncremental && !wasEmpty) {
      let collection = this._g.cy.collection();
      for (let i = 0; i < cyNodes.length; i++) {
        let node = this._g.cy.getElementById(cyNodes[i].data.id);
        if (!current.contains(node)) {
          collection = collection.union(node);
        }
      }
      this._g.layoutUtils.placeNewNodes(collection);
    }

    const shouldRandomize = !isIncremental || wasEmpty;
    const hasNew = this.hasNewElem(elemIds, prevElems);
    if (this._g.userPrefs.timebar.isEnabled.getValue()) {
      this._timebarService.isRandomizedLayout = shouldRandomize; // make randomized layout on the next load
    }
    if (hasNew) {
      this._g.performLayout(shouldRandomize);
    }
    this.highlightElems(isIncremental, elemIds);
  }

  hasNewElem(newElemIds: string[], prevElems: any) {
    let d = {};

    for (let i = 0; i < prevElems.length; i++) {
      d[prevElems[i].id()] = true;
    }

    for (let i = 0; i < newElemIds.length; i++) {
      if (!d[newElemIds[i]]) {
        return true;
      }
    }
    return false;
  }

  collapseMultiEdges(edges2collapse?: any) {
    if (!edges2collapse) {
      edges2collapse = this._g.cy.edges(':visible');
    }
    edges2collapse = edges2collapse.filter('[^originalEnds]'); // do not collapse meta-edges
    let sourceTargetPairs = {};
    let isCollapseBasedOnType = this._g.userPrefs.isCollapseEdgesBasedOnType.getValue();
    let edgeCollapseLimit = this._g.userPrefs.edgeCollapseLimit.getValue();
    for (let i = 0; i < edges2collapse.length; i++) {
      let e = edges2collapse[i];
      const s = e.data('source');
      const t = e.data('target');
      let edgeId = s + t;
      if (isCollapseBasedOnType) {
        edgeId = e.classes()[0] + s + t;
      }
      if (!sourceTargetPairs[edgeId]) {
        sourceTargetPairs[edgeId] = { cnt: 1, s: s, t: t };
      } else {
        sourceTargetPairs[edgeId]['cnt'] += 1;
      }
    }
    for (let i in sourceTargetPairs) {
      let curr = sourceTargetPairs[i];
      if (curr.cnt < edgeCollapseLimit) {
        continue;
      }
      let edges = this._g.cy.edges(`[source="${curr.s}"][target="${curr.t}"]`);
      this._g.expandCollapseApi.collapseEdges(edges);
    }
    this._g.isLoadFromExpandCollapse = true;
  }

  expandMultiEdges(edges2expand?: any) {
    if (!edges2expand) {
      edges2expand = this._g.cy.edges('.' + C.COLLAPSED_EDGE_CLASS);
    }
    this._g.expandCollapseApi.expandEdges(edges2expand);
    this._g.isLoadFromExpandCollapse = true;
  }

  collapseNodes() {
    if (this._g.cy.nodes(':parent').length > 0) {
      this._g.expandCollapseApi.collapseAll();
    }
  }

  private getCollapsedEdgeIds(): any {
    let compoundEdges = this._g.cy.edges('.' + C.COLLAPSED_EDGE_CLASS);
    let collapsedEdgeIds = {};
    for (let i = 0; i < compoundEdges.length; i++) {
      let collapsed = compoundEdges[i].data('collapsedEdges');
      for (let j = 0; j < collapsed.length; j++) {
        collapsedEdgeIds[collapsed[j].id()] = compoundEdges[i].id();
      }
    }
    return collapsedEdgeIds;
  }

  highlightElems(isIncremental: boolean, elemIds: string[]) {
    if (!isIncremental) {
      return;
    }
    // remove all existing hightlights before hightlighting new elements
    const newElemIndicator = this._g.userPrefs.mergedElemIndicator.getValue();

    if (this._g.userPrefs.isOnlyHighlight4LatestQuery.getValue()) {
      if (newElemIndicator == MergedElemIndicatorTypes.highlight) {
        this._g.viewUtils.removeHighlights();
      }
      if (newElemIndicator == MergedElemIndicatorTypes.selection) {
        this._g.cy.$().unselect();
      }
    }
    let ele2highlight = this._g.cy.collection();
    const cnt = elemIds.length;
    for (let i = 0; i < cnt; i++) {
      ele2highlight.merge('#' + elemIds.pop());
    }
    if (newElemIndicator == MergedElemIndicatorTypes.selection) {
      this._g.isSwitch2ObjTabOnSelect = false;
      ele2highlight.select();
      this._g.isSwitch2ObjTabOnSelect = true;
    } else if (newElemIndicator == MergedElemIndicatorTypes.highlight) {
      this._g.highlightElems(ele2highlight);
    }
  }

  createCyNode(node, id) {
    const classes = node.labels.join(' ');
    let properties = node.properties;
    properties.id = id

    return { data: properties, classes: classes };
  }

  createCyEdge(edge, id) {
    let properties = edge.properties;
    properties.id = id;
    properties.source = 'n' + edge.startNode;
    properties.target = 'n' + edge.endNode;

    return { data: properties, classes: edge.type };
  }

  showHideEdgeLabels() {
    this._g.cy.startBatch();
    this._g.cy.edges().removeClass('nolabel');
    if (!this._g.userPrefs.isShowEdgeLabels.getValue()) {
      this._g.cy.edges().addClass('nolabel');
    }
    setTimeout(() => { this._g.cy.endBatch(); }, C.CY_BATCH_END_DELAY);
  }

  fitLabel2Node() {
    this._g.cy.startBatch();
    let nodes = this._g.cy.nodes().not(':parent').not('.' + C.CLUSTER_CLASS);
    let wrapType = this._g.userPrefs.nodeLabelWrap.getValue();

    nodes.removeClass('ellipsis_label wrap_label');
    if (wrapType == TextWrapTypes.ellipsis) {
      for (let i = 0; i < nodes.length; i++) {
        let origLabel = this._g.getLabels4Elems([nodes[i].id().substr(1)]);
        nodes[i].data('__label__', this.truncateText(origLabel, nodes[i]));
      }
      nodes.addClass('ellipsis_label');
    } else if (wrapType == TextWrapTypes.wrap) {
      nodes.addClass('wrap_label');
    }
    setTimeout(() => { this._g.cy.endBatch(); }, C.CY_BATCH_END_DELAY);
  }

  truncateText(label: string, ele: any): string {
    let context = document.createElement('canvas').getContext("2d");

    let fStyle = ele.pstyle('font-style').strValue;
    let size = ele.pstyle('font-size').pfValue + 'px';
    let family = ele.pstyle('font-family').strValue;
    let weight = ele.pstyle('font-weight').strValue;

    context.font = fStyle + ' ' + weight + ' ' + size + ' ' + family;
    let text = label || '';
    let textWidth = ele.width();
    return this.findFittedTxt(context, text, textWidth);
  }

  private findFittedTxt(ctx: CanvasRenderingContext2D, txt: string, wid: number) {
    let len = txt.length;
    if (ctx.measureText(txt.substr(0, len)).width <= wid) {
      return txt;
    }
    let maxIdx = len - 1;
    let minIdx = 1;

    // binary search through possible interval
    while (true) {
      let doesFit = ctx.measureText(txt.substr(0, len) + '..').width <= wid;
      if (doesFit && ctx.measureText(txt.substr(0, len + 1) + '..').width >= wid) {
        break;
      }
      if (doesFit) {
        minIdx = len;
        len = Math.ceil((len + maxIdx) / 2);
      } else {
        maxIdx = len;
        len = Math.floor((len + minIdx) / 2);
      }
    }
    return txt.substr(0, len) + '..';
  }

  bindHighlightOnHoverListeners() {
    let highlighterFn = this.highlightNeighbors();
    let events = `${C.EV_MOUSE_ON} ${C.EV_MOUSE_OFF}`;
    let targets = 'node, edge'
    this._g.cy.on(events, targets, highlighterFn.bind(this));
  }

  highlightNeighbors() {
    let timerId;
    let currOpacity = 1;
    let nextOpacity = 1;

    return function (event: { target: any, type: string, cySelector?: string }) {
      let elements2remain = null;
      if (event.cySelector != undefined) {
        elements2remain = this._g.cy.$(event.cySelector);
      } else {
        elements2remain = event.target.neighborhood().union(event.target);
        if (event.target.isEdge()) {
          elements2remain = event.target.connectedNodes().union(event.target);
        }
      }

      if (event.type === C.EV_MOUSE_ON) {
        timerId = setTimeout(function () {
          currOpacity = nextOpacity;
          nextOpacity = C.HIGHLIGHT_OPACITY;
          // eliminate unnecassary animation, it causes blinking
          if (currOpacity != nextOpacity) {
            // blur if there are any remaining
            if (elements2remain.length > 0) {
              this.setOtherElementsOpacity(elements2remain, C.HIGHLIGHT_OPACITY);
            }
          }
        }.bind(this), C.HIGHLIGHT_WAIT_DUR);
      } else {
        clearTimeout(timerId);
        currOpacity = nextOpacity;
        nextOpacity = 1;
        if (currOpacity != nextOpacity) {
          this.setOtherElementsOpacity(elements2remain, 1);
        }
      }
    }.bind(this);
  }

  setOtherElementsOpacity(elements, opacity) {
    this._g.cy.startBatch();
    this._g.cy.elements().difference(elements).style({ opacity: opacity });
    setTimeout(() => { this._g.cy.endBatch(); }, C.CY_BATCH_END_DELAY);
  }

  highlightSelected() {
    const selected = this._g.cy.$(':selected');
    if (selected.length < 1) {
      return;
    }
    this._g.highlightElems(selected);
  }

  staticHighlightNeighbors() {
    let selected = this._g.cy.$(':selected');
    let neighbors = selected.neighborhood();
    this._g.highlightElems(selected.union(neighbors));
  }

  removeHighlights() {
    this._g.viewUtils.removeHighlights();
    this.removePopperFn();
  }

  unbindHighlightOnHoverListeners() {
    this._g.cy.off(`${C.EV_MOUSE_ON} ${C.EV_MOUSE_OFF}`, 'node, edge');
  }

  highlighterCheckBoxClicked(isChecked: boolean) {
    if (!isChecked) {
      this.unbindHighlightOnHoverListeners();
    } else {
      this.bindHighlightOnHoverListeners();
    }
  }

  navigatorCheckBoxClicked(isChecked: boolean) {
    if (isChecked) {
      this._cyExtService.bindNavigatorExtension();
    } else {
      this._cyExtService.unbindNavigatorExtension();
    }
  }


  showHideTimebar(isChecked: boolean) {
    this._g.cy.resize();
    this._timebarService.showHideTimebar(isChecked);
    setTimeout(() => { this._cyExtService.setNavigatorPosition() }, 0);
  }

  loadFile(file: File) {
    C.readTxtFile(file, (txt) => {
      const fileJSON = JSON.parse(txt);
      this._g.cy.json({ elements: fileJSON });
      this._g.cy.fit();
    });
  }

  private str2file(str: string, fileName: string) {
    const blob = new Blob([str], { type: 'text/plain' });
    const anchor = document.createElement('a');

    anchor.download = fileName;
    anchor.href = (window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl =
      ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
  }

  saveAsJson() {
    let hasAnyCollapsed = this._g.cy.nodes('.' + C.COLLAPSED_NODE_CLASS).length > 0 || this._g.cy.edges('.' + C.COLLAPSED_EDGE_CLASS).length > 0;
    if (hasAnyCollapsed) {
      const instance = this._modalService.open(ErrorModalComponent);
      instance.componentInstance.msg = 'Cannot save due to collapsed node(s) and/or edge(s)';
      instance.componentInstance.title = 'Save';
      return;
    }
    const json = this._g.cy.json();
    const elements = json.elements;
    if (!elements.nodes) {
      return;
    }
    this.str2file(JSON.stringify(elements, undefined, 4), 'visuall.txt');
  }

  saveSelectedAsJson() {
    const selected = this._g.cy.$(':selected');
    let hasAnyCollapsed = selected.nodes('.' + C.COLLAPSED_NODE_CLASS).length > 0 || selected.edges('.' + C.COLLAPSED_EDGE_CLASS).length > 0;
    if (hasAnyCollapsed) {
      const instance = this._modalService.open(ErrorModalComponent);
      instance.componentInstance.msg = 'Cannot save selected objects due to collapsed node(s) and/or edge(s)';
      instance.componentInstance.title = 'Save Selected Objects';
      return;
    }

    const selectedNodes = selected.nodes();
    const selectedEdges = selected.edges();
    if (selectedEdges.length + selectedNodes.length < 1) {
      return;
    }
    // according to cytoscape.js format 
    const o = { nodes: [], edges: [] };
    for (const e of selectedEdges) {
      o.edges.push(e.json());
    }
    for (const n of selectedNodes) {
      o.nodes.push(n.json());
    }

    this.str2file(JSON.stringify(o), 'visuall.txt');
  }

  saveAsCSV(objs: GraphElem[]) {
    if (!objs || objs.length < 1) {
      return;
    }

    const cols = ['className'].concat(Object.keys(objs[0].data));
    const arr: string[][] = [];
    arr.push(cols);
    for (const o of objs) {
      arr.push([o.classes.split(' ')[0], ...Object.values(o.data) as string[]]);
    }
    const str = arr.map(x => x.join('|')).join('\n');
    this.str2file(str, 'visuall_objects.csv');
  }

  saveAsPng(isWholeGraph: boolean) {
    const options = { bg: 'white', scale: 3, full: isWholeGraph };
    const base64png: string = this._g.cy.png(options);
    // just giving base64 string as link gives error on big images
    fetch(base64png)
      .then(res => res.blob())
      .then(x => {
        const anchor = document.createElement('a');
        anchor.download = 'visuall.png';
        anchor.href = (window.URL).createObjectURL(x);
        anchor.click();
      })
  }

  deleteSelected(event) {
    if (event) {
      const ele = event.target || event.cyTarget;
      this._g.cy.remove(ele);
    } else {
      this._g.cy.remove(':selected');
    }
    this._g.handleCompoundsOnHideDelete();
    this.runLayoutIfNoTimebar();
  }

  private addParentNode(idSuffix: string | number, parent = undefined) {
    const id = 'c' + idSuffix;
    const parentNode = this.createCyNode({ labels: [C.CLUSTER_CLASS], properties: { end_datetime: 0, begin_datetime: 0, name: name } }, id);
    this._g.cy.add(parentNode);
    this._g.cy.$('#' + id).move({ parent: parent });
  }

  addGroup4Selected() {
    const elems = this._g.cy.nodes(':selected');
    if (elems.length < 1) {
      return;
    }
    const parent = elems[0].parent().id();
    for (let i = 1; i < elems.length; i++) {
      if (parent !== elems[i].parent().id()) {
        return;
      }
    }
    const id = new Date().getTime();
    this.addParentNode(id, parent);
    for (let i = 0; i < elems.length; i++) {
      elems[i].move({ parent: 'c' + id });
    }
    this._g.performLayout(false);
  }

  removeGroup4Selected(elems = undefined) {
    if (!elems) {
      elems = this._g.cy.nodes(':selected').filter('.' + C.CLUSTER_CLASS);
    }
    if (elems.length < 1) {
      return;
    }
    for (let i = 0; i < elems.length; i++) {
      // expand if collapsed
      if (elems[i].hasClass(C.COLLAPSED_NODE_CLASS)) {
        this._g.expandCollapseApi.expand(elems[i], { layoutBy: null, fisheye: false, animate: false });
      }
      const grandParent = elems[i].parent().id() ?? null;
      const children = elems[i].children();
      children.move({ parent: grandParent });
      this._g.cy.remove(elems[i]);
    }
    this._g.performLayout(false);
  }

  showHideSelectedElements(isHide: boolean) {
    if (isHide) {
      let selected = this._g.cy.$(':selected').not('.' + C.META_EDGE_CLASS);
      this._g.viewUtils.hide(selected);
      this.hideCompounds(selected);
      this._g.applyClassFiltering();
      if (selected.length > 0) {
        this._g.performLayout(false);
      }
    } else {
      if (!this.isAnyHidden()) {
        return;
      }
      const prevVisible = this._g.cy.$(':visible');
      this._g.viewUtils.show(this._g.cy.$());
      this._g.applyClassFiltering();
      this._timebarService.coverVisibleRange();
      this.showAllCollapsed();
      const currVisible = this._g.cy.$(':visible');
      if (!currVisible.same(prevVisible)) {
        if (prevVisible.length > 0) {
          this._g.layoutUtils.placeNewNodes(currVisible.difference(prevVisible).nodes());
        }
        this._g.performLayout(false);
      }
    }
  }

  hideUnselected() {
    let unselected = this._g.cy.$().not(':selected').not('.' + C.META_EDGE_CLASS);
    this._g.viewUtils.hide(unselected);
    this.hideCompounds(unselected);
    this._g.applyClassFiltering();
    if (unselected.length > 0) {
      this._g.performLayout(false);
    }
  }

  showAllCollapsed() {
    const collapsedNodes = this._g.cy.$('.' + C.COLLAPSED_NODE_CLASS);
    for (let i = 0; i < collapsedNodes.length; i++) {
      this.showCollapsed4Node(collapsedNodes[i]);
    }

    const collapsedEdges = this._g.cy.$('.' + C.COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < collapsedEdges.length; i++) {
      this.showCollapsed4Edge(collapsedEdges[i]);
    }
  }

  showCollapsed4Node(node) {
    const collapsed = node.data('collapsedChildren');
    this._g.viewUtils.show(collapsed);
    const collapsedNodes = collapsed.filter('.' + C.COLLAPSED_NODE_CLASS);
    for (let i = 0; i < collapsedNodes.length; i++) {
      this.showCollapsed4Node(collapsedNodes[i]);
    }

    const collapsedEdges = collapsed.filter('.' + C.COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < collapsedEdges.length; i++) {
      this.showCollapsed4Edge(collapsedEdges[i]);
    }
  }

  showCollapsed4Edge(edge) {
    const collapsed = edge.data('collapsedEdges');
    this._g.viewUtils.show(collapsed);
    const collapsedEdges = collapsed.filter('.' + C.COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < collapsedEdges.length; i++) {
      this.showCollapsed4Edge(collapsedEdges[i]);
    }
  }

  // expands all the compound nodes and deletes them recursively
  hideCompounds(elems) {
    const nodes = elems.filter('.' + C.CLUSTER_CLASS).not('.' + C.META_EDGE_CLASS);
    let collapsedEdgeIds = elems.union(elems.connectedEdges()).filter('.' + C.COLLAPSED_EDGE_CLASS).map(x => x.id());
    const edgeIdDict = {};
    for (const i of collapsedEdgeIds) {
      edgeIdDict[i] = true;
    }
    for (let i = 0; i < nodes.length; i++) {
      this.hideCompoundNode(nodes[i], edgeIdDict);
    }
    for (let i in edgeIdDict) {
      this.hideCompoundEdge(this._g.cy.edges('#' + i));
    }
  }

  hideCompoundNode(node, edgeIdDict) {
    let children = node.children(); // a node might have children
    let collapsed = node.data('collapsedChildren'); // a node might a collapsed 
    let collapsedEdgeIds = children.connectedEdges().filter('.' + C.COLLAPSED_EDGE_CLASS).map(x => x.id());

    if (collapsed) {
      children = children.union(collapsed);
      collapsedEdgeIds = collapsed.edges('.' + C.COLLAPSED_EDGE_CLASS).map(x => x.id());
      this._g.expandCollapseApi.expand(node, { layoutBy: null, fisheye: false, animate: false });
    }
    for (const i of collapsedEdgeIds) {
      edgeIdDict[i] = true;
    }

    // recursively apply for complex children
    const compoundNodes = children.filter('.' + C.CLUSTER_CLASS);
    for (let i = 0; i < compoundNodes.length; i++) {
      this.hideCompoundNode(compoundNodes[i], edgeIdDict);
    }

    // in recursive calls chilren are modified, this node should be an expanded compound node
    children = node.children(); // a node might have children
    children.move({ parent: node.data('parent') ?? null });
    this._g.viewUtils.hide(children);
    this._g.cy.remove(node);
  }

  hideCompoundEdge(edge) {
    if (!edge || edge.length < 1 || edge.not('.' + C.META_EDGE_CLASS).length < 1) {
      return;
    }
    let children = edge.data('collapsedEdges');
    // recursively apply for complex children
    const compoundEdges = children.filter('.' + C.COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < compoundEdges.length; i++) {
      this.hideCompoundEdge(compoundEdges[i]);
    }
    this._g.viewUtils.hide(children);
    this._g.expandCollapseApi.expandEdges(edge);
  }

  isAnyHidden() {
    return this._g.cy.$().map(x => x.hidden()).filter(x => x).length > 0;
  }

  markovClustering() {
    const opt = { attributes: [() => { return 1; }] };

    let clusters = this._g.cy.$(':visible').markovClustering(opt);
    if (this._g.userPrefs.groupingOption.getValue() == GroupingOptionTypes.compound) {
      for (let i = 0; i < clusters.length; i++) {
        this.addParentNode(i);
        clusters[i].move({ parent: 'c' + i });
      }
    } else {
      let arr = [];
      for (let i = 0; i < clusters.length; i++) {
        let a = [];
        for (let j = 0; j < clusters[i].length; j++) {
          a.push(clusters[i][j].id());
        }
        arr.push(a);
      }
      this._g.layout.clusters = arr;
      this._g.isUseCiseLayout = true;
    }
  }

  louvainClustering() {
    let clustering = this.louvainClusterer.cluster(this._g.cy.$(':visible'));
    let clusters = {};
    for (let n in clustering) {
      clusters[clustering[n]] = true;
    }
    if (this._g.userPrefs.groupingOption.getValue() == GroupingOptionTypes.compound) {
      // generate compound nodes
      for (let i in clusters) {
        this.addParentNode(i);
      }
      // add parents to non-compound nodes
      for (let n in clustering) {
        this._g.cy.$('#' + n).move({ parent: 'c' + clustering[n] });
      }
    } else {
      let arr = [];
      for (let i in clusters) {
        arr.push([]);
      }
      for (let i in clustering) {
        arr[clustering[i]].push(i);
      }
      this._g.layout.clusters = (node) => { return clustering[node.id()]; };
      this._g.isUseCiseLayout = true;
    }
  }

  clusterByDirector() {
    let directorEdges = this._g.cy.edges('.DIRECTOR').filter(':visible');
    let directorIds = new Set<string>();
    let movie2director = {};
    for (let i = 0; i < directorEdges.length; i++) {
      let edgeData = directorEdges[i].data();
      directorIds.add(edgeData.source);
      if (movie2director[edgeData.target]) {
        movie2director[edgeData.target].push(edgeData.source);
      } else {
        movie2director[edgeData.target] = [edgeData.source];
      }
    }

    if (this._g.userPrefs.groupingOption.getValue() == GroupingOptionTypes.compound) {
      // add parent nodes
      for (let id of directorIds) {
        let name = this._g.cy.$('#' + id).data().name;
        // for each director, generate a compound node
        this.addParentNode(id);
        // add the director to the compound node
        this._g.cy.$('#' + id).move({ parent: 'c' + id });
      }

      // assign nodes to parents
      for (let [k, v] of Object.entries(movie2director)) {
        // if a movie has less than 2 directors add, those movies to the cluster of director
        if (v['length'] < 2) {
          // add movies to the compound node
          this._g.cy.$('#' + k).move({ parent: 'c' + v[0] });
        }
      }
    } else {
      const clusters = {};
      for (let id of directorIds) {
        clusters[id] = [id];
      }
      for (let [k, v] of Object.entries(movie2director)) {
        // if a movie has less than 2 directors add, those movies to the cluster of director
        if (v['length'] < 2) {
          clusters[v[0]].push(k);
        }
      }
      console.log(' clusters for directors: ', clusters);
      console.log(' Object.values(clusters): ', Object.values(clusters));
      this._g.layout.clusters = Object.values(clusters);
      this._g.isUseCiseLayout = true;
    }

  }

  deleteClusteringNodes() {
    this._g.cy.$().move({ parent: null });
    this._g.cy.remove('node.' + C.CLUSTER_CLASS);
  }

  expandAllCompounds() {
    if (this._g.cy.nodes('.' + C.COLLAPSED_NODE_CLASS).length > 0) {
      this._g.expandCollapseApi.expandAll();
    }
  }

  bindComponentSelector() {
    let isSelectionLocked = false;

    this._g.cy.on('taphold', 'node, edge', (e) => {
      if (!e.originalEvent.shiftKey) {
        return;
      }
      e.target.component().select();
      // it selects current node again to prevent that, disable selection until next tap event
      this._g.cy.autounselectify(true);
      isSelectionLocked = true;
    });

    this._g.cy.on('tapend', 'node, edge', () => {
      if (!isSelectionLocked) {
        return;
      }
      // wait to prevent unselect clicked node, after tapend 
      setTimeout(() => {
        this._g.cy.autounselectify(false);
        isSelectionLocked = false;
      }, 100);
    });
  }

  bindSelectObjOfThisType() {
    let isSelectionLocked = false;

    this._g.cy.on('taphold', 'node, edge', (e) => {
      if (!e.originalEvent.ctrlKey) {
        return;
      }
      const model = this._g.dataModel.getValue();
      const classes = e.target.className();
      for (let c of classes) {
        if (model.nodes[c] || model.edges[c]) {
          this._g.cy.$('.' + c).select();
        }
      }
      // it selects current node again to prevent that, disable selection until next tap event
      this._g.cy.autounselectify(true);
      isSelectionLocked = true;
    });

    this._g.cy.on('tapend', 'node, edge', () => {
      if (!isSelectionLocked) {
        return;
      }
      // wait to prevent unselect clicked node, after tapend 
      setTimeout(() => {
        this._g.cy.autounselectify(false);
        isSelectionLocked = false;
      }, 100);
    });
  }

  setRemovePoppersFn(fn) {
    this.removePopperFn = fn;
  }


}
