import { CytoscapeService } from './cytoscape.service';
import { TimebarService } from './timebar.service';
import { GlobalVariableService } from './global-variable.service';
import { MIN_HIGHTLIGHT_WIDTH, MAX_DATA_PAGE_SIZE, MAX_HIGHTLIGHT_WIDTH, MIN_DATA_PAGE_SIZE, MAX_TABLE_COLUMN_COUNT, MIN_TABLE_COLUMN_COUNT } from './constants';

export class UserPrefHelper {
  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _g: GlobalVariableService) {
  }

  listen4UserPref() {
    const up = this._g.userPrefs;
    const up_t = this._g.userPrefs.timebar;
    const tb = this._timebarService;

    up.isAutoIncrementalLayoutOnChange.subscribe(x => { this.changeAutoIncremental(x); });
    up.isHighlightOnHover.subscribe(x => { this._cyService.highlighterCheckBoxClicked(x); });
    up.isShowOverviewWindow.subscribe(x => { this._cyService.navigatorCheckBoxClicked(x); });
    up.isShowEdgeLabels.subscribe(x => { this._cyService.showHideEdgeLabelCheckBoxClicked(x); });
    up.isFitLabels2Nodes.subscribe(x => { this._cyService.fitLabel2Node(); });
    up.dataPageSize.subscribe(x => { this.dataPageSizeChanged(x); });
    up.tableColumnLimit.subscribe(x => { this.tableColumnLimitChanged(x); });
    up.highlightWidth.subscribe(x => { this.changeHighlightWidth(x); });
    up.compoundPadding.subscribe(x => { this.changeCompoundPadding(x); });

    up_t.isEnabled.subscribe(x => this.isEnableTimebar(x));
    up_t.isHideDisconnectedNodesOnAnim.subscribe(x => { tb.setisHideDisconnectedNodes(x); });
    up_t.isMaintainGraphRange.subscribe(x => { tb.setIsMaintainGraphRange(x) });
    up_t.playingStep.subscribe(x => { tb.changeStep(x); });
    up_t.playingPeriod.subscribe(x => { tb.changePeriod(x); });
    up_t.zoomingStep.subscribe(x => { tb.changeZoomStep(x); });
    up_t.graphInclusionType.subscribe(x => { tb.changeGraphInclusionType(x); });
    up_t.statsInclusionType.subscribe(x => { tb.changeStatsInclusionType(x); });
  }

  isEnableTimebar(x: boolean) {
    this._cyService.showHideTimebar(x);
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
}