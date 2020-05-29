import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../../../cytoscape.service';
import { areSetsEqual } from '../../../constants';
import { GlobalVariableService } from '../../../global-variable.service';
import { LouvainClustering } from './LouvainClustering';

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
  louvainClusterer: LouvainClustering;

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.options = ['None', 'By the Markov clustering algorithm', 'By director', 'By the Louvain modularity algorithm'];
    this.selectedOption = this.options[0];
    this.louvainClusterer = new LouvainClustering();
  }

  optionChanged() {
    const idx = this.options.findIndex((x) => x == this.selectedOption);
    this._cyService.expandAllCompounds();
    this._cyService.deleteClusteringNodes();
    if (idx == 1) {
      this._cyService.markovClustering();
    } else if (idx == 2) {
      this._cyService.clusterByDirector();
    } else if (idx == 3) {
      const nodes = this._g.cy.nodes().map(x => x.id());
      const edges = this._g.cy.edges().map(x => { return { source: x.source().id(), target: x.target().id(), weight: 1 } });
      const _assoc_mat = this.louvainClusterer.make_assoc_mat(edges);
      const g = { nodes: nodes, edges: edges, _assoc_mat: _assoc_mat };

      this.louvainClusterer.setOriginalGraph(g)
      const dendogram = this.louvainClusterer.generate_dendogram(g, undefined) as any;
      const clustering = this.louvainClusterer.partition_at_level(dendogram, dendogram.length - 1);
      this._cyService.louvainClustering(clustering);
    }
    this._g.performLayout(false);
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
