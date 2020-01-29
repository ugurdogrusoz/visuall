export declare const CSS_SM_TEXT_SIZE = 11;
export declare const CSS_FONT_NAME = "Arial";
export declare const MONTHS: string[];
export declare const SHORT_MONTHS: string[];
export declare const TIME_UNITS: {
    'century': number;
    'decade': number;
    'year': number;
    'quarter': number;
    'month': number;
    'week': number;
    'day': number;
    'hour': number;
    '5min': number;
    'minute': number;
    '5sec': number;
    'second': number;
    '50ms': number;
    'ms': number;
};
/**
 * @param  {number} a1 a datetime in milliseconds
 * @param  {number} a2 a datetime in milliseconds
 * @param  {number=1000} margin
 */
export declare function isCloseMS(a1: number, a2: number, margin?: number): boolean;
export declare const MIN_DATE = -59011466152000;
export declare const MAX_DATE = 32503669200000;
export declare const MIN_SAMPLE_CNT = 10;
export declare function debounce(func: any, wait: any, immediate: any): () => void;
export declare function extendObj(o1: any, o2: any): any;
