import { Injectable } from '@angular/core';
import { UserPref, GroupingOptionTypes } from './user-preference';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import appPref from '../../assets/appPref.json';
import { isPrimitiveType, debounce, LAYOUT_ANIM_DUR, COLLAPSED_EDGE_CLASS, COLLAPSED_NODE_CLASS, CLUSTER_CLASS, CY_BATCH_END_DELAY } from './constants';
import { GraphHistoryItem, GraphElem } from './db-service/data-types';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariableService {
  private HISTORY_SNAP_DELAY = 1500; // we should wait for layout to finish
  private _isSetEnums = false;
  cy: any;
  viewUtils: any;
  layoutUtils: any;
  layout: any;
  expandCollapseApi: any;
  hiddenClasses: Set<string>;
  setLoadingStatus: (boolean) => void;
  userPrefs: UserPref = {} as UserPref;
  shownElemsChanged = new BehaviorSubject<boolean>(true);
  operationTabChanged = new BehaviorSubject<number>(1);
  isSwitch2ObjTabOnSelect: boolean = true;
  graphHistory: GraphHistoryItem[] = [];
  showHideGraphHistory = new BehaviorSubject<boolean>(false);
  addNewGraphHistoryItem = new BehaviorSubject<boolean>(false);
  isLoadFromHistory: boolean = false;
  isLoadFromExpandCollapse: boolean = false;
  isUserPrefReady = new BehaviorSubject<boolean>(false);
  statusMsg = new BehaviorSubject<string>('');
  isUseCiseLayout = false;
  performLayout: Function;
  cyNaviPositionSetter: any;
  appDescription = new BehaviorSubject<any>(null);
  dataModel = new BehaviorSubject<any>(null);
  enums = new BehaviorSubject<any>(null);

  constructor(private _http: HttpClient) {
    this.hiddenClasses = new Set([]);
    // set user preferences staticly (necessary for rendering html initially)
    this.setUserPrefs(appPref, this.userPrefs);
    // set default values dynamically
    this._http.get('./assets/appPref.json').subscribe(x => {
      this.setUserPrefs(x, this.userPrefs);

      // set user prefered values. These will be overriden if "Store User Profile" is checked
      this._http.get('/app/custom/config/app_description.json').subscribe(x => {
        this.appDescription.next(x);
        this.setUserPrefs(x['appPreferences'], this.userPrefs);
        this.isUserPrefReady.next(true);
      }, (e) => { console.log('error: ', e); });
    }, (e) => { console.log('error: ', e); });

    let isGraphEmpty = () => { return this.cy.elements().not(':hidden, :transparent').length > 0 };
    this.performLayout = debounce(this.performLayoutFn, LAYOUT_ANIM_DUR, true, isGraphEmpty);

    // set cytoscape.js style dynamicly
    this._http.get('./assets/generated/stylesheet.json').subscribe(x => {
      this.cy.style(x);
      this.addOtherStyles();
    }, (e) => { console.log('error: ', e); });

    this._http.get('./assets/generated/properties.json').subscribe(x => {
      this.dataModel.next(x);
    }, (e) => { console.log('error: ', e); });

    this._http.get('/app/custom/config/enums.json').subscribe(x => {
      this.enums.next(x);
    }, (e) => { console.log('error: ', e); });
  }

  transfer2UserPrefs(u: any) {
    if (u) {
      this.setUserPrefs(u, this.userPrefs);
    }
  }

  runLayout() {
    const elems4layout = this.cy.elements().not(':hidden, :transparent');
    if (elems4layout.length < 1) {
      return;
    }
    if (this.layout.randomize) {
      this.statusMsg.next('Recalculating layout...');
    } else {
      this.statusMsg.next('Performing layout...');
    }
    this.setLoadingStatus(true);
    if (this.isUseCiseLayout) {
      elems4layout.layout(this.getCiseOptions()).run();
      this.isUseCiseLayout = false;
    } else {
      elems4layout.layout(this.layout).run();
    }
    this.statusMsg.next('Rendering graph...');
  }

  switchLayoutRandomization(isRandomize: boolean) {
    this.layout.randomize = isRandomize;
    if (!this.layout.randomize) {
      this.layout.quality = 'proof'
    }
  }

  applyClassFiltering() {
    let hiddenSelector = '';
    for (let i of this.hiddenClasses) {
      hiddenSelector += '.' + i + ',';
    }

    hiddenSelector = hiddenSelector.substr(0, hiddenSelector.length - 1);

    if (hiddenSelector.length > 1) {
      this.viewUtils.hide(this.cy.$(hiddenSelector));
    }

    this.handleCompoundsOnHideDelete();
  }

  filterByClass(elems) {
    let hiddenSelector = '';
    for (let i of this.hiddenClasses) {
      hiddenSelector += '.' + i + ',';
    }

    hiddenSelector = hiddenSelector.substr(0, hiddenSelector.length - 1);

    if (hiddenSelector.length < 1) {
      return elems;
    }
    return elems.not(hiddenSelector);
  }

  getGraphElemSet() {
    return new Set<string>(this.cy.elements().map(x => x.id()));
  }

  highlightElems(elems) {
    this.viewUtils.highlight(elems, this.userPrefs.currHighlightIdx.getValue());
  }

  add2GraphHistory(expo: string) {
    setTimeout(() => {
      if (this.graphHistory.length > this.userPrefs.queryHistoryLimit.getValue() - 1) {
        this.graphHistory.splice(0, 1);
      }
      const options = { bg: 'white', scale: 3, full: true };
      const base64png: string = this.cy.png(options);
      const elements = this.cy.json().elements;

      let g: GraphHistoryItem = {
        expo: expo,
        base64png: base64png,
        json: elements
      };
      this.graphHistory.push(g);
      this.addNewGraphHistoryItem.next(true);
    }, this.HISTORY_SNAP_DELAY);
  }

  getLabels4Elems(elemIds: string[] | number[], isNode: boolean = true, objDatas: GraphElem[] = null): string {
    let cyIds: string[] = [];
    let idChar = 'n';
    if (!isNode) {
      idChar = 'e';
    }
    if (objDatas) {
      cyIds = objDatas.map(x => x.data.id);
    } else {
      for (let i = 0; i < elemIds.length; i++) {
        cyIds.push(idChar + elemIds[i]);
      }
    }

    let labels = '';
    let labelParent: any = this.appDescription.getValue().objects;
    if (!isNode) {
      labelParent = this.appDescription.getValue().relations;
    }
    for (let i = 0; i < cyIds.length; i++) {
      let cName = '';
      if (!objDatas) {
        cName = this.cy.$('#' + cyIds[i]).className()[0];
      } else {
        cName = objDatas[i].classes.split(' ')[0];
      }

      let s = labelParent[cName]['style']['label'] as string;
      if (s.indexOf('(') < 0) {
        labels += s + ',';
      } else {
        let propName = s.slice(s.indexOf('(') + 1, s.indexOf(')'));
        if (!objDatas) {
          labels += this.cy.$('#' + cyIds[i]).data(propName) + ',';
        } else {
          const currData = objDatas[i].data;
          let l = currData[propName];
          if (!l) {
            l = currData[Object.keys(currData)[0]]
          }
          labels += l + ',';
        }
      }
    }

    return labels.slice(0, -1);
  }

  listen4graphEvents() {
    this.cy.on('layoutstop', () => {
      this.setLoadingStatus(false);
    });
  }

  getFcoseOptions() {
    return {
      name: 'fcose',
      // 'draft', 'default' or 'proof' 
      // - 'draft' only applies spectral layout 
      // - 'default' improves the quality with incremental layout (fast cooling rate)
      // - 'proof' improves the quality with incremental layout (slow cooling rate) 
      quality: 'default',
      // use random node positions at beginning of layout
      // if this is set to false, then quality option must be 'proof'
      randomize: false,
      // whether or not to animate the layout
      animate: true,
      // duration of animation in ms, if enabled
      animationDuration: LAYOUT_ANIM_DUR,
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
      tile: true,
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
  }

  // delete/expand compounds if they don't have any visible elements
  handleCompoundsOnHideDelete() {
    const metaEdges = this.cy.edges('.' + COLLAPSED_EDGE_CLASS);
    // some collapsed edges should be expanded, or their data should be updated
    for (let i = 0; i < metaEdges.length; i++) {
      const collapsedEdges = metaEdges[i].data('collapsedEdges');
      if (collapsedEdges.filter(':visible').length < 2) {
        this.expandCollapseApi.expandEdges(metaEdges[i]);
      } else {
        metaEdges[i].data('collapsedEdges', collapsedEdges.filter(':visible'))
        this.cy.add(collapsedEdges.not(':visible'));
      }
    }

    const metaNodes = this.cy.nodes('.' + COLLAPSED_NODE_CLASS);
    // First, expand the collapsed if they don't have anything visible inside
    for (let i = 0; i < metaNodes.length; i++) {
      const collapsedChildren = metaNodes[i].data('collapsedChildren');
      if (collapsedChildren.filter(':visible').length < 1) {
        this.expandCollapseApi.expand(metaNodes[i], { layoutBy: null, fisheye: false, animate: false });
      }
    }

    //if an expanded compound does not have anything visible, delete it
    const clusterNodes = this.cy.nodes('.' + CLUSTER_CLASS).not('.' + COLLAPSED_NODE_CLASS);
    for (let i = 0; i < clusterNodes.length; i++) {
      // if there are empty compounds, delete them
      const children = clusterNodes[i].children();
      if (children.filter(':visible').length < 1) {
        children.move({ parent: null });
        this.cy.remove(clusterNodes[i]);
      }
    }
  }

  getEnumMapping(): any {
    // changes value inside `this.appDescription.getValue().enumMapping` since it works on reference
    const mapping = this.appDescription.getValue().enumMapping;
    if (this._isSetEnums) {
      return mapping;
    }
    const enums = this.enums.getValue();
    for (const k in mapping) {
      for (const k2 in mapping[k]) {
        mapping[k][k2] = enums[mapping[k][k2]];
      }
    }
    this._isSetEnums = true;
    return mapping;
  }

  private performLayoutFn(isRandomize: boolean, isDirectCommand: boolean = false, animationDuration: number = LAYOUT_ANIM_DUR) {
    if (!this.userPrefs.isAutoIncrementalLayoutOnChange.getValue() && !isRandomize && !isDirectCommand) {
      this.cy.fit();
      return;
    }
    if (this.userPrefs.groupingOption.getValue() != GroupingOptionTypes.clusterId) {
      this.layout = this.getFcoseOptions();
    }
    this.layout.animationDuration = animationDuration;
    this.switchLayoutRandomization(isRandomize);
    this.runLayout();
  }

  private getCiseOptions() {
    return {
      // -------- Mandatory parameters --------
      name: 'cise',

      // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids. 
      // For the 2D array option, the index of the array indicates the cluster ID for all elements in 
      // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
      // 
      // For the function, it would be given a Cytoscape node and it is expected to return a cluster id  
      // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
      // nodes.  
      // e.g
      // Array:                                     OR          function(node){
      //  [ ['n1','n2','n3'],                                       ...
      //    ['n5','n6']                                         }
      //    ['n7', 'n8', 'n9', 'n10'] ]                         
      clusters: this.layout.clusters,

      // -------- Optional parameters --------
      // Whether to animate the layout
      // - true : Animate while the layout is running
      // - false : Just show the end result
      // - 'end' : Animate directly to the end result
      animate: 'end',

      // number of ticks per frame; higher is faster but more jerky
      refresh: 10,

      // Animation duration used for animate:'end'
      animationDuration: LAYOUT_ANIM_DUR,

      // Easing for animate:'end'
      animationEasing: undefined,

      // Whether to fit the viewport to the repositioned graph
      // true : Fits at end of layout for animate:false or animate:'end'
      fit: true,

      // Padding in rendered co-ordinates around the layout
      padding: 30,

      // separation amount between nodes in a cluster
      // note: increasing this amount will also increase the simulation time 
      nodeSeparation: 2.5,

      // Inter-cluster edge length factor 
      // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
      idealInterClusterEdgeLengthCoefficient: 1.4,

      // Whether to pull on-circle nodes inside of the circle
      allowNodesInsideCircle: true,

      // Max percentage of the nodes in a circle that can move inside the circle
      maxRatioOfNodesInsideCircle: 0.1,

      // - Lower values give looser springs
      // - Higher values give tighter springs
      springCoeff: 0.45,

      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: 4500,

      // Gravity force (constant)
      gravity: 0.25,

      // Gravity range (constant)
      gravityRange: 3.8,

      packComponents: true,

      // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
      ready: function () { }, // on layoutready
      stop: function () { }, // on layoutstop
    };
  }

  private setUserPrefs(obj: any, userPref: any) {
    if (obj === undefined || obj === null) {
      return;
    }
    for (let k in obj) {
      let prop = obj[k];
      if (isPrimitiveType(prop)) {
        if (userPref[k]) {
          (userPref[k] as BehaviorSubject<any>).next(prop);
        } else {
          userPref[k] = new BehaviorSubject(prop);
        }
      } else {
        if (!userPref[k]) {
          if (prop instanceof Array) {
            userPref[k] = [];
          } else {
            userPref[k] = {};
          }
        }
        this.setUserPrefs(obj[k], userPref[k]);
      }
    }
  }

  // some styles uses functions, so they can't be added using JSON
  private addOtherStyles() {
    this.cy.startBatch();

    this.cy.style().selector('edge.' + COLLAPSED_EDGE_CLASS)
      .style({
        'label': (e) => {
          return '(' + e.data('collapsedEdges').length + ')';
        },
        'width': (e) => {
          let n = e.data('collapsedEdges').length;
          return (3 + Math.log2(n)) + 'px';
        },
        'line-color': this.setColor4CompoundEdge.bind(this),
        'target-arrow-color': this.setColor4CompoundEdge.bind(this),
        'target-arrow-shape': this.setTargetArrowShape.bind(this),
      })
      .update();

    setTimeout(() => { this.cy.endBatch(); }, CY_BATCH_END_DELAY);
  }

  private setColor4CompoundEdge(e) {
    let collapsedEdges = e.data('collapsedEdges');
    if (this.doElemsMultiClasses(collapsedEdges)) {
      return '#b3b3b3';
    }
    return collapsedEdges[0].style('line-color')
  }

  private setTargetArrowShape(e) {
    let collapsedEdges = e.data('collapsedEdges');
    if (this.doElemsMultiClasses(collapsedEdges)) {
      return 'triangle';
    }
    return collapsedEdges[0].style('target-arrow-shape')
  }

  private doElemsMultiClasses(elems) {
    let classDict = {};
    for (let i = 0; i < elems.length; i++) {
      let classes = elems[i].classes();
      for (let j = 0; j < classes.length; j++) {
        classDict[classes[j]] = true;
      }
    }
    return Object.keys(classDict).length > 1;
  }
} 
