import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Material modules
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatGridListModule} from '@angular/material/grid-list'; 
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon'; 
// Components
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ConflictPannelComponent } from './components/conflict-pannel/conflict-pannel.component';
import { ConflictStatsComponent } from './components/conflict-stats/conflict-stats.component';
import { ConflictsService } from './services/conflicts.service';
import { HttpClientModule } from '@angular/common/http';
import { PieChartEventsComponent } from './components/pie-chart-events/pie-chart-events.component';
<<<<<<< Updated upstream
import { ConflictMapComponent } from './components/conflict-map/conflict-map.component';
=======
import { AboutComponent } from './components/about/about.component';
>>>>>>> Stashed changes


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    ConflictPannelComponent,
    ConflictStatsComponent,
    PieChartEventsComponent,
<<<<<<< Updated upstream
    ConflictMapComponent,
=======
    AboutComponent,
>>>>>>> Stashed changes
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatGridListModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    HttpClientModule,
    MatFormFieldModule,
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
  ],
  providers: [ConflictsService, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
