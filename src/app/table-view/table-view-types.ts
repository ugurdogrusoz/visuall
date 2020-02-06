
export enum TableDataType {
  string = 0, number = 1, datetime = 2, enum = 3
}

export interface TableData {
  val: any;
  type: TableDataType;
}

export interface TableViewInput {
  // first property of every result must be ID
  results: TableData[][];
  columns: string[];
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  currPage: number;
  pageSize: number;
  resultCnt: number;
  isNodeData: boolean;
  columnLimit?: number;
  isHide0?: boolean;
}
