import { OnInit, Component } from '@angular/core';
import { ConflictsService } from './services/conflicts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dataViz-project';
  public detailedSelectedEvents: [] = [];
  public startDate: string = "";
  public endDate: string = "";
  public regionName: string = "World";

  constructor(private conflictService: ConflictsService) { }

  ngOnInit() {
    this.conflictService.selectedDetailedEvents$.subscribe((events: any) => {
      this.detailedSelectedEvents = events;
    });

    this.conflictService.startDate$.subscribe((date: string) => {
      this.startDate = date;
    });

    this.conflictService.endDate$.subscribe((date: string) => {
      this.endDate = date;
    });

    this.conflictService.regionName$.subscribe((region: string) => {
      this.regionName = region;
    });
  }
}
