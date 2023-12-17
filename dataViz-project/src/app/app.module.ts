import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Material modules
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatGridListModule} from '@angular/material/grid-list'; 
// Components
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ConflictPannelComponent } from './components/conflict-pannel/conflict-pannel.component';
import { ConflictStatsComponent } from './components/conflict-stats/conflict-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    ConflictPannelComponent,
    ConflictStatsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
