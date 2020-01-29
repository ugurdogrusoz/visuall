export declare const SETTINGS: {
    isEnabled: boolean;
    playingStep: number;
    playingPeriod: number;
    zoomingStep: number;
    graphInclusionType: number;
    statsInclusionType: number;
    isHideDisconnectedNodesOnAnim: boolean;
    globalRangeMin: number;
    globalRangeMax: number;
    isMaintainGraphRange: boolean;
};
export declare const METRICS: {
    name: string;
    incrementFn: (x: any) => 1 | 0;
    color: string;
}[];
export declare const EVENTS: {
    maintainFiltering: (elems: any) => any;
    showOnlyElems: (elems: any, isRandomize: any) => void;
    chartRendered: () => void;
    statsRangeChanged: () => void;
    graphRangeChanged: () => void;
};
