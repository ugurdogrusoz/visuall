import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { TimebarService } from '../timebar.service';
import { ContextMenuService } from '../context-menu/context-menu.service';
import { MarqueeZoomService } from './marquee-zoom.service';

@Component({
  selector: 'app-cytoscape',
  templateUrl: './cytoscape.component.html',
  styleUrls: ['./cytoscape.component.css']
})
export class CytoscapeComponent implements OnInit {

  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _ctxMenuService: ContextMenuService, private _marqueeService: MarqueeZoomService) { }
  cyClass = false;

  ngOnInit() {
    this._cyService.initCy(document.getElementById('cy'));
    this._timebarService.init();
    this._ctxMenuService.bindContextMenuExtension();
    this._marqueeService.setChangeClassFn(this.setClassForCyDiv.bind(this));
  }

  setClassForCyDiv(b: boolean) {
    this.cyClass = b;
  }

}
