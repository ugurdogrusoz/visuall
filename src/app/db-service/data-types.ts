import { ClassBasedRules } from '../operation-tabs/map-tab/query-types';
import { TableFiltering } from '../table-view/table-view-types';

export interface DbService {
  getNeighbors(elemIds: string[], callback: (x: GraphResponse) => any);
  getSampleData(callback: (x: GraphResponse) => any);
  getFilteringResult(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any);
  filterTable(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any);
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

export interface GraphHistoryItem {
  expo: string;
  base64png: string;
  json: any;
}

export interface HistoryMetaData {
  labels?: string;
  isNode?: boolean;
  customTxt?: string;
}

export interface DbQueryMeta {
  edgeType?: string | string[];
  targetType?: string;
  depth?: number;
  isEdgeQuery?: boolean;
}