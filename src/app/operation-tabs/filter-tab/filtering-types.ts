export interface iClassOption {
  text: string;
  isDisabled: boolean;
}

export interface iClassBasedRules {
  className: string;
  rules: iRule[];
  isEdge: boolean;
}

export enum PropertyCategory {
  other = 0, date = 1, finiteSet = 2
}

export enum CqlType {
  std = 0, table = 1, count = 2
}

export interface iRule {
  propertyOperand?: string;
  propertyType?: string;
  operator?: string;
  inputOperand?: string;
  ruleOperator?: string;
  rawInput?: string;
  category: PropertyCategory;
}

export interface iRuleSync {
  properties: string[];
  isGenericTypeSelected: boolean;
  selectedClass: string;
}

// 2 type of metric exists: sum or count. 
// Sum: sums the property value without conditions
// Count: counts the elements which satisfy the conditional expressions
export interface iTimebarMetric {
  incrementFn: (x: any) => number;
  rules: iRule[];
  name: string;
  className: string;
  isEdge?: boolean;
  isEditing?: boolean;
  color?: string;
}

export interface iTimebarUnitData {
  isBegin: boolean;
  d: number;
  id: string;
}

export interface iTimebarItem {
  start: number;
  end: number;
  cyElem: any;
}