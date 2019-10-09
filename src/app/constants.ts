export const HIGHLIGHT_OPACITY = 0.3;
// it is more reasonable to make HIGHLIGHT_ANIM_DUR * 2 < HIGHLIGHT_WAIT_DUR
export const HIGHLIGHT_ANIM_DUR = 400;
export const HIGHLIGHT_WAIT_DUR = 1500;
export const DATA_PAGE_SIZE = 15;

export const EV_MOUSE_ON = 'mouseover';
export const EV_MOUSE_OFF = 'mouseout';
export const DATE_PROP_START = 'start_time';
export const DATE_PROP_END = 'end_time';
export const SAMPLE_DATA_CQL = 'match (n)-[e]-() return n,e limit 33';
export const GET_ALL_CQL = 'match (n) return n UNION match ()-[e]-() return distinct e as n';
export const MIN_DATE = -59011466152000; // Fri Jan 01 0100 00:00:00 GMT+0155
export const MAX_DATE = 32503669200000;  // Wed Jan 01 3000 00:00:00 GMT+0300

export const CQL_PARAM0 = 'PARAM0';
export const GET_NEIGHBORS = `match (n)-[e]-(n2) where ID(n) = ${CQL_PARAM0} return n,n2,e`;

export const CY_NAVI_POSITION_WAIT_DUR = 500;
export const FILTER_CLASS_HIDE = 'filter-class-disabled';
export const HIGHLIGHT_TYPE = 'highlighted3';
export const HIGHLIGHT_TYPE_MERGE = 'highlighted';
export const MAX_HIGHTLIGHT_WIDTH = 20;
export const MIN_HIGHTLIGHT_WIDTH = 1;
export const EXPAND_COLLAPSE_CUE_SIZE = 12;

export const CSS_SM_TEXT_SIZE = 11;
export const CSS_FONT_NAME = 'Arial';

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

export const NUMBER_OPERATORS = {
  '=': '=',
  '\u2260': '<>',
  '<': '<',
  '>': '>',
  '\u2264': '<=',
  '\u2265': '>='
};
export const TEXT_OPERATORS = {
  'equal to': '=',
  'contains': 'Contains',
  'starts with': 'Starts with',
  'ends with': 'Ends with'
};
export const LIST_OPERATORS = {
  'in': 'In'
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
export function debounce(func, wait, immediate) {
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
  var _union = new Set(setA);
  for (var elem of setB) {
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

export function findTypeOfAttribute(attribute, nodeProps, edgeProps) {

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