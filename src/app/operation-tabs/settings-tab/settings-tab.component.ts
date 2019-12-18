import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../../cytoscape.service';
import { TimebarService } from '../../timebar.service';
import { GlobalVariableService } from '../../global-variable.service';
import { MIN_HIGHTLIGHT_WIDTH, MAX_HIGHTLIGHT_WIDTH, MAX_DATA_PAGE_SIZE, MIN_DATA_PAGE_SIZE, MAX_TABLE_COLUMN_COUNT, MIN_TABLE_COLUMN_COUNT } from '../../constants';
import stylesheet from '../../../assets/generated/stylesheet.json';
import { TimebarGraphInclusionTypes, TimebarStatsInclusionTypes, MergedElemIndicatorTypes, iBoolSetting } from 'src/app/user-preference';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {
  generalBoolSettings: iBoolSetting[];
  timebarBoolSettings: iBoolSetting[];
  highlightWidth: number;
  timebarPlayingStep: number;
  timebarPlayingSpeed: number;
  timebarZoomingStep: number;
  compoundPadding: string;
  dataPageSize: number;
  tableColumnLimit: number;
  timebarGraphInclusionTypes: string[];
  timebarStatsInclusionTypes: string[];
  mergedElemIndicators: string[];
  // multiple choice settings
  graphInclusionType: TimebarGraphInclusionTypes;
  statsInclusionTypes: TimebarStatsInclusionTypes;
  mergedElemIndicator: MergedElemIndicatorTypes;

  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    const up = this._g.userPrefs;
    this.generalBoolSettings = [
      {
        text: 'Perform layout on changes', isEnable: up.isAutoIncrementalLayoutOnChange.getValue(), actuator: this, fn: 'autoIncrementalLayoutSettingFn'
      },
      {
        text: 'Highlight on hover', isEnable: up.isHighlightOnHover.getValue(), actuator: this._cyService, fn: 'highlighterCheckBoxClicked'
      },
      {
        text: 'Show overview window', isEnable: up.isShowOverviewWindow.getValue(), actuator: this._cyService, fn: 'navigatorCheckBoxClicked'
      },
      {
        text: 'Show edge labels', isEnable: up.isShowEdgeLabels.getValue(), actuator: this._cyService, fn: 'showHideEdgeLabelCheckBoxClicked', isElemStyleSetting: true
      },
      {
        text: 'Fit labels to nodes', isEnable: up.isFitLabels2Nodes.getValue(), actuator: this._cyService, fn: 'fitNodeLabelsCheckBoxClicked', isElemStyleSetting: true
      },
      {
        text: 'Ignore case in text operations', isEnable: up.isIgnoreCaseInText.getValue(), actuator: this, fn: 'ignoreCaseSettingFn'
      }
    ];

    this.timebarBoolSettings = [
      { text: 'Show timebar', isEnable: up.timebar.isEnabled.getValue(), actuator: this._cyService, fn: 'showHideTimebar' },
      { text: 'Hide disconnected nodes on animation', isEnable: up.isHideDisconnectedNodesOnAnim.getValue(), actuator: this._timebarService, fn: 'setisHideDisconnectedNodes' }];

    this.highlightWidth = up.highlightWidth.getValue();
    this.timebarPlayingStep = up.timebar.playingStep.getValue();
    this.timebarZoomingStep = up.timebar.zoomingStep.getValue();
    this.timebarPlayingSpeed = up.timebar.playingSpeed.getValue();
    this.compoundPadding = up.compoundPadding.getValue();
    this.graphInclusionType = up.timebar.graphInclusionType.getValue();
    this.statsInclusionTypes = up.timebar.statsInclusionType.getValue();
    this.mergedElemIndicator = up.mergedElemIndicator.getValue();
    this.dataPageSize = up.dataPageSize.getValue();
    this.tableColumnLimit = up.tableColumnLimit.getValue();

    this.timebarGraphInclusionTypes = ['overlaps', 'contains', 'contained by'];
    this.timebarStatsInclusionTypes = ['all', 'begin', 'middle', 'end'];
    this.mergedElemIndicators = ['Selection', 'Highlight'];
    this._cyService.applyElementStyleSettings = this.applyElementStyleSettings.bind(this);
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

  onBoolSettingsChanged(setting: iBoolSetting) {
    setting.actuator[setting.fn](setting.isEnable);
  }

  ignoreCaseSettingFn(isEnable: boolean) { this._g.userPrefs.isIgnoreCaseInText.next(isEnable); }

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

  setTimebarPlayingSpeed() {
    this._timebarService.changeSpeed(this.timebarPlayingSpeed);
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