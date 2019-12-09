
export enum TableDataType {
  string = 0, number = 1, datetime = 2, enum = 3
}

export interface iTableData {
  val: any;
  type: TableDataType;
}

export interface iTableViewInput {
  // first property of every result must be ID
  results: iTableData[][];
  columns: string[];
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  currPage: number;
  pageSize: number;
  resultCnt: number;
  isNodeData: boolean;
}
