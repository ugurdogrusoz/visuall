export interface Stat {
    incrementFn: (x: any) => number;
    name: string;
    color?: string;
}
export interface TimebarItem {
    start: number;
    end: number;
    cyElem: any;
}
export declare enum TimebarGraphInclusionTypes {
    overlaps = 0,
    contains = 1,
    contained_by = 2
}
export declare enum TimebarStatsInclusionTypes {
    all = 0,
    begin = 1,
    middle = 2,
    end = 3
}
export interface Settings {
    isEnabled: boolean;
    graphInclusionType: TimebarGraphInclusionTypes;
    statsInclusionType: TimebarStatsInclusionTypes;
    playingStep: number;
    playingPeriod: number;
    zoomingStep: number;
    isHideDisconnectedNodesOnAnim: boolean;
    isMaintainGraphRange: boolean;
    globalRangeMin: number;
    globalRangeMax: number;
    events: Events;
    stats: Stat[];
}
export interface Events {
    maintainFiltering: (elems: any) => any;
    showOnlyElems: (elems: any) => void;
    chartRendered: () => void;
    statsRangeChanged: (s: number, e: number) => void;
    graphRangeChanged: (s: number, e: number) => void;
}
export interface ChartElements {
    chartElemId: string;
    controllerElemId: string;
}
