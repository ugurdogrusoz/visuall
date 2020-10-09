import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarGraphInclusionTypes, TimebarStatsInclusionTypes, MergedElemIndicatorTypes, BoolSetting, GroupingOptionTypes } from '../../user-preference';
import { UserProfileService } from '../../user-profile.service';
import { BehaviorSubject } from 'rxjs';
import { MIN_HIGHTLIGHT_WIDTH, MAX_HIGHTLIGHT_WIDTH, getCyStyleFromColorAndWid } from '../../constants';
import flatpickr from 'flatpickr';
import { ErrorModalComponent } from '../../popups/error-modal/error-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild('dbQueryDate1', { static: false }) dbQueryDate1: ElementRef;
  @ViewChild('dbQueryDate2', { static: false }) dbQueryDate2: ElementRef;
  isLimitDbQueries2range: boolean;
  dataPageSize: number;
  queryHistoryLimit: number;
  tableColumnLimit: number;
  edgeCollapseLimit: number;
  timebarGraphInclusionTypes: string[] = ['overlaps', 'contains', 'contained by'];
  timebarStatsInclusionTypes: string[] = ['all', 'begin', 'middle', 'end'];
  mergedElemIndicators: string[] = ['None', 'Selection', 'Highlight'];
  groupingOptions: string[] = ['Compounds', 'Circles'];
  nodeLabelWrapTypes: string[] = ['None', 'Wrap', 'Ellipsis'];
  // multiple choice settings
  graphInclusionType: TimebarGraphInclusionTypes;
  statsInclusionType: TimebarStatsInclusionTypes;
  mergedElemIndicator: MergedElemIndicatorTypes;
  groupingOption: GroupingOptionTypes;
  nodeLabelWrap: number = 0;
  isInit: boolean = false;
  currHighlightStyles: string[] = [];
  highlightStyleIdx = 0;
  isStoreUserProfile = true;
  selectionColor = "#6c757d";
  selectionWidth = 4.5;

  constructor(private _g: GlobalVariableService, private _profile: UserProfileService, private _modalService: NgbModal) {
    this._profile.onLoadFromFile.subscribe(x => {
      if (!x) {
        return;
      }
      this._profile.transferUserPrefs();
      this.setViewUtilsStyle();
      this.fillUIFromMemory();
    });
  }

  ngOnInit() {
    this.generalBoolSettings = [
      { text: 'Perform layout on changes', isEnable: false, path2userPref: 'isAutoIncrementalLayoutOnChange' },
      { text: 'Emphasize on hover', isEnable: false, path2userPref: 'isHighlightOnHover' },
      { text: 'Show overview window', isEnable: false, path2userPref: 'isShowOverviewWindow' },
      { text: 'Show edge labels', isEnable: false, path2userPref: 'isShowEdgeLabels' },
      { text: 'Ignore case in text operations', isEnable: false, path2userPref: 'isIgnoreCaseInText' },
      { text: 'Show results of latest query only', isEnable: false, path2userPref: 'isOnlyHighlight4LatestQuery' },
      { text: 'Collapse multiple edges based on type', isEnable: false, path2userPref: 'isCollapseEdgesBasedOnType' },
      { text: 'Collapse multiple edges on load', isEnable: false, path2userPref: 'isCollapseMultiEdgesOnLoad' },
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

  private setDates4DbQuery() {

    setTimeout(() => {
      const maxDate = this._g.userPrefsFromFiles.dbQueryTimeRange.end.getValue();
      const minDate = this._g.userPrefsFromFiles.dbQueryTimeRange.start.getValue();
      const d1 = this._g.userPrefs.dbQueryTimeRange.start.getValue();
      const opt1 = {
        defaultDate: new Date(d1), enableTime: true, enableSeconds: true, time_24hr: true,
        onChange: (x, _, instance) => {
          const dateTime = x[0].getTime();
          const startDate = this._g.userPrefs.dbQueryTimeRange.start.getValue();
          const endDate = this._g.userPrefs.dbQueryTimeRange.end.getValue();
          if (dateTime >= endDate) {
            instance.setDate(startDate);
            this.showDateTimeError('Start datetime should be earlier than end datetime');
            return;
          }
          this._g.userPrefs.dbQueryTimeRange.start.next(dateTime);
          this._profile.saveUserPrefs();
        },
        minDate: minDate,
        maxDate: maxDate,
      };
      const d2 = this._g.userPrefs.dbQueryTimeRange.end.getValue();
      const opt2 = {
        defaultDate: new Date(d2), enableTime: true, enableSeconds: true, time_24hr: true,
        onChange: (x, _, instance) => {
          const dateTime = x[0].getTime();
          const startDate = this._g.userPrefs.dbQueryTimeRange.start.getValue();
          const endDate = this._g.userPrefs.dbQueryTimeRange.end.getValue();
          if (dateTime <= startDate) {
            instance.setDate(endDate);
            this.showDateTimeError('End datetime should be later than start datetime');
            return;
          }
          this._g.userPrefs.dbQueryTimeRange.end.next(dateTime);
          this._profile.saveUserPrefs();
        },
        minDate: minDate,
        maxDate: maxDate,
      };
      flatpickr(this.dbQueryDate1.nativeElement, opt1);
      flatpickr(this.dbQueryDate2.nativeElement, opt2);
    }, 0);
  }

  private showDateTimeError(msg: string) {
    const instance = this._modalService.open(ErrorModalComponent);
    instance.componentInstance.msg = msg;
    instance.componentInstance.title = 'Date Selection';
  }

  private fillUIFromMemory() {
    // reference variables for shorter text
    const up = this._g.userPrefs;
    const up_t = this._g.userPrefs.timebar;

    this.generalBoolSettings[0].isEnable = up.isAutoIncrementalLayoutOnChange.getValue();
    this.generalBoolSettings[1].isEnable = up.isHighlightOnHover.getValue();
    this.generalBoolSettings[2].isEnable = up.isShowOverviewWindow.getValue();
    this.generalBoolSettings[3].isEnable = up.isShowEdgeLabels.getValue();
    this.generalBoolSettings[4].isEnable = up.isIgnoreCaseInText.getValue();
    this.generalBoolSettings[5].isEnable = up.isOnlyHighlight4LatestQuery.getValue();
    this.generalBoolSettings[6].isEnable = up.isCollapseEdgesBasedOnType.getValue();
    this.generalBoolSettings[7].isEnable = up.isCollapseMultiEdgesOnLoad.getValue();

    this.nodeLabelWrap = up.nodeLabelWrap.getValue();
    this.mergedElemIndicator = up.mergedElemIndicator.getValue();
    this.groupingOption = up.groupingOption.getValue();
    this.dataPageSize = up.dataPageSize.getValue();
    this.queryHistoryLimit = up.queryHistoryLimit.getValue();
    this.tableColumnLimit = up.tableColumnLimit.getValue();
    this.edgeCollapseLimit = up.edgeCollapseLimit.getValue();
    this.currHighlightStyles = up.highlightStyles.map((_, i) => 'Style ' + (i + 1));
    this.highlightStyleIdx = up.currHighlightIdx.getValue();
    this.highlightColor = up.highlightStyles[this._g.userPrefs.currHighlightIdx.getValue()].color.getValue();
    this.highlightWidth = up.highlightStyles[this._g.userPrefs.currHighlightIdx.getValue()].wid.getValue();
    this.selectionColor = up.selectionColor.getValue();
    this.selectionWidth = up.selectionWidth.getValue();
    this.compoundPadding = up.compoundPadding.getValue();
    this.isStoreUserProfile = up.isStoreUserProfile.getValue();
    this.isLimitDbQueries2range = up.isLimitDbQueries2range.getValue();
    this.graphInclusionType = up.objectInclusionType.getValue();

    this.timebarBoolSettings[0].isEnable = up_t.isEnabled.getValue();
    this.timebarBoolSettings[1].isEnable = up_t.isHideDisconnectedNodesOnAnim.getValue();
    this.timebarBoolSettings[2].isEnable = up_t.isMaintainGraphRange.getValue();
    this.timebarPlayingStep = up_t.playingStep.getValue();
    this.timebarPlayingPeriod = up_t.playingPeriod.getValue();
    this.timebarZoomingStep = up_t.zoomingStep.getValue();
    this.statsInclusionType = up_t.statsInclusionType.getValue();

    this.setHighlightStyles();
    this.highlightStyleSelected(this._g.userPrefs.currHighlightIdx.getValue());
    this.setDates4DbQuery();
  }

  private setHighlightStyles() {
    if (!this._g.viewUtils) {
      return;
    }
    this.currHighlightStyles = [];
    let styles = this._g.viewUtils.getHighlightStyles();
    for (let i = 0; i < styles.length; i++) {
      this.currHighlightStyles.push('Style ' + (i + 1));
      let c = styles[i].node['overlay-color'];
      let w = styles[i].node['overlay-padding'];
      if (this._g.userPrefs.highlightStyles[i]) {
        this._g.userPrefs.highlightStyles[i].color.next(c);
        this._g.userPrefs.highlightStyles[i].wid.next(w);
      } else {
        this._g.userPrefs.highlightStyles[i] = { wid: new BehaviorSubject<number>(w), color: new BehaviorSubject<string>(c) };
      }
    }
    this._g.userPrefs.highlightStyles.splice(styles.length);
    this._profile.saveUserPrefs();
  }

  // set view utils extension highlight styles from memory (_g.userPrefs)
  private setViewUtilsStyle() {
    const styles = this._g.userPrefs.highlightStyles;
    let vuStyles = this._g.viewUtils.getHighlightStyles();
    for (let i = 0; i < vuStyles.length; i++) {
      let cyStyle = getCyStyleFromColorAndWid(styles[i].color.getValue(), styles[i].wid.getValue());
      this._g.viewUtils.changeHighlightStyle(i, cyStyle.nodeCss, cyStyle.edgeCss);
    }
    for (let i = vuStyles.length; i < styles.length; i++) {
      let cyStyle = getCyStyleFromColorAndWid(styles[i].color.getValue(), this.highlightWidth);
      this._g.viewUtils.addHighlightStyle(cyStyle.nodeCss, cyStyle.edgeCss);
    }
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

  onSelColorSelected(c: string) {
    this._g.userPrefs.selectionColor.next(c);
    this.selectionColor = c;
    this._g.cy.style().selector('core').style({ 'selection-box-color': this.selectionColor })
    this._g.cy.style().selector(':selected').style({ 'overlay-color': this.selectionColor }).update();
    this._profile.saveUserPrefs()
  }

  onSelWidSelected( w ) {
    let width = parseFloat(w.target.value);
    this._g.userPrefs.selectionWidth.next(width);
    this.selectionWidth = width;
    this._g.cy.style().selector(':selected').style({ 'overlay-padding': width }).update();
    this._profile.saveUserPrefs()
  }

  // used to change border width or color. One of them should be defined. (exclusively)
  changeHighlightStyle() {
    this.bandPassHighlightWidth();
    let cyStyle = getCyStyleFromColorAndWid(this.highlightColor, this.highlightWidth);
    this._g.viewUtils.changeHighlightStyle(this.highlightStyleIdx, cyStyle.nodeCss, cyStyle.edgeCss);
    this.setHighlightStyles();
    this._g.updateSelectionCyStyle();
  }

  deleteHighlightStyle() {
    if (this._g.viewUtils.getAllHighlightClasses().length < 2) {
      return;
    }
    this._g.viewUtils.removeHighlightStyle(this.highlightStyleIdx);
    this.setHighlightStyles();
    let styleCnt = this._g.viewUtils.getAllHighlightClasses().length - 1;
    if (this.highlightStyleIdx > styleCnt) {
      this.highlightStyleIdx = styleCnt;
    }
    this.highlightStyleSelected(this.highlightStyleIdx);
  }

  addHighlightStyle() {
    this.bandPassHighlightWidth();
    let cyStyle = getCyStyleFromColorAndWid(this.highlightColor, this.highlightWidth);
    this._g.viewUtils.addHighlightStyle(cyStyle.nodeCss, cyStyle.edgeCss);
    this.setHighlightStyles();
    this.highlightStyleIdx = this.currHighlightStyles.length - 1;
    this.highlightStyleSelected(this.highlightStyleIdx);
    this._g.updateSelectionCyStyle();
  }

  highlightStyleSelected(i: number) {
    this.highlightStyleIdx = i;
    this._g.userPrefs.currHighlightIdx.next(i);
    let style = this._g.viewUtils.getHighlightStyles()[i];
    this.highlightColor = style.node['overlay-color'];
    this.highlightWidth = style.node['overlay-padding'];
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
