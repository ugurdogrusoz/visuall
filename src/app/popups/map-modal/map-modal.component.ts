import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {GlobalVariableService} from '../../global-variable.service';
import {CytoscapeService} from '../../cytoscape.service';
import * as _ from 'lodash'

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.css']
})
export class MapModalComponent implements OnInit {
  map: any;
  nodes = [];
  markers = [];
  selectedMarkers = [];
  CustomIcon = L.Icon.extend({
    options: {
      iconSize: [25, 34],
      iconAnchor: [12.5, 34],
      popupAnchor: [0, -30]
    }
  } as any);
  defaultIcon = new this.CustomIcon({iconUrl: '../../assets/img/marker-default.svg'});
  selectedIcon = new this.CustomIcon({iconUrl: '../../assets/img/marker-selected.svg'});
  highlightedIcon = new this.CustomIcon({iconUrl: '../../assets/img/marker-highlighted.svg'});


  constructor(private _g: GlobalVariableService, private _cyService: CytoscapeService,) {
    this.nodes = this._g.cy.nodes(':visible');
    this.addSelectEvent();
  }

  ngOnInit(): void {
    this.map = new L.Map('map', {
      layers: [
        new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      ]
    });

    this.createMarkers();

    if (!this.markers.length) {
      this.map.setView([0, 0], 0);
      return
    }

    let group = new L.featureGroup(this.markers).addTo(this.map);

    this.selectMarkerWithCtrlClick(group);

    setTimeout(() => {
      this.map.fitBounds(group.getBounds(), {padding: L.point(20, 20)});
    }, 1000);
  }

  private createMarkers() {
    this.markers = [];

    for (const node of Object.values(this.nodes)) {
      if (!node._private || !this.getLocationOfCyNode(node)) {
        continue;
      }

      const marker = L.marker(this.getLocationOfCyNode(node), {icon: this.isNodeHighlighted(node) ? this.highlightedIcon : this.defaultIcon})
        .bindPopup('<div class="marker-popup-content">' + this.getInfoOfCyNode(node) + '</div>');
      this.markers.push(marker);
    }
  }

  getLocationOfCyNode(node: any) {
    if (!node._private.data.lat || !node._private.data.long) {
      return
    }

    return [node._private.data.lat, node._private.data.long];
  }

  getInfoOfCyNode(node: any) {
    return node._private.data.label;
  }

  private addSelectEvent() {
    const that = this;
    L.Map.BoxSelect = L.Map.BoxZoom.extend({
      _onMouseUp: function (e) {
        if ((e.which !== 1) && (e.button !== 1)) {
          return;
        }

        this._finish();
        if (!this._moved) {
          return;
        }
        // Postpone to next JS tick so internal click event handling
        // still see it as "moved".
        this._clearDeferredResetState();
        // this._resetStateTimeout = setTimeout(L.Util.bind(this._resetState, this), 0);

        const bounds = new L.LatLngBounds(
          this._map.containerPointToLatLng(this._startPoint),
          this._map.containerPointToLatLng(this._point));

        for (const marker of that.markers) {
          const markerLat = marker._latlng.lat;
          const markerLng = marker._latlng.lng;
          if (markerLat < bounds._northEast.lat && markerLat > bounds._southWest.lat &&
            markerLng > bounds._southWest.lng && markerLng < bounds._northEast.lng) {
            if (!that.selectedMarkers.some(selectedMarker => _.isEqual(selectedMarker, marker))) {
              marker.setIcon(that.selectedIcon);
              that.selectedMarkers.push(marker);
            }
          }
        }
      }
    } as any);
    L.Map.addInitHook('addHandler', 'boxSelect', L.Map.BoxSelect);
    L.Map.mergeOptions({boxZoom: false});
    L.Map.mergeOptions({boxSelect: true});
  }

  hideNodes() {
    const selectedNodes = this.getSelectedNodes();

    this._g.viewUtils.hide(selectedNodes);
    this._g.applyClassFiltering();
    if (selectedNodes.length > 0) {
      this._g.performLayout(false);
    }

    this.removeMarkers();
  }

  private removeMarkers() {
    for (const marker of this.selectedMarkers) {
      this.map.removeLayer(marker)
    }

    this.selectedMarkers = []
  }

  private selectMarkerWithCtrlClick(group) {
    group.on('click', (event) => {
      if (!event.originalEvent.ctrlKey) {
        return
      }

      this.map.closePopup();
      const clickedMarker = event.layer;
      if (this.selectedMarkers.includes(clickedMarker)) {
        clickedMarker.setIcon(this.defaultIcon);
        this.selectedMarkers = this.selectedMarkers.filter(marker => marker !== clickedMarker)
      } else {
        clickedMarker.setIcon(this.selectedIcon);
        this.selectedMarkers.push(clickedMarker)
      }
    });
  }


  highlightNodes() {
    const selectedNodes = this.getSelectedNodes();

    if (selectedNodes.length < 1) {
      return;
    }

    for (const marker of this.selectedMarkers) {
      marker.setIcon(this.highlightedIcon)
    }
    this.selectedMarkers = [];

    this._g.highlightElems(selectedNodes);
    this._g.cy.fit(selectedNodes);
  }

  getSelectedNodes() {
    return this.nodes.filter(node => {
      return this.selectedMarkers.some(marker => {
        const popupContent = marker._popup._content.match(/>(.*)</).pop();
        return popupContent === this.getInfoOfCyNode(node) &&
          _.isEqual(["" + marker._latlng.lat, "" + marker._latlng.lng], this.getLocationOfCyNode(node))
      });
    })
  }

  removeHighlights() {
    this._cyService.removeHighlights();
    for (const marker of this.markers) {
      if (marker.getIcon().options.iconUrl === this.highlightedIcon.options.iconUrl) {
        marker.setIcon(this.defaultIcon)
      }
    }
  }

  private isNodeHighlighted(node) {
    return node._private.classes.has('__highligtighted__0')
  }
}
