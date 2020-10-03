import { BehaviorSubject } from 'rxjs';
import { QueryRule, TimebarMetric } from './operation-tabs/map-tab/query-types';

export interface UserPref {
  // boolean settings
  isAutoIncrementalLayoutOnChange: BehaviorSubject<boolean>;
  isHighlightOnHover: BehaviorSubject<boolean>;
  isShowOverviewWindow: BehaviorSubject<boolean>;
  isShowEdgeLabels: BehaviorSubject<boolean>;
  isIgnoreCaseInText: BehaviorSubject<boolean>;
  isOnlyHighlight4LatestQuery: BehaviorSubject<boolean>;
  isStoreUserProfile: BehaviorSubject<boolean>;
  isCollapseEdgesBasedOnType: BehaviorSubject<boolean>;
  isCollapseMultiEdgesOnLoad: BehaviorSubject<boolean>;

  // Show query results using 'Selection', 'Highlight'
  mergedElemIndicator: BehaviorSubject<MergedElemIndicatorTypes>;
  groupingOption: BehaviorSubject<GroupingOptionTypes>;
  nodeLabelWrap: BehaviorSubject<TextWrapTypes>;
  isLimitDbQueries2range: BehaviorSubject<boolean>;
  dbQueryTimeRange: { start: BehaviorSubject<number>, end: BehaviorSubject<number> },
  dataPageSize: BehaviorSubject<number>;
  queryHistoryLimit: BehaviorSubject<number>;
  tableColumnLimit: BehaviorSubject<number>;
  highlightStyles: { wid: BehaviorSubject<number>, color: BehaviorSubject<string> }[];
  currHighlightIdx: BehaviorSubject<number>;
  compoundPadding: BehaviorSubject<string>;
  edgeCollapseLimit: BehaviorSubject<number>;
  objectInclusionType: BehaviorSubject<TimebarGraphInclusionTypes>;
  selectionColor: BehaviorSubject<string>;
  selectionWidth: BehaviorSubject<number>;


  timebar: {
    isEnabled: BehaviorSubject<boolean>;
    isHideDisconnectedNodesOnAnim: BehaviorSubject<boolean>;
    isMaintainGraphRange: BehaviorSubject<boolean>
    playingStep: BehaviorSubject<number>;
    playingPeriod: BehaviorSubject<number>;
    zoomingStep: BehaviorSubject<number>;
    statsInclusionType: BehaviorSubject<TimebarStatsInclusionTypes>;
  }
}

export enum TimebarGraphInclusionTypes {
  overlaps = 0, contains = 1, contained_by = 2
}

export enum TimebarStatsInclusionTypes {
  all = 0, begin = 1, middle = 2, end = 3
}

export enum MergedElemIndicatorTypes {
  none = 0, selection = 1, highlight = 2
}

export enum GroupingOptionTypes {
  compound = 0, clusterId = 1
}

export enum TextWrapTypes {
  none = 0, wrap = 1, ellipsis = 2
}

export interface BoolSetting {
  isEnable: boolean;
  text: string;
  path2userPref: string;
}

export interface UserProfile {
  queryRules: QueryRule[];
  timebarMetrics: TimebarMetric[];
  userPref: any;
}
