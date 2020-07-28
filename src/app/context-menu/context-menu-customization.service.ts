import { Injectable } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { DbAdapterService } from '../db-service/db-adapter.service';
import { GlobalVariableService } from '../global-variable.service';
import { ContextMenuItem } from './icontext-menu';
import { SharedService } from '../shared.service';
import { DataContentService } from '../data-content.service';

@Injectable({
  providedIn: 'root'
})

/** Custom menu items and action functions for the items should be added to this class.
 * You might need to import other services but you should only edit this file.
 * Using 'menu' function, provided items will be added to toolbar.
 * 'isStd' property must be false for all items.
 * If 'dropdown' is not existing inside standard menu, it will be added as a new item.
 sample menu
this._menu = [{
      div: 12, items: [{ title: 'Custom Action 1', isRegular: true, fn: 'fn1', isStd: false, imgSrc: '' }]
    },
    {
      div: 1, items: [{ title: 'Custom Action 2', isRegular: true, fn: 'fn2', isStd: false, imgSrc: '' }]
    }];
 **/
export class ContextMenuCustomizationService {
  private _menu: ContextMenuItem[];
  individuals = [];

  get menu(): ContextMenuItem[] {
    return this._menu;
  }
  constructor(private _dbService: DbAdapterService, private _cyService: CytoscapeService, private _g: GlobalVariableService, private shrService: SharedService, private _ctexData: DataContentService) {
    this._menu = [
/*       {
        id: 'showMoviesOfPerson',
        content: 'Show All Movies Involving This Person',
        selector: 'node',
        onClickFunction: this.getNeighbors.bind(this)
      }, */
      {
        id: 'recommend',
        content: 'Recommend',
        selector: 'node',
        onClickFunction: this.showRecom.bind(this)
      },
      {
        id: 'getNeighbors',
        content: 'Show Adjacent Nodes',
        selector: 'node',
        onClickFunction: this.getNeighbors.bind(this)
      }
    ];
  }
  getNeighbors(event) {
    const ele = event.target || event.cyTarget;
    this._dbService.getNeighbors([ele.data().id.substr(1)], (x) => { this._cyService.loadElementsFromDatabase(x, true) })
  }

  showRecom(event) {
    //this._g.operationTabChanged.next(5);
    this.individuals.splice(this.individuals['']);
    this._ctexData.getElemId(event);
    this._ctexData.getMovieDb().subscribe(data => {
      for (const d of (data as any)) {
        this.individuals.push({
          uri: d.uri,
          score: d.score,
        });
      }
      this.shrService.setRecomDetails(this.individuals);
    })
  }

}
