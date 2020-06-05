import { Component, OnInit, HostListener } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { TimebarService } from '../timebar.service';
import { ContextMenuService } from '../context-menu/context-menu.service';
import { MarqueeZoomService } from './marquee-zoom.service';
import { GlobalVariableService } from '../global-variable.service';

@Component({
  selector: 'app-cytoscape',
  templateUrl: './cytoscape.component.html',
  styleUrls: ['./cytoscape.component.css']
})
export class CytoscapeComponent implements OnInit {

  constructor(private _g: GlobalVariableService, private _cyService: CytoscapeService, private _ctxMenuService: ContextMenuService, private _marqueeService: MarqueeZoomService) { }
  cyClass = false;

  ngOnInit() {
    this._cyService.initCy(document.getElementById('cy'));
    this._ctxMenuService.bindContextMenuExtension();
    this._marqueeService.setChangeClassFn(this.setClassForCyDiv.bind(this));
  }

  setClassForCyDiv(b: boolean) {
    this.cyClass = b;
  }

  @HostListener('document:keydown.delete', ['$event'])
  deleteHotKeyFn() {
    const activeElement = document.activeElement as any;
    if (activeElement.tagName == 'INPUT' && activeElement.value && activeElement.value.length > 0) {
      return;
    }
    this._cyService.deleteSelected(false);
  }

  @HostListener('document:keydown.control.a', ['$event'])
  selectAllHotKeyFn(event: KeyboardEvent) {
    const activeElement = document.activeElement as any;
    if ((activeElement.tagName == 'INPUT' && activeElement.value && activeElement.value.length > 0) || activeElement.tagName == 'TEXTAREA') {
      return;
    }
    event.preventDefault();
    if (event.ctrlKey) {
      this._g.cy.$().not(':hidden, :transparent').select();
    }
  }

}
