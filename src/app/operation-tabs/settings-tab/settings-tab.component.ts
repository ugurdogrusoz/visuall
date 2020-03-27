import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarGraphInclusionTypes, TimebarStatsInclusionTypes, MergedElemIndicatorTypes, BoolSetting } from 'src/app/user-preference';
import { UserProfileService } from 'src/app/user-profile.service';
import { BehaviorSubject } from 'rxjs';
import { MIN_HIGHTLIGHT_WIDTH, MAX_HIGHTLIGHT_WIDTH } from 'src/app/constants';

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
  isStoreUserProfile = true;

  constructor(private _g: GlobalVariableService, private _profile: UserProfileService) {
    this._profile.onLoadFromFile.subscribe(x => {
      if (!x) {
        return;
      }
      this._profile.transferUserPrefs();
      this.fillUIFromMemory();
    });
  }

  ngOnInit() {
    this.generalBoolSettings = [
      { text: 'Perform layout on changes', isEnable: false, path2userPref: 'isAutoIncrementalLayoutOnChange' },
      { text: 'Emphasize on hover', isEnable: false, path2userPref: 'isHighlightOnHover' },
      { text: 'Show overview window', isEnable: false, path2userPref: 'isShowOverviewWindow' },
      { text: 'Show edge labels', isEnable: false, path2userPref: 'isShowEdgeLabels' },
      { text: 'Fit labels to nodes', isEnable: false, path2userPref: 'isFitLabels2Nodes' },
      { text: 'Ignore case in text operations', isEnable: false, path2userPref: 'isIgnoreCaseInText' },
      { text: 'Show results of latest query only', isEnable: false, path2userPref: 'isOnlyHighlight4LatestQuery' }
    ];

    this.timebarBoolSettings = [
      { text: 'Show timebar', isEnable: false, path2userPref: 'timebar.isEnabled' },
      { text: 'Hide disconnected nodes on animation', isEnable: false, path2userPref: 'timebar.isHideDisconnectedNodesOnAnim' },
      { text: 'Maintain graph range on topology changes', isEnable: false, path2userPref: 'timebar.isMaintainGraphRange' }
    ];

    this.isInit = true;

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
    this.generalBoolSettings[6].isEnable = up.isOnlyHighlight4LatestQuery.getValue();

    this.mergedElemIndicator = up.mergedElemIndicator.getValue();
    this.dataPageSize = up.dataPageSize.getValue();
    this.queryHistoryLimit = up.queryHistoryLimit.getValue();
    this.tableColumnLimit = up.tableColumnLimit.getValue();
    this.highlightColor = up.highlightStyles[this._g.userPrefs.currHighlightIdx.getValue()].color.getValue();
    this.highlightWidth = up.highlightStyles[this._g.userPrefs.currHighlightIdx.getValue()].wid.getValue();
    this.compoundPadding = up.compoundPadding.getValue();
    this.isStoreUserProfile = up.isStoreUserProfile.getValue();

    this.timebarBoolSettings[0].isEnable = up_t.isEnabled.getValue();
    this.timebarBoolSettings[1].isEnable = up_t.isHideDisconnectedNodesOnAnim.getValue();
    this.timebarBoolSettings[2].isEnable = up_t.isMaintainGraphRange.getValue();
    this.timebarPlayingStep = up_t.playingStep.getValue();
    this.timebarPlayingPeriod = up_t.playingPeriod.getValue();
    this.timebarZoomingStep = up_t.zoomingStep.getValue();
    this.graphInclusionType = up_t.graphInclusionType.getValue();
    this.statsInclusionType = up_t.statsInclusionType.getValue();

    this.highlightStyleSelected(this._g.userPrefs.currHighlightIdx.getValue());
    this.setHighlightStyles();
  }

  private setHighlightStyles() {
    if (!this._g.viewUtils) {
      return;
    }
    this.currHighlightStyles = [];
    let styles = this._g.viewUtils.getHighlightStyles();
    for (let i = 0; i < styles.length; i++) {
      this.currHighlightStyles.push('Style ' + (i + 1));
      let c = styles[i].node['border-color'];
      let w = styles[i].node['border-width'];
      if (this._g.userPrefs.highlightStyles[i]) {
        this._g.userPrefs.highlightStyles[i].color.next(c);
        this._g.userPrefs.highlightStyles[i].wid.next(w);
      } else {
        this._g.userPrefs.highlightStyles[i] = { wid: new BehaviorSubject<number>(w), color: new BehaviorSubject<string>(c) };
      }
    }
    this._profile.saveUserPrefs();
  }

  settingChanged(val: any, userPref: string) {
    let path = userPref.split('.');
    let obj = this._g.userPrefs[path[0]];
    for (let i = 1; i < path.length; i++) {
      obj = obj[path[i]];
    }
    obj.next(val);
    this._profile.saveUserPrefs();
  }

  onColorSelected(c: string) {
    this.highlightColor = c;
  }

  // used to change border width or color. One of them should be defined. (exclusively)
  changeHighlightStyle() {
    this.bandPassHighlightWidth();
    let nodeCss = { 'border-color': this.highlightColor, 'border-width': this.highlightWidth };
    let edgeCss = { 'line-color': this.highlightColor, 'target-arrow-color': this.highlightColor, 'width': this.highlightWidth };
    this._g.viewUtils.changeHighlightStyle(this.highlightStyleIdx, nodeCss, edgeCss);
    this.setHighlightStyles();
  }

  addHighlightStyle() {
    this.bandPassHighlightWidth();
    let nodeCss = { 'border-color': this.highlightColor, 'border-width': this.highlightWidth };
    let edgeCss = { 'line-color': this.highlightColor, 'target-arrow-color': this.highlightColor, 'width': this.highlightWidth };
    this._g.viewUtils.addHighlightStyle(nodeCss, edgeCss);
    this.setHighlightStyles();
    this.highlightStyleIdx = this.currHighlightStyles.length - 1;
    this.highlightStyleSelected(this.highlightStyleIdx);
  }

  highlightStyleSelected(i: number) {
    this.highlightStyleIdx = i;
    this._g.userPrefs.currHighlightIdx.next(i);
    let style = this._g.viewUtils.getHighlightStyles()[i];
    this.highlightColor = style.node['border-color'];
    this.highlightWidth = style.node['border-width'];
    this._profile.saveUserPrefs();
  }

  bandPassHighlightWidth() {
    if (this.highlightWidth < MIN_HIGHTLIGHT_WIDTH) {
      this.highlightWidth = MIN_HIGHTLIGHT_WIDTH;
    }
    if (this.highlightWidth > MAX_HIGHTLIGHT_WIDTH) {
      this.highlightWidth = MAX_HIGHTLIGHT_WIDTH;
    }
  }
}