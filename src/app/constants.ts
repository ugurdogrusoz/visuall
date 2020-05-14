export const HIGHLIGHT_OPACITY = 0.15;
// it is more reasonable to make HIGHLIGHT_ANIM_DUR * 2 < HIGHLIGHT_WAIT_DUR
export const HIGHLIGHT_ANIM_DUR = 400;
export const HIGHLIGHT_WAIT_DUR = 1500;
export const EV_MOUSE_ON = 'mouseover';
export const EV_MOUSE_OFF = 'mouseout';
export const DATE_PROP_START = 'start_time';
export const DATE_PROP_END = 'end_time';
export const MIN_DATE = -59011466152000; // Fri Jan 01 0100 00:00:00 GMT+0155
export const MAX_DATE = 32503669200000;  // Wed Jan 01 3000 00:00:00 GMT+0300
export const CY_BATCH_END_DELAY = 100;
export const OBJ_INFO_UPDATE_DELAY = 200;

export const COMPOUND_ELEM_EDGE_CLASS = 'cy-expand-collapse-collapsed-edge'; // defined in expand-collapse extension
export const CY_NAVI_POSITION_WAIT_DUR = 500;
export const FILTER_CLASS_HIDE = 'filter-class-disabled';
export const MAX_HIGHTLIGHT_WIDTH = 20;
export const MIN_HIGHTLIGHT_WIDTH = 1;
export const MAX_DATA_PAGE_SIZE = 10000;
export const MIN_DATA_PAGE_SIZE = 1;
export const EXPAND_COLLAPSE_CUE_SIZE = 12;
export const MAX_TABLE_COLUMN_COUNT = 100;
export const MIN_TABLE_COLUMN_COUNT = 1;
export const HIDE_EMPTY_TIMEBAR_DELAY = 1000;
export const CSS_SM_TEXT_SIZE = 11;
export const CSS_FONT_NAME = 'Arial';

export const GENERIC_TYPE = {
  ANY_CLASS: 'Any Object',
  NOT_SELECTED: '───',
  NODES_CLASS: 'Any Node',
  EDGES_CLASS: 'Any Edge'
};

export const HIGHLIGHTED_NODE_1 = {
  'border-color': '#0B9BCD',  //blue
  'border-width': 4.5
};
export const HIGHLIGHTED_NODE_2 = {
  'border-color': '#04F06A',  //green
  'border-width': 4.5
};
export const HIGHLIGHTED_NODE_3 = {
  'border-color': '#F5E663',   //yellow
  'border-width': 4.5
};
export const HIGHLIGHTED_NODE_4 = {
  'border-color': '#BF0603',    //red
  'border-width': 4.5
};

export const HIGHLIGHTED_EDGE_1 = {
  'line-color': '#0B9BCD',    //blue
  'target-arrow-color': '#0B9BCD',
  'width': 4.5
};
export const HIGHLIGHTED_EDGE_2 = {
  'line-color': '#04F06A',   //green
  'target-arrow-color': '#04F06A',
  'width': 4.5
};
export const HIGHLIGHTED_EDGE_3 = {
  'line-color': '#F5E663',    //yellow
  'target-arrow-color': '#F5E663',
  'width': 4.5
};
export const HIGHLIGHTED_EDGE_4 = {
  'line-color': '#BF0603',    //red
  'target-arrow-color': '#BF0603',
  'width': 4.5
};

export const MAX_HIGHLIGHT_CNT = 12;

export const NUMBER_OPERATORS = {
  '=': '=',
  '\u2260': '<>',
  '<': '<',
  '>': '>',
  '\u2264': '<=',
  '\u2265': '>=',
  'one of': 'One of'
};

export const DATETIME_OPERATORS = {
  '=': '=',
  '\u2260': '<>',
  '<': '<',
  '>': '>',
  '\u2264': '<=',
  '\u2265': '>='
};

export const ENUM_OPERATORS = {
  '=': '=',
  '\u2260': '<>'
};

export const TEXT_OPERATORS = {
  'equal to': '=',
  'contains': 'Contains',
  'starts with': 'Starts with',
  'ends with': 'Ends with',
  'one of': 'One of'
};
export const LIST_OPERATORS = {
  'in': 'In'
};

export const NEO4J_2_JS_NUMBER_OPERATORS = {
  '=': '===',
  '<>': '!==',
  '<': '<',
  '>': '>',
  '<=': '<=',
  '>=': '>='
};

export const NEO4J_2_JS_STR_OPERATORS = {
  'Contains': 'includes',
  'Starts with': 'startsWith',
  'Ends with': 'endsWith'
};

export const TIME_UNITS = {
  'century': 3153600000000,
  'decade': 315360000000,
  'year': 31536000000,
  'quarter': 7884000000,
  'month': 2592000000,
  'week': 604800000,
  'day': 86400000,
  'hour': 3600000,
  '5min': 300000,
  'minute': 60000,
  '5sec': 5000,
  'second': 1000,
  '50ms': 50,
  'ms': 1
};

