import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private recomDetails: any;
  private lblElem: any;
  private filterInp:any;
  private opKeys:any;
  private selectedProp:any;
 

  constructor() {
    this.recomDetails = undefined;
    this.lblElem = undefined;
    this.filterInp= undefined;
    this.opKeys = undefined;
  }

  getRecomDetails(): any {
    return this.recomDetails;
  }

  setRecomDetails(value: any) {
    this.recomDetails = value;
  }
  getlblElem(): any{
    return this.lblElem;
  }
  setlblElem(value:any){
    this.lblElem = value;
  }

  getFilterInput():any{
    return this.filterInp;
  }

  setFilterInput(value:any){
    this.filterInp = value;
  }
  getOpKeys():any{
    return this.opKeys;
  }

  setOpKeys(value:any){
    this.opKeys = value;
  }
  getProp():any{
    return this.selectedProp;
  }

  setProp(value:any){
    this.selectedProp = value;
  }


}
