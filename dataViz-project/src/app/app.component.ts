import { OnInit, Component, ViewChild } from '@angular/core';
import { ConflictsService } from './services/conflicts.service';
import { } from 'googlemaps';

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
  // Google Map API
  @ViewChild('map') mapElement: any;
  map!: google.maps.Map; 

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

  ngAfterViewInit() {
    this.initMap();
  }
  
  initMap() {
    // Map properties management
    const mapProperties = {
      center: new google.maps.LatLng(35.2271, -80.8431),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
  }
}