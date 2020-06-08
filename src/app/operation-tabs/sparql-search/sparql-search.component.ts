import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'sparql-search',
  templateUrl: './sparql-search.component.html',
  styleUrls: ['./sparql-search.component.css']
})
export class SparqlSearchComponent {

  inputValue: string;
  options: any;
  listValue: string[] = []; // Objects ID's
  valueE:any;





  constructor(private _http: HttpClient) { }

  onInput(){
    let url = "http://10.122.123.125:8086/search?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=teydeb_demo_teydeb_hkt_1610";
    let param = {
      "param": this.inputValue,
    }
    this._http.post(url, param).subscribe(x => {
      this.options = x;
      for (let i = 0; i < this.options.length; i++) {
        this.listValue.push(this.options[i].id);
      }
    })
    return this.listValue;
  }
  clearList(){
    this.listValue = [];
  }





}
