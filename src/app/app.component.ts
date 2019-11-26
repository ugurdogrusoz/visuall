import { Component } from '@angular/core';
import { GlobalVariableService } from './global-variable.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoading = false;

  constructor(private _g: GlobalVariableService) {
    _g.setLoadingStatus = this.setLoading.bind(this);
  }

  setLoading(b: boolean) {
    this.isLoading = b;
  }

}