export const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait: number, immediate: boolean = false) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// calls fn2 at the beginning of frequent calls to fn1
export function debounce2(fn1: Function, wait: number, fn2: Function) {
  let timeout;
  let isInit = true;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      fn1.apply(context, args);
      isInit = true;
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (isInit) {
      fn2.apply(context, args);
      isInit = false;
    }
  };
}

// objects is an array of objects, types is an array of strings
// get propperty names of types. If types does not exists get all
export function getPropNamesFromObj(objects, types) {
  let s1 = new Set<string>();

  for (const obj of objects) {
    for (const [, value] of Object.entries(obj)) {
      for (const [k2, v2] of Object.entries(value)) {
        if (!types) {
          s1.add(k2);
        } else if (types.includes(v2)) {
          s1.add(k2);
        }
      }
    }
  }
  return s1;
}

// return union of 2 sets
export function union(setA, setB) {
  let _union = new Set(setA);
  for (let elem of setB) {
    _union.add(elem);
  }
  return _union;
}

// is a2 subset of a1
// a1, a2 are arrays of primitive types
export function isSubset(a1, a2) {
  let superSet = {};
  for (let i = 0; i < a1.length; i++) {
    const e = a1[i] + typeof a1[i];
    superSet[e] = true;
  }

  for (let i = 0; i < a2.length; i++) {
    const e = a2[i] + typeof a2[i];
    if (!superSet[e]) {
      return false;
    }
  }
  return true;
}

export function isClose(a1: number, a2: number, margin = 1000) {
  return Math.abs(a1 - a2) < margin;
}

export function findTypeOfAttribute(attribute, nodeProps, edgeProps): string {

  for (const nodeClass in nodeProps) {
    if (nodeProps[nodeClass].hasOwnProperty(attribute))
      return nodeProps[nodeClass][attribute];
  }
  for (const edgeClass in edgeProps) {
    if (edgeProps[edgeClass].hasOwnProperty(attribute))
      return edgeProps[edgeClass][attribute];
  }
}

export function expandCollapseCuePosition(node) {
  const zoom = node._private.cy.zoom();
  let smallness = 1 - node.renderedWidth() / (node._private.cy.width());
  if (smallness < 0) {
    smallness = 0;
  }
  // cue size / 2
  const rectSize = EXPAND_COLLAPSE_CUE_SIZE / 2;
  const offset = parseFloat(node.css('border-width')) + rectSize;
  let size = zoom < 1 ? rectSize / zoom : rectSize;
  let add = offset * smallness + size;
  const x = node.position('x') - node.width() / 2 - parseFloat(node.css('padding-left')) + add;
  const y = node.position('y') - node.height() / 2 - parseFloat(node.css('padding-top')) + add;
  return { x: x, y: y };
}

export function areSetsEqual(s1: Set<any>, s2: Set<any>) {
  if (!s1 || !s2) {
    return false;
  }
  for (let i of s1) {
    if (!s2.has(i)) {
      return false;
    }
  }

  for (let i of s2) {
    if (!s1.has(i)) {
      return false;
    }
  }
  return true;
}

export function compareUsingOperator(a: any, b: any, op: string) {
  op = op.toLowerCase();
  switch (op) {
    case '=':
      return a === b;
    case '<>':
      return a !== b;
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '<=':
      return a <= b;
    case 'contains':
    case 'in':
      return a.includes(b);
    case 'starts with':
      return a.startsWith(b);
    case 'ends with':
      return a.endsWith(b);
    default:
      return false;
  }
}

export function isNumber(value: string | number): boolean {
  return ((value != null) && !isNaN(Number(value.toString())));
}

export function isPrimitiveType(o) {
  const t = typeof o;
  return t == 'string' || t == 'number' || t == 'boolean';
}

export function extend(a, b) {
  if (a == undefined || a == null) {
    a = {};
  }

  for (let key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }

  return a;
}

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach(k => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};

export function readTxtFile(file: File, cb: (s: string) => void) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    try {
      cb(fileReader.result as string);
    } catch (error) {
      console.error('Given file is not suitable.', error);
    }
  };
  fileReader.onerror = (error) => {
    console.error('File could not be read!', error);
    fileReader.abort();
  };
  fileReader.readAsText(file);
}

export function arrayDiff(smallArr: string[], bigArr: string[]): string[] {
  let diff: string[] = [];
  let d = {};
  for (let i = 0; i < smallArr.length; i++) {
    d[smallArr[i]] = true;
  }

  for (let i = 0; i < bigArr.length; i++) {
    if (!d[bigArr[i]]) {
      diff.push(bigArr[i]);
    }
  }
  return diff;
}