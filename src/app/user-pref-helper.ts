import { CytoscapeService } from './cytoscape.service';
import { TimebarService } from './timebar.service';
import { GlobalVariableService } from './global-variable.service';
import { MAX_DATA_PAGE_SIZE, MIN_DATA_PAGE_SIZE, MAX_TABLE_COLUMN_COUNT, MIN_TABLE_COLUMN_COUNT } from './constants';
import { UserProfileService } from './user-profile.service';

export class UserPrefHelper {
  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _g: GlobalVariableService, private _profile: UserProfileService) {
  }

  listen4UserPref() {
    this._g.isUserPrefReady.subscribe(isReady => {
      if (!isReady) {
        return;
      }
      this.loadPrefFromLocalStorage();
      // bind view utilities after UserPreferences are finalized
      this._cyService.bindViewUtilitiesExtension();

      const up = this._g.userPrefs;
      const upT = this._g.userPrefs.timebar;
      const tb = this._timebarService;

      up.isAutoIncrementalLayoutOnChange.subscribe(x => { this.changeAutoIncremental(x); });
      up.isHighlightOnHover.subscribe(x => { this._cyService.highlighterCheckBoxClicked(x); });
      up.isShowOverviewWindow.subscribe(x => { this._cyService.navigatorCheckBoxClicked(x); });
      up.isShowEdgeLabels.subscribe(() => { this._cyService.showHideEdgeLabels(); });
      up.nodeLabelWrap.subscribe(() => { this._cyService.fitLabel2Node(); });
      up.dataPageSize.subscribe(x => { this.dataPageSizeChanged(x); });
      up.tableColumnLimit.subscribe(x => { this.tableColumnLimitChanged(x); });
      up.compoundPadding.subscribe(x => { this.changeCompoundPadding(x); });

      upT.isEnabled.subscribe(x => this.isEnableTimebar(x));
      upT.isHideDisconnectedNodesOnAnim.subscribe(x => { tb.setisHideDisconnectedNodes(x); });
      upT.isMaintainGraphRange.subscribe(x => { tb.setIsMaintainGraphRange(x) });
      upT.playingStep.subscribe(x => { tb.changeStep(x); });
      upT.playingPeriod.subscribe(x => { tb.changePeriod(x); });
      upT.zoomingStep.subscribe(x => { tb.changeZoomStep(x); });
      upT.graphInclusionType.subscribe(x => { tb.changeGraphInclusionType(x); });
      upT.statsInclusionType.subscribe(x => { tb.changeStatsInclusionType(x); });
    });
  }

  isEnableTimebar(x: boolean) {
    this._cyService.showHideTimebar(x);
  }

  changeAutoIncremental(x: boolean) {
    if (x) {
      this._g.expandCollapseApi.setOption('layoutBy', this._g.getFcoseOptions());
      this._g.expandCollapseApi.setOption('fisheye', true);
      this._g.expandCollapseApi.setOption('animate', true);
    } else {
      this._g.expandCollapseApi.setOption('layoutBy', null);
      this._g.expandCollapseApi.setOption('fisheye', false);
      this._g.expandCollapseApi.setOption('animate', false);
    }
  }

  changeCompoundPadding(x: string) {
    this._g.cy.style().selector(':compound')
      .style({ padding: x })
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

  private loadPrefFromLocalStorage() {
    if (this._profile.isStoreProfile()) {
      this._profile.transferUserPrefs();
    }
    this._profile.transferIsStoreUserProfile();
  }
}