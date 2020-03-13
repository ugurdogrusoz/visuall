import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarGraphInclusionTypes, TimebarStatsInclusionTypes, MergedElemIndicatorTypes, BoolSetting } from 'src/app/user-preference';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {
  generalBoolSettings: BoolSetting[];
  timebarBoolSettings: BoolSetting[];
  highlightWidth: number;
  highlightColor: string;
  timebarPlayingStep: number;
  timebarPlayingPeriod: number;
  timebarZoomingStep: number;
  compoundPadding: string;
  dataPageSize: number;
  queryHistoryLimit: number;
  tableColumnLimit: number;
  timebarGraphInclusionTypes: string[] = ['overlaps', 'contains', 'contained by'];
  timebarStatsInclusionTypes: string[] = ['all', 'begin', 'middle', 'end'];
  mergedElemIndicators: string[] = ['Selection', 'Highlight'];
  // multiple choice settings
  graphInclusionType: TimebarGraphInclusionTypes;
  statsInclusionType: TimebarStatsInclusionTypes;
  mergedElemIndicator: MergedElemIndicatorTypes;
  isInit: boolean = false;
  currHighlightStyles: string[] = [];
  highlightStyleIdx = 0;

  constructor(private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.generalBoolSettings = [
      {
        text: 'Perform layout on changes', isEnable: false, path2userPref: 'isAutoIncrementalLayoutOnChange'
      },
      {
        text: 'Emphasize on hover', isEnable: false, path2userPref: 'isHighlightOnHover'
      },
      {
        text: 'Show overview window', isEnable: false, path2userPref: 'isShowOverviewWindow'
      },
      {
        text: 'Show edge labels', isEnable: false, path2userPref: 'isShowEdgeLabels'
      },
      {
        text: 'Fit labels to nodes', isEnable: false, path2userPref: 'isFitLabels2Nodes'
      },
      {
        text: 'Ignore case in text operations', isEnable: false, path2userPref: 'isIgnoreCaseInText'
      },
      { text: 'Highlight results of latest query only', isEnable: false, path2userPref: 'isOnlyHighlight4LatestQuery' }
    ];

    this.timebarBoolSettings = [
      { text: 'Show timebar', isEnable: false, path2userPref: 'timebar.isEnabled' },
      { text: 'Hide disconnected nodes on animation', isEnable: false, path2userPref: 'timebar.isHideDisconnectedNodesOnAnim' },
      { text: 'Maintain graph range on topology changes', isEnable: false, path2userPref: 'timebar.isMaintainGraphRange' }
    ];

    this.isInit = true;

    this.setHighlightStyles();
    this.highlightStyleSelected(this._g.currHighlightIdx);
    this._g.operationTabChanged.subscribe(x => {
      if (x == 3) { // check if my tab is opened
        this.fillUIFromMemory();
      }
    });
  }

  private fillUIFromMemory() {
    // reference variables for shorter text
    const up = this._g.userPrefs;
    const up_t = this._g.userPrefs.timebar;

    this.generalBoolSettings[0].isEnable = up.isAutoIncrementalLayoutOnChange.getValue();
    this.generalBoolSettings[1].isEnable = up.isHighlightOnHover.getValue();
    this.generalBoolSettings[2].isEnable = up.isShowOverviewWindow.getValue();
    this.generalBoolSettings[3].isEnable = up.isShowEdgeLabels.getValue();
    this.generalBoolSettings[4].isEnable = up.isFitLabels2Nodes.getValue();
    this.generalBoolSettings[5].isEnable = up.isIgnoreCaseInText.getValue();
    this.mergedElemIndicator = up.mergedElemIndicator.getValue();
    this.dataPageSize = up.dataPageSize.getValue();
    this.queryHistoryLimit = up.queryHistoryLimit.getValue();
    this.tableColumnLimit = up.tableColumnLimit.getValue();
    this.highlightWidth = up.highlightWidth.getValue();
    this.highlightColor = up.highlightColor.getValue();
    this.compoundPadding = up.compoundPadding.getValue();

    this.timebarBoolSettings[0].isEnable = up_t.isEnabled.getValue();
    this.timebarBoolSettings[1].isEnable = up_t.isHideDisconnectedNodesOnAnim.getValue();
    this.timebarBoolSettings[2].isEnable = up_t.isMaintainGraphRange.getValue();
    this.timebarPlayingStep = up_t.playingStep.getValue();
    this.timebarPlayingPeriod = up_t.playingPeriod.getValue();
    this.timebarZoomingStep = up_t.zoomingStep.getValue();
    this.graphInclusionType = up_t.graphInclusionType.getValue();
    this.statsInclusionType = up_t.statsInclusionType.getValue();

    this.highlightStyleSelected(this._g.currHighlightIdx);
  }

  private setHighlightStyles() {
    this.currHighlightStyles = [];
    let styleCount = this._g.viewUtils.getHighlightStyles().length;
    for (let i = 0; i < styleCount; i++) {
      this.currHighlightStyles.push('Style ' + (i + 1));
    }
  }

  settingChanged(val: any, userPref: string) {
    let path = userPref.split('.');
    let obj = this._g.userPrefs[path[0]];
    for (let i = 1; i < path.length; i++) {
      obj = obj[path[i]];
    }
    obj.next(val);
  }

  onColorSelected(c: string) {
    this._g.userPrefs.highlightColor.next(c);
    this.highlightColor = c;
  }

  // used to change border width or color. One of them should be defined. (exclusively)
  changeHighlightStyle() {
    let nodeCss = { 'border-color': this.highlightColor, 'border-width': this.highlightWidth };
    let edgeCss = { 'line-color': this.highlightColor, 'target-arrow-color': this.highlightColor, 'width': this.highlightWidth };
    this._g.viewUtils.changeHighlightStyle(this.highlightStyleIdx, nodeCss, edgeCss);
    this.setHighlightStyles();
  }

  addHighlightStyle() {
    let nodeCss = { 'border-color': this.highlightColor, 'border-width': this.highlightWidth };
    let edgeCss = { 'line-color': this.highlightColor, 'target-arrow-color': this.highlightColor, 'width': this.highlightWidth };
    this._g.viewUtils.addHighlightStyle(nodeCss, edgeCss);
    this.setHighlightStyles();
    this.highlightStyleIdx = this.currHighlightStyles.length - 1;
    this.highlightStyleSelected(this.highlightStyleIdx);
  }

  highlightStyleSelected(i: number) {
    this.highlightStyleIdx = i;
    this._g.currHighlightIdx = i;
    let style = this._g.viewUtils.getHighlightStyles()[i];
    this.highlightColor = style.node['border-color'];
    this.highlightWidth = style.node['border-width'];
  }
}