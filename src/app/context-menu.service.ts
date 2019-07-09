import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import * as contextMenus from 'cytoscape-context-menus';
import * as $ from 'jquery';
import { CytoscapeService } from './cytoscape.service';
import { DbService } from './db.service';
import { GlobalVariableService } from './global-variable.service';
import { GET_NEIGHBORS, CQL_PARAM0 } from './constants';
import axios from 'axios';
import ModelDescription from '../../src/model_description.json';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  constructor(private _cyService: CytoscapeService, private _dbService: DbService, private _g: GlobalVariableService) { }

  bindContextMenuExtension() {

    // register context menu extension
    cytoscape.use(contextMenus, $);

    let items = [];
    for (let i = 0; i < ModelDescription.template.context_menu.length; i++) {
      let item = {};
      let currItem = ModelDescription.template.context_menu[i];
      for (let k in currItem) {
        if (k == 'onClickFunction') {
          // bind function 
          item['onClickFunction'] = this[currItem[k]].bind(this);
        } else {
          item[k] = currItem[k];
        }
      }
      items.push(item);
    }

    this._g.cy.contextMenus({
      menuItems: items
    });
  }

  getNeighbors(event) {
    const ele = event.target || event.cyTarget;
    const cql = GET_NEIGHBORS.replace(CQL_PARAM0, ele.id().substr(1));
    this._dbService.runQuery(cql, null, (response) => this._cyService.loadElementsFromDatabase(response, true));
  }

  getPoster(event) {
    const ele = event.target || event.cyTarget;
    const movieTitle = ele._private.data.title;
    axios.get(`https://www.omdbapi.com?s=${movieTitle}&apikey=9be27fce`)
      .then((response) => {
        const url = response.data.Search[0].Poster;
        if (url != '') {
          ele.style({ 'background-image': url });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  goInfo(event) {
    const ele = event.target || event.cyTarget;
    const movieTitle = ele._private.data.title;
    axios.get(`https://www.omdbapi.com?s=${movieTitle}&apikey=9be27fce`)
      .then((response) => {
        const movieImdb = response.data.Search[0].imdbID;
        if (movieImdb != '') {
          window.open('https://www.imdb.com/title/' + movieImdb);
        }

      })
      .catch((err) => {
        console.log(err);
      });
  }

  useMoviePoster() {
    this._g.cy.nodes('.Movie').forEach(function (ele) {

      const movieTitle = ele._private.data.title;
      axios.get(`https://www.omdbapi.com?s=${movieTitle}&apikey=1c7dc496`)
        .then((response) => {
          const url = response.data.Search[0].Poster;
          if (url != '')
            ele.style({ 'background-image': url });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  deleteElem(event) {
    this._cyService.deleteSelected(event);
  }

  deleteSelected() {
    this._cyService.deleteSelected(false);
  }

  performLayout() {
    this._g.performLayout(false);
  }

}
