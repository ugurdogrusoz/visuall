import { Component, OnInit } from '@angular/core';
import { SparqlDbService } from 'src/app/db-service/sparql-db.service';
import {FormControl} from '@angular/forms'
import { BehaviorSubject, Observable } from 'rxjs';



@Component({
  selector: 'sparql-query',
  templateUrl: './sparql-query.component.html',
  styleUrls: ['./sparql-query.component.css']
})
export class SparqlQueryComponent implements OnInit {
  

  searchInput = new FormControl();

  searchSparql = new BehaviorSubject<string> ('');

  /*node: Observable<string[]> = this. searchSparql.pipe(
    switchMap(searchNodeText => {
      return this.httpClient.post<Node[]>(`http://10.122.123.125:8086/sparql?solrBase=http://10.122.123.125:8985/solr/&solrCollection=teydeb_hkt_1610&triplestoreBase=http://10.122.123.125:3030&graphName=visuall_hkt`)
    })
  )*/

  constructor(private spq : SparqlDbService) {   
   }


  ngOnInit(): void {
    //this.spq.sparqlQuery();
  }

  doSearch(){
    this.searchSparql.next(this.searchInput.value)

  }


}
