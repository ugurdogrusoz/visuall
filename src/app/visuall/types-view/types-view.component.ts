import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';

@Component({
  selector: 'app-types-view',
  templateUrl: './types-view.component.html',
  styleUrls: ['./types-view.component.css']
})
export class TypesViewComponent implements OnInit {

  nodeClasses: Set<string>;
  showNodeClass = {};
  edgeClasses: Set<string>;
  showEdgeClass = {};
  @Output() onFilterByType = new EventEmitter<{ className: string, willBeShowed: boolean }>();

  constructor(private _g: GlobalVariableService) {
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
  }

  ngOnInit(): void {
    this._g.dataModel.subscribe(x => {
      if (x) {
        for (const key in x.nodes) {
          this.nodeClasses.add(key);
          this.showNodeClass[key] = true;
        }

        for (const key in x.edges) {
          this.edgeClasses.add(key);
          this.showEdgeClass[key] = true;
        }
      }
    });
  }

  filterElesByClass(className: string, isNode: boolean) {
    let willBeShowed = false;
    if (isNode) {
      this.showNodeClass[className] = !this.showNodeClass[className];
      willBeShowed = this.showNodeClass[className];
    } else {
      this.showEdgeClass[className] = !this.showEdgeClass[className];
      willBeShowed = this.showEdgeClass[className];
    }
    this.onFilterByType.next({ className: className, willBeShowed: willBeShowed });
  }

}
