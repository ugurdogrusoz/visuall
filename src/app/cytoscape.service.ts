import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import navigator from 'cytoscape-navigator';
import panzoom from 'cytoscape-panzoom';
import fcose from 'cytoscape-fcose';
import expandCollapse from 'cytoscape-expand-collapse';
import viewUtilities from 'cytoscape-view-utilities';
import layoutUtilities from 'cytoscape-layout-utilities';
import * as contextMenus from 'cytoscape-context-menus';
import stylesheet from '../assets/generated/stylesheet.json';
import * as C from './constants';
import * as $ from 'jquery';
import { GlobalVariableService } from './global-variable.service';
import { DbService } from './db.service';
import { TimebarService } from './timebar.service';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CytoscapeService {
  cyNavi: any;
  cyNaviPositionSetter: EventListenerOrEventListenerObject;
  
  constructor(private _g: GlobalVariableService, private _dbService: DbService, private _timebarService: TimebarService) {
  }

  initCy(containerElem) {
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
      // - "draft" only applies spectral layout 
      // - "default" improves the quality with incremental layout (fast cooling rate)
      // - "proof" improves the quality with incremental layout (slow cooling rate) 
      quality: 'default',
      // use random node positions at beginning of layout
      // if this is set to false, then quality option must be "proof"
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
      // whether to include labels in node dimensions. Valid in "proof" quality
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

    (<any>window).cy = this._g.cy;
  }

  bindLayoutUtilitiesExtension(){
    this._g.layoutUtils = this._g.cy.layoutUtilities();
  }

  bindNavigatorExtension() {

    const cyNaviClass = 'cytoscape-navigator-wrapper';
    $('.cyContainer').append(`<div class="${cyNaviClass}"></div>`);

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
      neighborSelectTime: 500 //ms, time to taphold to select desired neighbors
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
        return false;
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
    const cql = C.GET_NEIGHBORS.replace(C.CQL_PARAM0, ele.id().substr(1));
    this._dbService.runQuery(cql, null, (response) => this.loadElementsFromDatabase(response, true));
  }

  setNavigatorPosition() {
    const navSelector = '.cytoscape-navigator-wrapper';
    const containerSelector = '.cyContainer';
    const offset = 3;

    const topCy = $(containerSelector).offset().top - window.scrollY;
    const leftCy = $(containerSelector).offset().left;
    const heightCy = $(containerSelector).outerHeight();
    const widthCy = $(containerSelector).outerWidth();
    const heightNavigator = $(navSelector).outerHeight();
    const widthNavigator = $(navSelector).outerWidth();
    $(navSelector).css('top', heightCy + topCy - heightNavigator - offset);
    $(navSelector).css('left', widthCy + leftCy - widthNavigator - offset);
  }

  loadElementsFromDatabase(data, isIncremental) {
    if (!data || !data.nodes || !data.edges) {
      console.error('Empty response from database!');
      return;
    }
    const nodes = data.nodes;
    const edges = data.edges;

    var current = this._g.cy.nodes(':visible');
    let elemIds: string[] = [];
    let cy_nodes = [];
    for (const id in nodes) {
      cy_nodes.push(this.createCyNode(nodes[id], 'n' + id));
      elemIds.push('n' + id)
    }

    let cy_edges = [];
    for (const id in edges) {
      cy_edges.push(this.createCyEdge(edges[id], 'e' + id));
      elemIds.push('e' + id)
    }

    this._g.switchLayoutRandomization(!isIncremental);

    if (!isIncremental) {
      this._g.cy.elements().remove();
    }
    const wasEmpty = this._g.cy.elements().length < 2;

    this._g.cy.add(cy_nodes);
    this._g.cy.add(cy_edges);

    this._g.applyClassFiltering();
    this._timebarService.cyElemListChanged();

    if(isIncremental){
      var collection = this._g.cy.collection();
      for(var i = 0; i<cy_nodes.length ; i++){
        var node = this._g.cy.getElementById(cy_nodes[i].data.id);
        if(!current.contains(node))
          collection = collection.union(node);
      }
      this._g.layoutUtils.placeNewNodes(collection);
    }

    if (!isIncremental && this._g.isTimebarEnabled) {
      this._timebarService.coverAllTimes(true);
    } else {     
      this._g.performLayout(!isIncremental || wasEmpty);
    }
    
    this.highlightElems(isIncremental, elemIds);
  }

  highlightElems(isIncremental: boolean, elemIds: string[]) {
    if (!isIncremental) {
      return;
    }
    let ele2highlight = this._g.cy.collection();
    const cnt = elemIds.length;
    for (let i = 0; i < cnt; i++) {
      ele2highlight.merge('#' + elemIds.pop());
    }
    const options = {
      eles: ele2highlight,
      option: C.HIGHLIGHT_TYPE_MERGE
    };
    this._g.viewUtils.highlight(options);
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
    if (!isChecked) {
      this._g.cy.edges().addClass('nolabel');
    } else {
      this._g.cy.edges().removeClass('nolabel');
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

    return function (event) {
      let elements2remain = event.target.neighborhood().union(event.target);
      if (event.target.isEdge()) {
        elements2remain = event.target.connectedNodes().union(event.target);
      }

      if (event.type === C.EV_MOUSE_ON) {
        timerId = setTimeout(function () {
          currOpacity = nextOpacity;
          nextOpacity = C.HIGHLIGHT_OPACITY;
          // eliminate unnecassary animation, it causes blinking
          if (currOpacity != nextOpacity) {
            this.setOtherElementsOpacity(elements2remain, C.HIGHLIGHT_OPACITY);
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
    this._g.cy.elements().difference(elements).animate(
      { style: { opacity: opacity } }, { duration: C.HIGHLIGHT_ANIM_DUR });
  }

  highlightSelected() {
    const selected = this._g.cy.$(':selected');
    if (selected.length < 1) {
      return;
    }
    let options = { eles: selected, option: C.HIGHLIGHT_TYPE };
    this._g.viewUtils.highlight(options);
  }

  staticHighlightNeighbors() {
    let selected = this._g.cy.$(':selected');
    let neighbors = selected.neighborhood();
    let options = { eles: selected.union(neighbors), option: C.HIGHLIGHT_TYPE };
    this._g.viewUtils.highlight(options);
  }

  removeHighlights() {
    this._g.viewUtils.removeHighlights();
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
    if (!isChecked) {
      this.unbindNavigatorExtension();
    } else {
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
      $('#cy').css('height', '92vh');
      $('#timebar').hide();
    } else {
      $('#cy').css('height', '79vh');
      $('#timebar').show();
    }
    this._timebarService.statusChanged(isChecked);
    this.setNavigatorPosition();
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
    const options = { bg: 'white', scale: 1, full: isWholeGraph };
    const png = this._g.cy.png(options);

    const anchor = document.createElement('a');
    anchor.download = 'visuall.png';
    anchor.href = png;
    anchor.click();
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
      this._g.viewUtils.hide(this._g.cy.$(':selected'));
      this._g.applyClassFiltering();
      this._timebarService.cyElemListChanged();
    } else {
      if (!this.isAnyHidden()) {
        return;
      }
      var hiddenNodes = this._g.cy.nodes(":hidden");
      this._g.layoutUtils.placeNewNodes(hiddenNodes);
      this._g.viewUtils.show(this._g.cy.$());
      this._g.applyClassFiltering();
      this._timebarService.cyElemListChanged();
      // this.appManager.showAllTimeRange(true);
      this._timebarService.coverAllTimes(true, false);
    }
  }

  isAnyHidden() {
    return this._g.cy.$().map(x => x.hidden()).filter(x => x).length > 0;
  }

  changeHighlightOptions(v: number) {
    let nodeHighlights = ['HIGHLIGHTED_NODE_1', 'HIGHLIGHTED_NODE_2', 'HIGHLIGHTED_NODE_3', 'HIGHLIGHTED_NODE_4'];
    let edgeHighlights = ['HIGHLIGHTED_EDGE_1', 'HIGHLIGHTED_EDGE_2', 'HIGHLIGHTED_EDGE_3', 'HIGHLIGHTED_EDGE_4'];
    for (let i = 0; i < nodeHighlights.length; i++) {
      C[nodeHighlights[i]]['border-width'] = v;
    }
    for (let i = 0; i < edgeHighlights.length; i++) {
      C[edgeHighlights[i]]['width'] = v;
    }
    this.bindViewUtilitiesExtension();
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
}
