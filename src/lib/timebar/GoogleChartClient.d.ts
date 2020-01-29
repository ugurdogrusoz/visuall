import { ChartElements } from "./data-type";
export declare class GoogleChartClient {
    colors: string[];
    private textStyle;
    private dashboard;
    private chartWrapper;
    private controlWrapper;
    private rangeChange;
    private isReady;
    private htmlElem;
    private googleEvent;
    constructor(rangeChange: (b1?: boolean, b2?: boolean) => void, htmlElem: ChartElements, colors: string[]);
    load(callback: Function): void;
    private initChart;
    setControllerRange(start: number, end: number, isDraw?: boolean): number;
    getControllerRange(): number[];
    setTicksForBarChart(ticks: any): void;
    setColors(): void;
    drawDashboard(arr: any[]): void;
    drawControl(): void;
    removeListener(): void;
    addListener(): void;
}
