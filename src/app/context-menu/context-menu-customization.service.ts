import { Injectable } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { DbAdapterService } from '../db-service/db-adapter.service';
import { GlobalVariableService } from '../global-variable.service';
import { ContextMenuItem } from './icontext-menu';
import axios from 'axios';

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
  private _movie_api_url = 'https://www.omdbapi.com';
  private _api_key_param = '&apikey=9be27fce';

  get menu(): ContextMenuItem[] {
    return this._menu;
  }
  constructor(private _cyService: CytoscapeService, private _dbService: DbAdapterService, private _g: GlobalVariableService) {
    this._menu = [
      {
        id: 'showMoviesOfPerson',
        content: 'Show All Movies Involving This Person',
        selector: 'node.Person',
        onClickFunction: this.getNeighbors.bind(this)
      },
      {
        id: 'getPoster',
        content: 'Use Movie Poster',
        selector: 'node.Movie',
        onClickFunction: this.getPoster.bind(this)
      },
      {
        id: 'go to IMDB',
        content: 'Go to IMDB',
        selector: 'node.Movie',
        onClickFunction: this.goInfo.bind(this)
      },
      {
        id: 'showActorsOfMovie',
        content: 'Show All Persons Involved in This Movie',
        selector: 'node.Movie',
        onClickFunction: this.getNeighbors.bind(this)
      },
      {
        id: 'displayAllPosters',
        content: 'Use Movie Posters',
        coreAsWell: true,
        onClickFunction: this.useMoviePoster.bind(this)
      },
    ];
  }

  getNeighbors(event) {
    const ele = event.target || event.cyTarget;
    this._dbService.getNeighbors([ele.id().substr(1)], (x) => { this._cyService.loadElementsFromDatabase(x, true) })
  }

  getPoster(event) {
    const ele = event.target || event.cyTarget;
    this.setBgImg2MoviePoster(ele);
  }

  goInfo(event) {
    const ele = event.target || event.cyTarget;
    const id = ele.data('tconst');
    window.open('https://www.imdb.com/title/' + id);
  }

  useMoviePoster() {
    this._g.cy.nodes('.Movie').forEach((e) => { this.setBgImg2MoviePoster(e) });
  }

  private setBgImg2MoviePoster(e) {
    const id = e.data('tconst');
    axios.get(this._movie_api_url + `?i=${id}` + this._api_key_param)
      .then((response) => {
        const url = response.data.Poster;
        if (url != '')
          e.style({ 'background-image': url });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
