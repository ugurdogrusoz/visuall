import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CytoscapeService } from './cytoscape.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class URLLoad {

    url: string;
    data: any;
    fileRead : boolean = false;

    constructor(private route: ActivatedRoute, private http:HttpClient,
      private _cyService: CytoscapeService){}

    init() {
        this.route.queryParams.subscribe(async params => {
            //if there is a URL query, getData() is invoked, otherwise nothing
            this.url = await params['URL'];
            this.getData();
        });
    }

    getData() {
        if(this.url){
          //if url is not null, get the data from the given route else wait for 200 ms and try again
            this.http.get<any>(this.url, { responseType: 'blob' as 'json' }).subscribe(async data => {
                this.data = new File([await data], 'Graph', { type: 'txt', lastModified:Date.now()});
                //data is taken as json and given to cytoscape's loadFile method as it is in navbar load
                this._cyService.loadFile(this.data);
            },
            (err: HttpErrorResponse) => {
                console.log (err.message);
            }
            );
        }
        else{
            window.setTimeout(this.getData, 200);
        }
    }

}
