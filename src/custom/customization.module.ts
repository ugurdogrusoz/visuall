import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Neo4jDb } from 'src/app/db-service/neo4j-db.service';
import { DbService } from 'src/app/db-service/data-types';
import { Query0Component } from './queries/query0/query0.component';
import { Query1Component } from './queries/query1/query1.component';
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule } from '@angular/forms';

// import { AsdComponent } from './asd/asd.component';
// import statements for custom components should be here

@NgModule({
  // custom components should be inside declarations
  declarations: [Query0Component, Query1Component],
  // declarations: [AsdComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
  ]
})
export class CustomizationModule {
  // static operationTabs: { component: any, text: string }[] = [{ component: AsdComponent, text: 'Dummy' }];
  // static operationTabs: { component: any, text: string }[] = [{ component: AsdComponent, text: 'Dummy' }, { component: Dummy2Component, text: 'Dummy2' }];
  static operationTabs: { component: any, text: string }[] = [];
  static queries: { component: any, text: string }[] = [{ component: Query0Component, text: 'Get actors by title counts' }, { component: Query1Component, text: 'Get titles by genre' }];
  static db: DbService;
  constructor(private _db: Neo4jDb) {
    CustomizationModule.db = _db;
  }
}
