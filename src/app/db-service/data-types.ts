import { ClassBasedRules } from '../operation-tabs/filter-tab/filtering-types';

export interface DbService {
  getNeighbors(elemId: string): GraphResponse;
  getSampleData(): GraphResponse;
  getAllData(): GraphResponse;
  getFilteringResult(rules: ClassBasedRules, skip: number, limit: number, isGraphReponse: boolean): GraphResponse | TableResponse;
  getCount4Query(queryId: number): number;
  getResult4Query(queryId: number, isGraphReponse: boolean): GraphResponse | TableResponse;
}

export interface GraphResponse {

}

export interface TableResponse {

}