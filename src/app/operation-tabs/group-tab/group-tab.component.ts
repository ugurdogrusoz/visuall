import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../../cytoscape.service';
import { areSetsEqual } from '../../constants';
import { GlobalVariableService } from '../../global-variable.service';

@Component({
  selector: 'app-group-tab',
  templateUrl: './group-tab.component.html',
  styleUrls: ['./group-tab.component.css']
})
export class GroupTabComponent implements OnInit {
  options: any[];
  selectedOption: any;
  prevGraph: Set<string>;
  currGraph: Set<string>;

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.options = ['None', 'By the Markov clustering algorithm', 'By director'];
    this.selectedOption = this.options[0];
  }

  optionChanged() {
    const idx = this.options.findIndex((x) => x == this.selectedOption);
    this._cyService.expandAllCompounds();
    this._cyService.deleteClusteringNodes();
    if (idx == 1) {
      this._cyService.markovClustering();
      this._g.performLayout(false);
    } else if (idx == 2) {
      this._cyService.clusterByDirector();
      this._g.performLayout(false);
    }
    this.setGraphState();
  }

  setGraphState() {
    this.prevGraph = this.currGraph;
    this.currGraph = this._g.getGraphElemSet();
  }

  public componentOpened() {
    this.setGraphState();
    // set radio to None because graph has changed 
    if (!areSetsEqual(this.prevGraph, this.currGraph)) {
      this.selectedOption = this.options[0];
    }
  }
}
