import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplacePipe, TableViewComponent } from '../shared/table-view/table-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularDraggableModule } from 'angular2-draggable';
import { AutoSizeInputModule } from 'ngx-autosize-input';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [TableViewComponent, ReplacePipe],

  imports: [
    CommonModule,
    NgbModule,
    AngularDraggableModule,
    AutoSizeInputModule,
    FormsModule,
  ],
  exports: [TableViewComponent, ReplacePipe]
})
export class SharedModule { }
