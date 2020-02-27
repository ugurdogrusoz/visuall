import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../../cytoscape.service';
import { TimebarService } from '../../timebar.service';
import { GlobalVariableService } from '../../global-variable.service';
import { MIN_HIGHTLIGHT_WIDTH, MAX_HIGHTLIGHT_WIDTH, MAX_DATA_PAGE_SIZE, MIN_DATA_PAGE_SIZE, MAX_TABLE_COLUMN_COUNT, MIN_TABLE_COLUMN_COUNT } from '../../constants';
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
  tableColumnLimit: number;
  timebarGraphInclusionTypes: string[] = ['overlaps', 'contains', 'contained by'];
  timebarStatsInclusionTypes: string[] = ['all', 'begin', 'middle', 'end'];
  mergedElemIndicators: string[] = ['Selection', 'Highlight'];
  // multiple choice settings
  graphInclusionType: TimebarGraphInclusionTypes;
  statsInclusionType: TimebarStatsInclusionTypes;
  mergedElemIndicator: MergedElemIndicatorTypes;
  isInit: boolean = false;

  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.generalBoolSettings = [
      {
        text: 'Perform layout on changes', isEnable: false, path2userPref: 'isAutoIncrementalLayoutOnChange'
      },
      {
        text: 'Highlight on hover', isEnable: false, path2userPref: 'isHighlightOnHover'
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
      }
    ];

    this.timebarBoolSettings = [
      { text: 'Show timebar', isEnable: false, path2userPref: 'timebar.isEnabled' },
      { text: 'Hide disconnected nodes on animation', isEnable: false, path2userPref: 'timebar.isHideDisconnectedNodesOnAnim' },
      { text: 'Maintain graph range on topology changes', isEnable: false, path2userPref: 'timebar.isMaintainGraphRange' }];

    this.subscribe2UserPrefs();
    this.isInit = true;
  }

  private subscribe2UserPrefs() {
    // reference variables for shorter text
    const up = this._g.userPrefs;
    const up_t = this._g.userPrefs.timebar;
    const tb = this._timebarService;

    up.isAutoIncrementalLayoutOnChange.subscribe(x => { this.generalBoolSettings[0].isEnable = x; this.changeAutoIncremental(x); });
    up.isHighlightOnHover.subscribe(x => { this.generalBoolSettings[1].isEnable = x; this._cyService.highlighterCheckBoxClicked(x); });
    up.isShowOverviewWindow.subscribe(x => { this.generalBoolSettings[2].isEnable = x; this._cyService.navigatorCheckBoxClicked(x); });
    up.isShowEdgeLabels.subscribe(x => { this.generalBoolSettings[3].isEnable = x; this._cyService.showHideEdgeLabelCheckBoxClicked(x); });
    up.isFitLabels2Nodes.subscribe(x => { this.generalBoolSettings[4].isEnable = x; this._cyService.fitNodeLabelsCheckBoxClicked(x); });
    up.isIgnoreCaseInText.subscribe(x => { this.generalBoolSettings[5].isEnable = x; });
    up.mergedElemIndicator.subscribe(x => this.mergedElemIndicator = x);
    up.dataPageSize.subscribe(x => { this.dataPageSize = x; this.dataPageSizeChanged(x); });
    up.tableColumnLimit.subscribe(x => { this.tableColumnLimit = x; this.tableColumnLimitChanged(x); });
    up.highlightWidth.subscribe(x => { this.highlightWidth = x; this.changeHighlightWidth(x); });
    up.highlightColor.subscribe(x => { this.highlightColor = x; this.changeHighlightColor(x); });
    up.compoundPadding.subscribe(x => { this.compoundPadding = x; this.changeCompoundPadding(x); });

    up_t.isEnabled.subscribe(x => this.isEnableTimebar(x));
    up_t.isHideDisconnectedNodesOnAnim.subscribe(x => { this.timebarBoolSettings[1].isEnable = x; tb.setisHideDisconnectedNodes(x); });
    up_t.isMaintainGraphRange.subscribe(x => { this.timebarBoolSettings[2].isEnable = x; tb.setIsMaintainGraphRange(x) });
    up_t.playingStep.subscribe(x => { this.timebarPlayingStep = x; tb.changeStep(x); });
    up_t.playingPeriod.subscribe(x => { this.timebarPlayingPeriod = x; tb.changePeriod(x); });
    up_t.zoomingStep.subscribe(x => { this.timebarZoomingStep = x; tb.changeZoomStep(x); });
    up_t.graphInclusionType.subscribe(x => { this.graphInclusionType = x; tb.changeGraphInclusionType(x); });
    up_t.statsInclusionType.subscribe(x => { this.statsInclusionType = x; tb.changeStatsInclusionType(x); });
  }

  isEnableTimebar(x: boolean) {
    this.timebarBoolSettings[0].isEnable = x;
    if (this.isInit) {
      this._cyService.showHideTimebar(x);
    }
  }

  changeAutoIncremental(x: boolean) {
    if (x) {
      this._g.expandCollapseApi.setOption('layoutBy', this._g.layout);
      this._g.expandCollapseApi.setOption('fisheye', true);
      this._g.expandCollapseApi.setOption('animate', true);
    } else {
      this._g.expandCollapseApi.setOption('layoutBy', null);
      this._g.expandCollapseApi.setOption('fisheye', false);
      this._g.expandCollapseApi.setOption('animate', false);
    }
  }

  changeHighlightWidth(x: number) {
    if (x < MIN_HIGHTLIGHT_WIDTH) {
      x = MIN_HIGHTLIGHT_WIDTH;
      this._g.userPrefs.highlightWidth.next(x);
      return;
    }
    if (x > MAX_HIGHTLIGHT_WIDTH) {
      x = MAX_HIGHTLIGHT_WIDTH;
      this._g.userPrefs.highlightWidth.next(x);
      return;
    }
    this._cyService.changeHighlights(x);
  }

  changeHighlightColor(color: string) {
    this._cyService.changeHighlights(this.highlightWidth, color);
  }

  changeCompoundPadding(x: string) {
    this._g.cy.style().selector(':compound')
      .style({ 'padding': x })
      .update();
  }

  dataPageSizeChanged(x: number) {
    if (x > MAX_DATA_PAGE_SIZE) {
      x = MAX_DATA_PAGE_SIZE;
      this._g.userPrefs.dataPageSize.next(x);
      return;
    }
    if (x < MIN_DATA_PAGE_SIZE) {
      x = MIN_DATA_PAGE_SIZE;
      this._g.userPrefs.dataPageSize.next(x);
      return;
    }
  }

  tableColumnLimitChanged(x: number) {
    if (x > MAX_TABLE_COLUMN_COUNT) {
      x = MAX_TABLE_COLUMN_COUNT;
      this._g.userPrefs.tableColumnLimit.next(x);
      return;
    }
    if (x < MIN_TABLE_COLUMN_COUNT) {
      x = MIN_TABLE_COLUMN_COUNT;
      this._g.userPrefs.tableColumnLimit.next(x);
      return;
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
  }
}