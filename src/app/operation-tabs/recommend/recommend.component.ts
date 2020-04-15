import { Component, OnInit, DoCheck, Output, EventEmitter, Input} from '@angular/core';
import { SharedService } from 'src/app/shared.service';


import { GlobalVariableService } from 'src/app/global-variable.service';



@Component({
  selector: 'app-recommend-tab',
  templateUrl: './recommend.component.html',
  styleUrls: ['./recommend.component.css']
})
export class RecommendComponent implements OnInit , DoCheck{

  recommendItems = [];
  
  constructor(private sharedService : SharedService, private _g:GlobalVariableService) {}

  ngOnInit() { 
  }
 
  ngDoCheck(){
    this.recommendItems = this.sharedService.getRecomDetails();
  }


  recomRemove(){
    if(this.recommendItems == null){
      return null;
    }else
      this.recommendItems.splice(this.recommendItems['']);
  }
}