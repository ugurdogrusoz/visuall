import { BehaviorSubject } from 'rxjs';

export interface UserPref {
  // boolean settings
  isAutoIncrementalLayoutOnChange: BehaviorSubject<boolean>;
  isHighlightOnHover: BehaviorSubject<boolean>;
  isShowOverviewWindow: BehaviorSubject<boolean>;
  isShowEdgeLabels: BehaviorSubject<boolean>;
  isFitLabels2Nodes: BehaviorSubject<boolean>;
  isIgnoreCaseInText: BehaviorSubject<boolean>;
  isOnlyHighlight4LatestQuery: BehaviorSubject<boolean>;

  // Show query results using 'Selection', 'Highlight'
  mergedElemIndicator: BehaviorSubject<MergedElemIndicatorTypes>;
  dataPageSize: BehaviorSubject<number>;
  queryHistoryLimit: BehaviorSubject<number>;
  tableColumnLimit: BehaviorSubject<number>;
  highlightWidth: BehaviorSubject<number>;
  highlightColor: BehaviorSubject<string>;
  compoundPadding: BehaviorSubject<string>;

  timebar: {
    isEnabled: BehaviorSubject<boolean>;
    isHideDisconnectedNodesOnAnim: BehaviorSubject<boolean>;
    isMaintainGraphRange: BehaviorSubject<boolean>
    playingStep: BehaviorSubject<number>;
    playingPeriod: BehaviorSubject<number>;
    zoomingStep: BehaviorSubject<number>;
    graphInclusionType: BehaviorSubject<TimebarGraphInclusionTypes>;
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
  selection = 0, highlight = 1
}

export interface BoolSetting {
  isEnable: boolean;
  text: string;
  path2userPref: string;
}