import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../../cytoscape.service';
import { TimebarService } from '../../timebar.service';
import { GlobalVariableService } from '../../global-variable.service';
import { MIN_HIGHTLIGHT_WIDTH, MAX_HIGHTLIGHT_WIDTH, MAX_DATA_PAGE_SIZE, MIN_DATA_PAGE_SIZE, MAX_TABLE_COLUMN_COUNT, MIN_TABLE_COLUMN_COUNT } from '../../constants';
import stylesheet from '../../../assets/generated/stylesheet.json';
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

  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.generalBoolSettings = [
      {
        text: 'Perform layout on changes', isEnable: false, actuator: this, fn: 'autoIncrementalLayoutSettingFn'
      },
      {
        text: 'Highlight on hover', isEnable: false, actuator: this._cyService, fn: 'highlighterCheckBoxClicked'
      },
      {
        text: 'Show overview window', isEnable: false, actuator: this._cyService, fn: 'navigatorCheckBoxClicked'
      },
      {
        text: 'Show edge labels', isEnable: false, actuator: this._cyService, fn: 'showHideEdgeLabelCheckBoxClicked', isElemStyleSetting: true
      },
      {
        text: 'Fit labels to nodes', isEnable: false, actuator: this._cyService, fn: 'fitNodeLabelsCheckBoxClicked', isElemStyleSetting: true
      },
      {
        text: 'Ignore case in text operations', isEnable: false, actuator: this, fn: 'ignoreCaseSettingFn'
      }
    ];

    this.timebarBoolSettings = [
      { text: 'Show timebar', isEnable: false, actuator: this._cyService, fn: 'showHideTimebar' },
      { text: 'Hide disconnected nodes on animation', isEnable: false, actuator: this._timebarService, fn: 'setisHideDisconnectedNodes' },
      { text: 'Maintain graph range on topology changes', isEnable: false, actuator: this, fn: 'maintainGraphRange' }];

    this._cyService.applyElementStyleSettings = this.applyElementStyleSettings.bind(this);
    this.subscribe2UserPrefs();
  }

  private subscribe2UserPrefs() {
    // reference variables for shorter text
    const up = this._g.userPrefs;
    const tb = this._timebarService;

    up.highlightWidth.subscribe(x => this.highlightWidth = x);
    up.timebar.playingStep.subscribe(x => { this.timebarPlayingStep = x; tb.changeStep(x); });
    up.timebar.zoomingStep.subscribe(x => { this.timebarZoomingStep = x; tb.changeZoomStep(x); });
    up.timebar.playingPeriod.subscribe(x => { this.timebarPlayingPeriod = x; tb.changePeriod(x); });
    up.timebar.graphInclusionType.subscribe(x => { this.graphInclusionType = x; tb.changeGraphInclusionType(x); });
    up.timebar.statsInclusionType.subscribe(x => { this.statsInclusionType = x; tb.changeStatsInclusionType(x); });
    up.compoundPadding.subscribe(x => this.compoundPadding = x);
    up.mergedElemIndicator.subscribe(x => this.mergedElemIndicator = x);
    up.dataPageSize.subscribe(x => this.dataPageSize = x);
    up.tableColumnLimit.subscribe(x => this.tableColumnLimit = x);

    // general bool settings
    up.isAutoIncrementalLayoutOnChange.subscribe(x => this.generalBoolSettings[0].isEnable = x);
    up.isHighlightOnHover.subscribe(x => this.generalBoolSettings[1].isEnable = x);
    up.isShowOverviewWindow.subscribe(x => this.generalBoolSettings[2].isEnable = x);
    up.isShowEdgeLabels.subscribe(x => this.generalBoolSettings[3].isEnable = x);
    up.isFitLabels2Nodes.subscribe(x => this.generalBoolSettings[4].isEnable = x);
    up.isIgnoreCaseInText.subscribe(x => this.generalBoolSettings[5].isEnable = x);

    // timebar bool settings
    up.timebar.isEnabled.subscribe(x => { this.timebarBoolSettings[0].isEnable = x; tb.showHideTimebar(x); });
    up.timebar.isHideDisconnectedNodesOnAnim.subscribe(x => { this.timebarBoolSettings[1].isEnable = x; tb.setisHideDisconnectedNodes(x); });
    up.timebar.isMaintainGraphRange.subscribe(x => { this.timebarBoolSettings[2].isEnable = x; tb.setIsMaintainGraphRange(x) });
  }

  mergedElemIndicatorChanged(i: number) {
    this._g.userPrefs.mergedElemIndicator.next(i);
  }

  applyElementStyleSettings() {
    let allSettings = [...this.generalBoolSettings, ...this.timebarBoolSettings];
    for (let setting of allSettings) {
      if (setting.isElemStyleSetting) {
        this.onBoolSettingsChanged(setting);
      }
    }
  }

  onBoolSettingsChanged(setting: BoolSetting) {
    setting.actuator[setting.fn](setting.isEnable);
  }

  ignoreCaseSettingFn(isEnable: boolean) { this._g.userPrefs.isIgnoreCaseInText.next(isEnable); }

  maintainGraphRange(isEnable: boolean) { this._g.userPrefs.timebar.isMaintainGraphRange.next(isEnable); }

  autoIncrementalLayoutSettingFn(isEnable: boolean) { this._g.userPrefs.isAutoIncrementalLayoutOnChange.next(isEnable); }

  changeHighlightOptions() {
    if (this.highlightWidth < MIN_HIGHTLIGHT_WIDTH) {
      this.highlightWidth = MIN_HIGHTLIGHT_WIDTH;
    }
    if (this.highlightWidth > MAX_HIGHTLIGHT_WIDTH) {
      this.highlightWidth = MAX_HIGHTLIGHT_WIDTH;
    }
    this._cyService.changeHighlightOptions(this.highlightWidth);
  }

  setTimebarPlayingPeriod() {
    this._timebarService.changePeriod(this.timebarPlayingPeriod);
  }

  setTimebarPlayingStep() {
    this._timebarService.changeStep(this.timebarPlayingStep);
  }

  setTimebarZoomStep() {
    this._timebarService.changeZoomStep(this.timebarZoomingStep);
  }

  changeCompoundPadding() {
    stylesheet.find(x => x.selector == ':compound').style.padding = this.compoundPadding;
    this._g.setStyleFromJson(stylesheet);
  }

  timebarGraphInclusionTypeChanged(i: number) {
    this._timebarService.changeGraphInclusionType(i);
  }

  timebarStatsInclusionTypeChanged(i: number) {
    this._timebarService.changeStatsInclusionType(i);
  }

  dataPageSizeChanged() {
    if (this.dataPageSize > MAX_DATA_PAGE_SIZE) {
      this.dataPageSize = MAX_DATA_PAGE_SIZE;
    }
    if (this.dataPageSize < MIN_DATA_PAGE_SIZE) {
      this.dataPageSize = MIN_DATA_PAGE_SIZE;
    }
    this._g.userPrefs.dataPageSize.next(this.dataPageSize);
  }

  tableColumnLimitChanged() {
    if (this.tableColumnLimit > MAX_TABLE_COLUMN_COUNT) {
      this.tableColumnLimit = MAX_TABLE_COLUMN_COUNT;
    }
    if (this.tableColumnLimit < MIN_TABLE_COLUMN_COUNT) {
      this.tableColumnLimit = MIN_TABLE_COLUMN_COUNT;
    }
    this._g.userPrefs.tableColumnLimit.next(this.tableColumnLimit);
  }

}