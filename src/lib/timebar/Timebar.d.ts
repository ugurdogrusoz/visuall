import { Stat, Settings, ChartElements } from "./data-type";
import { PrivateTimebar } from './PrivateTimebar';
export declare class Timebar {
    _: PrivateTimebar;
    /**
     *Creates an instance of Timebar, e.g. let tb = Timebar(mapping, { chartElemId: 'chart_div', controllerElemId: 'filter_div' });
     * @param {*} cy ignore this, it will be injected automatically
     * @param {*} dataMapping which properties should be used as begin, end datetimes
     * @param {ChartElements} htmlElem { chartElemId (to display upper chart), controllerElemId (to display lower chart)}
     * @param {Settings} settings settings to be used. Leave empty to use defaults
     * @memberof Timebar
     */
    constructor(cy: any, dataMapping: any, htmlElem: ChartElements, settings: Settings);
    /**
     * @param  {boolean} isIncrease - set true to zoom in, false for zoom out
     */
    changeZoom(isIncrease: boolean): void;
    /** get graph range start and end values
     * @returns number[]
     */
    getGraphRange(): number[];
    /** set graph range start and end values
     * @param  {number} start
     * @param  {number} end
     */
    setGraphRange(start: number, end: number): void;
    /** move graph range to right or left. Size of movement is determined with setting `playingStep`. It is defined as (graph range) * (playingStep/100)
     * @param  {boolean} isLeft
     */
    moveCursor(isLeft: boolean): boolean;
    /** sets graph range to data range (range of all data both visible and hidden).
     */
    coverAllTimes(): void;
    /** sets graph range values to the minimum and maximum dates in visible data.
     */
    coverVisibleRange(): void;
    /** show the graph as graph range moves forward. Stops when reaching end of data range
     * @param  {(isPlaying:boolean)=>void} callback - callback will be fired with false if it stopped playing
     */
    playTiming(callback: (isPlaying: boolean) => void): void;
    /** update the event listeners
     * @param  {string} event - must be one of the predefined names of the events
     * @param  {any} fn - the function that will be called
     */
    setEventListener(event: string, fn: any): void;
    /** size of time unit currently used in milliseconds
     * @returns number
     */
    getCurrTimeUnit(): number;
    /** returns (graph range) / (stats range)
     * @returns number
     */
    getGraphRangeRatio(): number;
    /** set colors for stats
     * @param  {string[]} colors an array of strings
     */
    setStatsColors(colors: string[]): void;
    /** Each metric (stat) should contain a function named `incrementFn`. This function takes a Cytoscape.js element as a parameter and returns an integer.
     * For example, if your statistic is to count the number of highly-rated movies, you should check for the rating of the movie and if it is greater than a threshold,
     * return 1 else return 0. Another example statistic might be the sum of movie ratings. In this case, you can return the rating value of a movie.
     * The parameter passed to `incrementFn` could be any Cytoscape.js element. So you should check type/class of the parameter element.
     * The other properties of a stat are color and name. These are used for visualization.
     * @param  {Stat[]} m
     */
    setStats(m: Stat[]): void;
    /** Set a setting to a particular value e.g. setSetting('graphInclusionType', 1);
     * @param  {string} name
     * @param  {number|boolean} value
     */
    setSetting(name: string, value: number | boolean): void;
}
