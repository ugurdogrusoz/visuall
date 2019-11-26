export interface iClassOption {
  text: string;
  isDisabled: boolean;
}

export interface iClassBasedRules {
  className: string;
  rules: iRule[];
  isEdge: boolean;
}

export interface iRule {
  propertyOperand: string;
  propertyType: string;
  operator: string;
  inputOperand: string;
  ruleOperator: string;
  rawInput: string;
}

// 2 type of metric exists: sum or count. 
// Sum: sums the property value without conditions
// Count: counts the elements which satisfy the conditional expressions
export interface iTimebarMetric {
  incrementFn: (x: any) => number;
  rules: iMetricCondition[];
  name: string;
  className: string;
  isEdge?: boolean;
  isEditing?: boolean;
  color?: string;
}

export interface iMetricCondition {
  propertyOperand?: string;
  propertyType?: string;
  operator?: string;
  inputOperand?: string;
  ruleOperator?: string;
  rawInput?: string;
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