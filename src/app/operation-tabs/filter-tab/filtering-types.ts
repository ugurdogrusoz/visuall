export interface ClassOption {
  text: string;
  isDisabled: boolean;
}

export interface ClassBasedRules {
  className: string;
  rules: Rule[];
  isEdge: boolean;
}

export interface Rule {
  propertyOperand: string;
  propertyType: string;
  operator: string;
  inputOperand: string;
  ruleOperator: string;
  rawInput: string;
}