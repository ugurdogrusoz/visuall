import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import * as contextMenus from 'cytoscape-context-menus';
import * as $ from 'jquery';
import { CytoscapeService } from '../cytoscape.service';
import { GlobalVariableService } from '../global-variable.service';
import { ContextMenuItem } from './icontext-menu';
import { ContextMenuCustomizationService } from '../../custom/context-menu-customization.service';
import { COLLAPSED_EDGE_CLASS, CLUSTER_CLASS } from './../constants';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  menu: ContextMenuItem[];

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _customizationService: ContextMenuCustomizationService) {

    this.menu = [
      {
        id: 'collapseAllNodes',
        content: 'Collapse All Nodes',
        coreAsWell: true,
        onClickFunction: () => { this._cyService.collapseNodes(); }
      },
      {
        id: 'collapseAllEdges',
        content: 'Collapse All Edges',
        coreAsWell: true,
        onClickFunction: () => { this._cyService.collapseMultiEdges(); }
      },
      {
        id: 'performLayout',
        content: 'Perform Layout',
        coreAsWell: true,
        onClickFunction: this.performLayout.bind(this)
      },
      {
        id: 'deleteSelected',
        content: 'Delete Selected',
        coreAsWell: true,
        onClickFunction: this.deleteSelected.bind(this)
      },
      {
        id: 'selectObjectsOfThisType',
        content: 'Select Objects of This Type',
        selector: 'node,edge',
        onClickFunction: this.selectAllThisType.bind(this)
      },
      {
        id: 'collapseEdge',
        content: 'Collapse',
        selector: '[^collapsedEdges][^originalEnds]',
        onClickFunction: this.collapseEdges.bind(this)
      },
      {
        id: 'expandEdge',
        content: 'Expand',
        selector: 'edge.' + COLLAPSED_EDGE_CLASS,
        onClickFunction: this.expandEdge.bind(this)
      },
      {
        id: 'removeGroup',
        content: 'Remove Group',
        selector: 'node.' + CLUSTER_CLASS,
        onClickFunction: (e) => { this._cyService.removeGroup4Selected(e.target || e.cyTarget) }
      },
      {
        id: 'deleteElement',
        content: 'Delete',
        selector: 'node,edge',
        onClickFunction: this.deleteElem.bind(this)
      },
    ];
  }

  bindContextMenuExtension() {

    // register context menu extension
    cytoscape.use(contextMenus, $);
    this.menu = this._customizationService.menu.concat(this.menu);
    this._g.cy.contextMenus({ menuItems: this.menu, menuItemClasses: ['vall-ctx-menu-item'], contextMenuClasses: ['vall-ctx-menu'] });
  }

  deleteElem(event) { this._cyService.deleteSelected(event); }

  deleteSelected() { this._cyService.deleteSelected(false); }

  performLayout() { this._g.performLayout(false, true); }

  selectAllThisType(event) {
    const ele = event.target || event.cyTarget;
    if (!ele) {
      return;
    }
    const model = this._g.dataModel.getValue();
    const classes = ele.className();
    for (let c of classes) {
      if (model.nodes[c] || model.edges[c]) {
        this._g.cy.$('.' + c).select();
      }
    }
  }

  collapseEdges(event) {
    const ele = event.target || event.cyTarget;
    if (!ele) {
      return;
    }
    this._cyService.collapseMultiEdges(ele.parallelEdges());
  }

  expandEdge(event) {
    const ele = event.target || event.cyTarget;
    if (!ele) {
      return;
    }
    this._cyService.expandMultiEdges(ele);
  }

}
