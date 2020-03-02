import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import navigator from 'cytoscape-navigator';
import panzoom from 'cytoscape-panzoom';
import fcose from 'cytoscape-fcose';
import expandCollapse from 'cytoscape-expand-collapse';
import viewUtilities from 'cytoscape-view-utilities';
import layoutUtilities from 'cytoscape-layout-utilities';
import stylesheet from '../assets/generated/stylesheet.json';
import * as C from './constants';
import * as $ from 'jquery';
import { GlobalVariableService } from './global-variable.service';
import { DbAdapterService } from './db-service/db-adapter.service';
import { TimebarService } from './timebar.service';
import { MarqueeZoomService } from './cytoscape/marquee-zoom.service';
import { GraphResponse } from './db-service/data-types';
import timebar from '../lib/timebar/cytoscape-timebar';

@Injectable({
  providedIn: 'root'
})
export class CytoscapeService {
  cyNavi: any;
  cyNaviPositionSetter: EventListenerOrEventListenerObject;
  removePopperFn: Function;
  showObjPropsFn: Function;

  constructor(private _g: GlobalVariableService, private _dbService: DbAdapterService, private _timebarService: TimebarService, private _marqueeZoomService: MarqueeZoomService) {
  }

  initCy(containerElem) {
    // register timebar extension
    timebar(cytoscape);
    // register navigator extension
    navigator(cytoscape);
    // register view utilities extension
    viewUtilities(cytoscape, $);
    //register expand-collapse extension
    expandCollapse(cytoscape, $);
    //register layour utilities extension
    layoutUtilities(cytoscape, $);
    // use fcose layout algorithm
    cytoscape.use(fcose);

    this._g.layout = {
      name: 'fcose',
      // 'draft', 'default' or 'proof' 
      // - 'draft' only applies spectral layout 
      // - 'default' improves the quality with incremental layout (fast cooling rate)
      // - 'proof' improves the quality with incremental layout (slow cooling rate) 
      quality: 'default',
      // use random node positions at beginning of layout
      // if this is set to false, then quality option must be 'proof'
      randomize: true,
      // whether or not to animate the layout
      animate: true,
      // duration of animation in ms, if enabled
      animationDuration: 1000,
      // easing of animation, if enabled
      animationEasing: undefined,
      // fit the viewport to the repositioned nodes
      fit: true,
      // padding around layout
      padding: 10,
      // whether to include labels in node dimensions. Valid in 'proof' quality
      nodeDimensionsIncludeLabels: false,

      /* spectral layout options */

      // false for random, true for greedy sampling
      samplingType: true,
      // sample size to construct distance matrix
      sampleSize: 25,
      // separation amount between nodes
      nodeSeparation: 75,
      // power iteration tolerance
      piTol: 0.0000001,

      /* incremental layout options */

      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: 4500,
      // Ideal edge (non nested) length
      idealEdgeLength: 50,
      // Divisor to compute edge forces
      edgeElasticity: 0.45,
      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 0.1,
      // Gravity force (constant)
      gravity: 0.25,
      // Maximum number of iterations to perform
      numIter: 2500,
      // For enabling tiling
      tile: false,
      // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingVertical: 10,
      // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingHorizontal: 10,
      // Gravity range (constant) for compounds
      gravityRangeCompound: 1.5,
      // Gravity force (constant) for compounds
      gravityCompound: 1.0,
      // Gravity range (constant)
      gravityRange: 3.8,
      // Initial cooling factor for incremental layout  
      initialEnergyOnIncremental: 0.3,

      /* layout event callbacks */
      ready: () => { }, // on layoutready
      stop: () => { } // on layoutstop
    };

    this._g.cy = cytoscape({
      container: containerElem,
      style: stylesheet,
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
    this.bindNavigatorExtension();
    this.bindViewUtilitiesExtension();
    this.bindLayoutUtilitiesExtension();
    this.bindPanZoomExtension();
    this.bindExpandCollapseExtension();
    this.bindComponentSelector();
    this._marqueeZoomService.init();
    this.addOtherStyles();
    (<any>window).cy = this._g.cy;

    this._g.cy.on('select unselect', (e) => { this.elemSelection(e) });
  }

  private elemSelection(e) {
    if (e.type == 'select') {
      // do not change tab if selection is originated from load
      if (this._g.isSelectFromLoad && this._g.userPrefs.mergedElemIndicator.getValue() == 0) {
        this._g.isSelectFromLoad = false;
      } else {
        this._g.operationTabChanged.next(0);
      }
    }
    if (this.showObjPropsFn) {
      this.showObjPropsFn();
    }
  }

  /** some styles uses functions, so they can't be added using JSON
   * or they should e added last to overrite some of the previously added
   */
  private addOtherStyles() {
    this._g.cy.style().selector('node.fitlabel')
      .style({ 'text-wrap': 'ellipsis', 'text-max-width': function (ele) { return ele.width() + 'px'; } })
      .update();

    this._g.cy.style().selector('edge.nolabel')
      .style({ 'label': '' })
      .update();
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

  bindLayoutUtilitiesExtension() {
    this._g.layoutUtils = this._g.cy.layoutUtilities({ desiredAspectRatio: this._g.cy.width() / this._g.cy.height() });
  }

  bindNavigatorExtension() {
    const cyNaviClass = 'cytoscape-navigator-wrapper';
    $('.cyContainer').append(`<div class='${cyNaviClass}'></div>`);

    this.setNavigatorPosition();
    var defaults = {
      container: `.${cyNaviClass}`,  // can be a HTML or jQuery
      // element or jQuery selector

      viewLiveFramerate:
        0,  // set false to update graph pan only on drag end; set 0 to do it
      // instantly; set a number (frames per second) to update not more
      // than N times per second

      thumbnailEventFramerate:
        30,  // max thumbnail's updates per second triggered by graph updates

      thumbnailLiveFramerate:
        false,  // max thumbnail's updates per second. Set false to disable

      dblClickDelay: 200,  // milliseconds

      removeCustomContainer:
        true,  // destroy the container specified by user on plugin destroy

      rerenderDelay: 100,  // ms to throttle rerender updates to the panzoom for
      // performance
    };

    this.cyNavi = this._g.cy.navigator(defaults);  // get navigator instance, nav
    this.cyNaviPositionSetter = this.setNavigatorPosition.bind(this);
    window.removeEventListener('resize', this.cyNaviPositionSetter);
    window.removeEventListener('scroll', this.cyNaviPositionSetter);

    window.addEventListener('resize', this.cyNaviPositionSetter);
    window.addEventListener('scroll', this.cyNaviPositionSetter);
    // to render navigator, fire zoom event
    this._g.cy.zoom(this._g.cy.zoom() + 0.00001);
    // to prevent expandCollapse extension's blocking 
    $('.' + cyNaviClass).css('z-index', 1000);
  }

  bindViewUtilitiesExtension() {
    let options = {
      node: {
        highlighted: C.HIGHLIGHTED_NODE_1,
        highlighted2: C.HIGHLIGHTED_NODE_2,
        highlighted3: C.HIGHLIGHTED_NODE_3,
        highlighted4: C.HIGHLIGHTED_NODE_4,
        selected: {
          'border-color': (ele) => {
            return inheritStyle(ele, 'border-color', true);
          },
          'border-width': (ele) => {
            return inheritStyle(ele, 'border-width', true);
          }
        }
      },
      edge: {
        highlighted: C.HIGHLIGHTED_EDGE_1,
        highlighted2: C.HIGHLIGHTED_EDGE_2,
        highlighted3: C.HIGHLIGHTED_EDGE_3,
        highlighted4: C.HIGHLIGHTED_EDGE_4,
        selected: {
          'line-color': (ele) => {
            return inheritStyle(ele, 'line-color', false);
          },
          'target-arrow-color': (ele) => {
            return inheritStyle(ele, 'target-arrow-color', false);
          },
          'width': (ele) => {
            return inheritStyle(ele, 'width', false);
          }
        }
      },
      setVisibilityOnHide: false, // whether to set visibility on hide/show
      setDisplayOnHide: true, // whether to set display on hide/show
      zoomAnimationDuration: 1500, //default duration for zoom animation speed
      neighbor: function (node) { // return desired neighbors of tapheld node
        return false;
      },
      neighborSelectTime: 500, //ms, time to taphold to select desired neighbors,
      colorCount: C.MAX_HIGHLIGHT_CNT
    };
    this._g.viewUtils = this._g.cy.viewUtilities(options);

    function inheritStyle(ele, styleKey, isNode) {
      const h1 = isNode ? C.HIGHLIGHTED_NODE_1 : C.HIGHLIGHTED_EDGE_1;
      const h2 = isNode ? C.HIGHLIGHTED_NODE_2 : C.HIGHLIGHTED_EDGE_2;
      const h3 = isNode ? C.HIGHLIGHTED_NODE_3 : C.HIGHLIGHTED_EDGE_3;
      const h4 = isNode ? C.HIGHLIGHTED_NODE_4 : C.HIGHLIGHTED_EDGE_4;

      let style = h1[styleKey];
      if (ele.hasClass('highlighted2'))
        style = h2[styleKey];
      else if (ele.hasClass('highlighted3'))
        style = h3[styleKey];
      else if (ele.hasClass('highlighted4'))
        style = h4[styleKey];
      return style;
    }
  }

  bindPanZoomExtension() {
    panzoom(cytoscape);  // register extension
    // the default values of each option are outlined below:
    const defaults = {
      zoomFactor: 0.05,     // zoom factor per zoom tick
      zoomDelay: 45,        // how many ms between zoom ticks
      minZoom: 0.1,         // min zoom level
      maxZoom: 10,          // max zoom level
      fitPadding: 50,       // padding when fitting
      panSpeed: 10,         // how many ms in between pan ticks
      panDistance: 10,      // max pan distance per tick
      panDragAreaSize: 75,  // the length of the pan drag box in which the
      // vector for panning is calculated (bigger = finer
      // control of pan speed and direction)
      panMinPercentSpeed:
        0.25,  // the slowest speed we can pan by (as a percent of panSpeed)
      panInactiveArea: 8,           // radius of inactive area in pan drag box
      panIndicatorMinOpacity: 0.5,  // min opacity of pan indicator (the
      // draggable nib); scales from this to 1.0
      zoomOnly: false,  // a minimal version of the ui only with zooming (useful
      // on systems with bad mousewheel resolution)
      fitSelector: undefined,     // selector of elements to fit
      animateOnFit: function () {  // whether to animate on fit
        return true;
      },
      fitAnimationDuration: 1000,  // duration of animation on fit

      // icon class names
      sliderHandleIcon: 'fa fa-minus',
      zoomInIcon: 'fa fa-plus',
      zoomOutIcon: 'fa fa-minus',
      resetIcon: 'fa fa-expand'
    };

    // add the panzoom control
    this._g.cy.panzoom(defaults);
  }

  bindExpandCollapseExtension() {
    this._g.cy.expandCollapse({
      layoutBy: this._g.layout, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
      // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
      fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
      animate: true, // whether to animate on drawing changes you can specify a function too
      ready: function () { }, // callback when expand/collapse initialized
      undoable: false, // and if undoRedoExtension exists,
      randomize: false,

      cueEnabled: true, // Whether cues are enabled
      expandCollapseCuePosition: C.expandCollapseCuePosition,
      expandCollapseCueSize: C.EXPAND_COLLAPSE_CUE_SIZE, // size of expand-collapse cue
      expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
      expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
      collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
      expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
    });

    this._g.expandCollapseApi = this._g.cy.expandCollapse('get');
  }

  getNeighbors(event) {
    const ele = event.target || event.cyTarget;
    this._dbService.getNeighbors([ele.id().substr(1)], (x) => { this.loadElementsFromDatabase(x, true) });
  }

  setNavigatorPosition() {
    const navSelector = '.cytoscape-navigator-wrapper';
    const containerSelector = '.cyContainer';

    const topCy = $(containerSelector).offset().top - window.scrollY;
    const leftCy = $(containerSelector).offset().left;
    const heightCy = $(containerSelector).outerHeight();
    const widthCy = $(containerSelector).outerWidth();
    const heightNavigator = $(navSelector).outerHeight();
    const widthNavigator = $(navSelector).outerWidth();
    $(navSelector).css('top', heightCy + topCy - heightNavigator);
    $(navSelector).css('left', widthCy + leftCy - widthNavigator);
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
    let cy_nodes = [];
    for (let i = 0; i < nodes.length; i++) {
      cy_nodes.push(this.createCyNode(nodes[i], 'n' + nodes[i].id));
      elemIds.push('n' + nodes[i].id);
    }

    let cy_edges = [];
    for (let i = 0; i < edges.length; i++) {
      cy_edges.push(this.createCyEdge(edges[i], 'e' + edges[i].id));
      elemIds.push('e' + edges[i].id)
    }

    this._g.switchLayoutRandomization(!isIncremental);

    if (!isIncremental) {
      this._g.cy.elements().remove();
    }
    const wasEmpty = this._g.cy.elements().length < 2;

    this._g.cy.add(cy_nodes);
    this._g.cy.add(cy_edges);
    // elements might already exist but hidden, so show them
    this._g.viewUtils.show(this._g.cy.$(elemIds.map(x => '#' + x).join(',')));

    this._g.applyClassFiltering();

    if (isIncremental && !wasEmpty) {
      let collection = this._g.cy.collection();
      for (let i = 0; i < cy_nodes.length; i++) {
        let node = this._g.cy.getElementById(cy_nodes[i].data.id);
        if (!current.contains(node)) {
          collection = collection.union(node);
        }
      }
      this._g.layoutUtils.placeNewNodes(collection);
    }

    const shouldRandomize = !isIncremental || wasEmpty;
    if (this._g.userPrefs.timebar.isEnabled.getValue()) {
      this._timebarService.isRandomizedLayout = shouldRandomize; // make randomized layout on the next load
    } else {
      this._g.performLayout(shouldRandomize);
    }
    this.highlightElems(isIncremental, elemIds);
  }

  highlightElems(isIncremental: boolean, elemIds: string[]) {
    if (!isIncremental) {
      return;
    }
    // remove all existing hightlights before hightlighting new elements
    this._g.viewUtils.removeHighlights();
    let ele2highlight = this._g.cy.collection();
    const cnt = elemIds.length;
    for (let i = 0; i < cnt; i++) {
      ele2highlight.merge('#' + elemIds.pop());
    }
    if (this._g.userPrefs.mergedElemIndicator.getValue() == 0) {
      this._g.isSelectFromLoad = true;
      ele2highlight.select();
    } else {
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

  showHideEdgeLabelCheckBoxClicked(isChecked: boolean) {
    this._g.cy.edges().removeClass('nolabel');
    if (!isChecked) {
      this._g.cy.edges().addClass('nolabel');
    }
  }

  fitNodeLabelsCheckBoxClicked(isChecked: boolean) {
    this._g.cy.nodes().removeClass('fitlabel');
    if (isChecked) {
      this._g.cy.nodes().addClass('fitlabel');
    }
  }

  bindHighlightOnHoverListeners() {
    let highlighterFn = this.highlightNeighbors();
    this._g.cy.on(
      `${C.EV_MOUSE_ON} ${C.EV_MOUSE_OFF}`, 'node, edge',
      highlighterFn.bind(this));
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
    this._g.cy.elements().difference(elements).style({ opacity: opacity });
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
    this.unbindNavigatorExtension();
    if (isChecked) {
      this.bindNavigatorExtension();
    }
  }

  unbindNavigatorExtension() {
    window.removeEventListener('resize', this.cyNaviPositionSetter);
    window.removeEventListener('scroll', this.cyNaviPositionSetter);
    this.cyNavi.destroy();
  }

  showHideTimebar(isChecked: boolean) {
    if (!isChecked) {
      $('#cy').css('height', '90vh');
    } else {
      $('#cy').css('height', '75vh');
    }
    this._g.cy.resize();
    this._timebarService.showHideTimebar(isChecked);
    setTimeout(() => { this.setNavigatorPosition() }, 0);
  }

  loadFile(file: File) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      // Try to parse file into JSON object
      try {
        const fileJSON = JSON.parse(fileReader.result as string);
        this._g.cy.json({ elements: fileJSON });
        this._g.runLayout();
      } catch (error) {
        console.error('Given file is not suitable.', error);
      }
    };
    fileReader.onerror = (error) => {
      console.error('File could not be read!', error);
      fileReader.abort();
    };
    fileReader.readAsText(file);
  }

  saveAsJson() {
    const json = this._g.cy.json();
    const elements = json.elements;
    const file = JSON.stringify(elements, undefined, 4);

    const blob = new Blob([file], { type: 'text/plain' });
    const anchor = document.createElement('a');

    anchor.download = 'visuall.txt';
    anchor.href = (window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl =
      ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
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
  }

  showHideSelectedElements(isHide: boolean) {
    if (isHide) {
      let selected = this._g.cy.$(':selected');
      this._g.viewUtils.hide(selected);
      this._g.applyClassFiltering();
      if (selected.length > 0) {
        this._g.performLayout(false);
      }
    } else {
      if (!this.isAnyHidden()) {
        return;
      }
      let hiddenNodes = this._g.cy.nodes(':hidden');
      let prevVisible = this._g.cy.nodes(':visible');
      if (prevVisible.length > 0) {
        this._g.layoutUtils.placeNewNodes(hiddenNodes);
      }
      this._g.viewUtils.show(this._g.cy.$());
      this._g.applyClassFiltering();
      this._timebarService.coverVisibleRange();
    }
  }

  hideUnselected() {
    let unselected = this._g.cy.$().not(':selected');
    this._g.viewUtils.hide(unselected);
    this._g.applyClassFiltering();
    if (unselected.length > 0) {
      this._g.performLayout(false);
    }
  }

  isAnyHidden() {
    return this._g.cy.$().map(x => x.hidden()).filter(x => x).length > 0;
  }

  // used to change border width or color. One of them should be defined. (exclusively)
  changeHighlights(borderWid?: number, color?: string) {
    if (color) {
      this._g.currHighlightIdx = (this._g.currHighlightIdx + 1) % C.MAX_HIGHLIGHT_CNT;
      this._g.viewUtils.changeHighlightColor(this._g.currHighlightIdx, color, borderWid);
    } else {
      color = this._g.viewUtils.getHighlightColors()[this._g.currHighlightIdx];
      this._g.viewUtils.changeHighlightColor(this._g.currHighlightIdx, color, borderWid);
    }
  }

  markovClustering() {
    const opt = {
      attributes: [
        function () { return 1; }
      ]
    };

    let clusters = this._g.cy.$().markovClustering(opt);
    for (let i = 0; i < clusters.length; i++) {
      let parentNode = this.createCyNode({ labels: ['Cluster'], properties: { end_datetime: 0, begin_datetime: 0 } }, 'c' + i);
      this._g.cy.add(parentNode);
      clusters[i].move({ parent: parentNode.data.id });
    }
  }

  clusterByDirector() {
    let edges = this._g.cy.$('edge.DIRECTED');
    let directorIds = new Set<string>();
    let movie2director = {};
    for (let i = 0; i < edges.length; i++) {
      let edgeData = edges[i].data();
      directorIds.add(edgeData.source);
      if (movie2director[edgeData.target]) {
        movie2director[edgeData.target].push(edgeData.source);
      } else {
        movie2director[edgeData.target] = [edgeData.source];
      }
    }

    // add parent nodes
    for (let id of directorIds) {
      let name = this._g.cy.$('#' + id).data().name;
      let parentNode = this.createCyNode({ labels: ['Cluster'], properties: { end_datetime: 0, begin_datetime: 0, name: name } }, id + 'c');
      this._g.cy.add(parentNode);
      // add the director to the compound node
      this._g.cy.$('#' + id).move({ parent: id + 'c' });
    }

    // assign nodes to parents
    for (let [k, v] of Object.entries(movie2director)) {
      if (v['length'] < 2) {
        // add movies to the compound node
        this._g.cy.$('#' + k).move({ parent: v[0] + 'c' });
      }
    }
  }

  deleteClusteringNodes() {
    this._g.cy.$().move({ parent: null });
    this._g.cy.remove('node.Cluster');
  }

  expandAllCompounds() {
    this._g.expandCollapseApi.expandAll();
  }

  bindComponentSelector() {
    let isSelectionLocked: boolean = false;

    this._g.cy.on('taphold', 'node', function (e) {
      if (!e.originalEvent.shiftKey) {
        return;
      }
      e.target.component().select();
      // it selects current node again to prevent that, disable selection until next tap event
      this._g.cy.autounselectify(true);
      isSelectionLocked = true;
    }.bind(this));

    this._g.cy.on('free', 'node', function (e) {
      if (!isSelectionLocked) {
        return;
      }
      // wait to prevent unselect clicked node, after tapend 
      setTimeout(() => {
        this._g.cy.autounselectify(false);
        isSelectionLocked = false;
      }, 100);

    }.bind(this));
  }

  setRemovePoppersFn(fn) {
    this.removePopperFn = fn;
  }
}
