export interface ClassOption {
  text: string;
  isDisabled: boolean;
}

export interface ClassBasedRules {
  className: string;
  rules: Rule[];
  isEdge: boolean;
}

export enum PropertyCategory {
  other = 0, date = 1, finiteSet = 2
}

export enum CqlType {
  std = 0, table = 1, count = 2
}

export interface Rule {
  propertyOperand?: string;
  propertyType?: string;
  operator?: string;
  inputOperand?: string;
  ruleOperator?: string;
  rawInput?: string;
}

export interface RuleSync {
  properties: string[];
  isGenericTypeSelected: boolean;
  selectedClass: string;
}

// 2 type of metric exists: sum or count. 
// Sum: sums the property value without conditions
// Count: counts the elements which satisfy the conditional expressions
export interface TimebarMetric {
  incrementFn: (x: any) => number;
  rules: Rule[];
  name: string;
  className: string;
  isEdge?: boolean;
  isEditing?: boolean;
  color?: string;
}

export interface TimebarUnitData {
  isBegin: boolean;
  d: number;
  id: string;
}

export interface TimebarItem {
  start: number;
  end: number;
  cyElem: any;
}