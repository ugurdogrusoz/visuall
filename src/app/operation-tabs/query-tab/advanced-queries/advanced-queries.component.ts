import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/global-variable.service';
import properties from '../../../../assets/generated/properties.json';

@Component({
  selector: 'app-advanced-queries',
  templateUrl: './advanced-queries.component.html',
  styleUrls: ['./advanced-queries.component.css']
})
export class AdvancedQueriesComponent implements OnInit {

  queries: string[];
  selectedQuery: string;
  selectedIdx: number;
  nodeEdgeClasses: string[] = [];
  ignoredTypes: string[] = [];
  lengthLimit = 2;
  isDirected = true;
  selectedNodes: { dbId: string, label: string }[] = [];
  selectedClass = '';
  targetOrRegulator = 0;

  constructor(private _g: GlobalVariableService) {
    this.queries = ['Get graph of interest', 'Get common targets/regulators'];
    this.selectedIdx = -1;
  }

  ngOnInit(): void {
    this.selectedQuery = '';
    for (const n in properties.nodes) {
      this.nodeEdgeClasses.push(n);
    }
    for (const e in properties.edges) {
      this.nodeEdgeClasses.push(e);
    }
  }

  changeAdvancedQuery(event) {
    this.selectedIdx = this.queries.findIndex(x => x == event.target.value);
  }

  addSelectedNodes() {
    const selectedNodes = this._g.cy.nodes(':selected');
    if (selectedNodes.length < 1) {
      return;
    }
    const dbIds = selectedNodes.map(x => x.id().slice(1));
    const labels = this._g.getLabels4Elems(dbIds).split(',');
    const types = selectedNodes.map(x => x.classes().join());
    for (let i = 0; i < labels.length; i++) {
      if (this.selectedNodes.findIndex(x => x.dbId == dbIds[i]) < 0) {
        this.selectedNodes.push({ dbId: dbIds[i], label: types[i] + ':' + labels[i] });
      }
    }
  }

  removeSelected(i: number) {
    this.selectedNodes.splice(i, 1);
  }

  removeAllSelectedNodes() {
    this.selectedNodes = [];
  }

  addIgnoredType() {
    if (!this.ignoredTypes.includes(this.selectedClass)) {
      this.ignoredTypes.push(this.selectedClass);
    }
  }

  removeIgnoredType(i: number) {
    this.ignoredTypes.splice(i, 1);
  }

  runQuery() {

  }

}
