import { ClassBasedRules } from '../operation-tabs/filter-tab/filtering-types';

export interface DbService {
  getNeighbors(elemId: string, callback: (x: GraphResponse) => any);
  getSampleData(callback: (x: GraphResponse) => any);
  getAllData(callback: (x: GraphResponse) => any);
  getFilteringResult(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any);
}

export interface GraphResponse {
  nodes: CyElem[];
  edges: CyElem[];
}

export interface CyElem {
  id: string;
}

export interface TableResponse {
  columns: string[];
  data: any[][];
}

export enum DbQueryType {
  std = 0, table = 1, count = 2
} 