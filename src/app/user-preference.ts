import { BehaviorSubject } from 'rxjs';

export interface UserPref {
  // boolean settings
  isAutoIncrementalLayoutOnChange: BehaviorSubject<boolean>;
  isHighlightOnHover: BehaviorSubject<boolean>;
  isShowOverviewWindow: BehaviorSubject<boolean>;
  isShowEdgeLabels: BehaviorSubject<boolean>;
  isFitLabels2Nodes: BehaviorSubject<boolean>;
  isIgnoreCaseInText: BehaviorSubject<boolean>;

  // numeric settings
  dataPageSize: BehaviorSubject<number>;
  tableColumnLimit: BehaviorSubject<number>;
  highlightWidth: BehaviorSubject<number>;

  // string settings
  compoundPadding: BehaviorSubject<string>;

  // multiple choice settings
  mergedElemIndicator: BehaviorSubject<MergedElemIndicatorTypes>;

  timebar: {
    isEnabled: BehaviorSubject<boolean>;
    graphInclusionType: BehaviorSubject<TimebarGraphInclusionTypes>;
    statsInclusionType: BehaviorSubject<TimebarStatsInclusionTypes>;
    playingStep: BehaviorSubject<number>;
    playingPeriod: BehaviorSubject<number>;
    zoomingStep: BehaviorSubject<number>;
    isHideDisconnectedNodesOnAnim: BehaviorSubject<boolean>;
    isMaintainGraphRange: BehaviorSubject<boolean>
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
  actuator: any;
  fn: string;
  isElemStyleSetting?: boolean;
}