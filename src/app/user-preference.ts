import { BehaviorSubject } from 'rxjs';

export interface iUserPref {
  isIgnoreCaseInText: BehaviorSubject<boolean>;
  isTimebarEnabled: BehaviorSubject<boolean>;
  isAutoIncrementalLayoutOnChange: BehaviorSubject<boolean>;
  isSelectOnMerge: BehaviorSubject<boolean>;
  dataPageSize: BehaviorSubject<number>;
  tableColumnLimit: BehaviorSubject<number>;
}