import { TimebarItem, Stat, Settings, ChartElements } from "./data-type";
import { GoogleChartClient } from "./GoogleChartClient";
import { Timebar } from "./Timebar";
export declare class PrivateTimebar {
    cyElemChangeHandler: Function;
    windowResizer: any;
    statsRange1: number;
    statsRange2: number;
    items: TimebarItem[];
    minDate: number;
    maxDate: number;
    graphDates: number[];
    cursorPos: number;
    sampleCount: number;
    playTimerId: number;
    readonly IDEAL_SAMPLE_CNT: number;
    readonly MIN_ZOOM_RANGE: number;
    currTimeUnit: number;
    selectedTimeUnit: string;
    beginPropertyName: string;
    endPropertyName: string;
    setStatsRangeStrFn: () => void;
    setGraphRangeStrFn: () => void;
    readonly GRAPH_RANGE_RATIO_MIN = 0.2;
    readonly GRAPH_RANGE_RATIO_MAX = 0.8;
    readonly ELEM_CHANGE_DEBOUNCE = 200;
    ignoreEndNodesForEdgeInclusion: boolean;
    cy: any;
    dataMapping: any;
    settings: Settings;
    zoomFn: any;
    chartClient: GoogleChartClient;
    isChartClientReady: boolean;
    api: Timebar;
    htmlElem: ChartElements;
    /**
     * @param  {any} cy - ignore this, it will be injected automatically
     * @param  {ChartElements} htmlElem - { chartElemId: string, controllerElemId: string}
     * @param  {any} dataMapping - which features should be used to represent time
     * @param  {Settings} settings - some settings to be used. Leave empty to use defaults
     * @param  {Events} events - functions which will be called later. Leave empty to use defaults
     * @param  {Stat[]} stats - calculations, color and text. Leave empty to use defaults
     * @constructor
     */
    constructor(cy: any, dataMapping: any, htmlElem: ChartElements, settings: Settings, api: Timebar);
    cyElemListChanged(): void;
    drawEmptyData(): void;
    getStatsForRange(start: number, end: number): number[];
    count4Collapsed(item: TimebarItem, stat: Stat, cnts: number[], cntIdx: number, timeFilterFn: (x: any) => boolean, hasCollapsed: (x: TimebarItem) => any): void;
    getTimeRange(cyElem: any): any[];
    getTimeFilteredGraphElems(start: number, end: number): any;
    putStatDataForRange(s: number, e: number, data4arr: number, arr: any[]): void;
    getVisibleRange(): number[];
    bindEventListeners(): void;
    unbindEventListeners(): void;
    bindCommands(): void;
    addChartListener(): void;
    removeChartListener(): void;
    unbindCommands(): void;
    prepareChartData(minDate: number, maxDate: number): void;
    prepareData3(): void;
    quantizeDateRange(d1: number, d2: number, cnt: number): number;
    setTicksForBarChart(): void;
    getQuantizedTime(d: number, isGreater: boolean): Date;
    getTickStrForDate(d: Date): string;
    getToolTippedData(rangeStart: number, cnts: number[]): any[];
    setStatsRangeByRatio(): void;
    setGraphRangeByRatio(prevStatsRange1: number, prevStatsRange2: number, isOnMax: boolean): void;
    setGraphRangeByStatsRange(r1: number, r2: number): void;
    resetStatsRange(): void;
    stopPlayTimer(callback: (isShowPlay: boolean) => void): void;
    rangeChange(isSetCursorPos?: boolean): void;
    /** used for rendering chart from existing data
     */
    renderChart(): void;
    /** activate/deactivate timebar
     * @param  {boolean} isActive
     */
    setIsEnabled(isActive: boolean): void;
    /** whether to hide or show disconnected nodes
     * @param  {boolean} val
     */
    setIsHideDisconnectedNodesOnAnim(val: boolean): void;
    /** whether to call `cyElemListChanged` on element added or removed
     * @param  {boolean} val
     */
    setIsIgnoreElemChanges(val: boolean): void;
    /** when a new data is added, whether change current graph range
     * @param  {boolean} v
     */
    setIsMaintainGraphRange(v: boolean): void;
    /** speed of animation
     * @param  {number} newSpeed
     */
    setPlayingPeriod(newSpeed: number): void;
    /** should be in range [0,100]
     * @param  {number} n
     */
    setZoomingStep(n: number): void;
    /** step size used in animation
     * @param  {number} newStep
     */
    setPlayingStep(newStep: number): void;
    /** used whether to show an element in the graph or not
     * @param  {number} i
     */
    setGraphInclusionType(i: number): void;
    /** used in calculations of statistics
     * @param  {number} i
     */
    setStatsInclusionType(i: number): void;
    /** set minimum possible date time on timebar
     * @param  {number} v
     */
    setGlobalRangeMin(v: number): void;
    /** set maximum possible date time on timebar
     * @param  {number} v
     */
    setGlobalRangeMax(v: number): void;
    /** set ratio of graph range to stats range
     * @param  {number} v
     */
    setGraphRangeRatio(v: number): void;
    /** set default begin date time
     * @param  {number} v
     */
    setDefaultBeginDate(v: number): void;
    /** set default end date time
     * @param  {number} v
     */
    setDefaultEndDate(v: number): void;
}
