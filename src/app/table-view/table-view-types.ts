
export interface iTableViewInput {
  // first property of every result must be ID
  results: any[];
  columns: string[];
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  currPage: number;
  pageSize: number;
  resultCnt: number;
}
