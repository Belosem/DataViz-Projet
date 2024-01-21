import { OnInit, Component, ViewChild, ElementRef } from '@angular/core';
import { ConflictsService } from './services/conflicts.service';
import { } from 'googlemaps';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dataViz-project';
  public detailedSelectedEvents: any = [];
  public filteredSelectedEvents : any = [];
  public startDate: string = "";
  public endDate: string = "";
  public regionName: string = "World";
  public selectedDate: string = "";
  public selectedPeriodFormat: any = d3.timeFormat('%d %b. %Y');
  public filteredEventName : any = "";
  // Google Map API
  @ViewChild('map') mapElement: any;
  map!: google.maps.Map;
  showNewComponent: boolean = false;
  @ViewChild('content') content!: ElementRef;

  constructor(private conflictService: ConflictsService) { }

  ngOnInit() {
    this.conflictService.selectedDetailedEvents$.subscribe((events: any) => {
      this.detailedSelectedEvents = events;
      this.filteredSelectedEvents = events;
      if(this.detailedSelectedEvents.length > 0) {
        this.detailedSelectedEvents.forEach((event: any) => {
          if(this.startDate < event.date) {
            this.startDate = event.date;
          }
          if(this.endDate > event.date) {
            this.endDate = event.date;
          }
          if(this.startDate == this.endDate) {
            this.selectedDate = this.startDate;
          }
          else {
            this.selectedDate = "";
          }
        });
      }
      this.initMap();
    });

    this.conflictService.filteredEvents$.subscribe((events: any) => {
      this.filteredSelectedEvents = events;
      this.initMap();
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

  async addMarker(event: any) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(event.latitude, event.longitude),
      map: this.map,
      title: event.event_type,
      icon: this.getMarkerIcon(event.icon),
    });
    // add info window to marker
    const infoWindow = new google.maps.InfoWindow({
      content: await this.getInfoWindowContent(event),
    });
    marker.addListener("click", () => {
      infoWindow.open(this.map, marker);
    });
  }

  async getInfoWindowContent(event: any) {
    // request API to get info on the event
    const url = "https://geoconfirmed.org/api/placemark/Ukraine/" + event.id;
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const description = data.description;
      let originalSource = data.originalSource;
  
      // Regular expression to match URLs
      const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|?])/ig;
  
      // Replace URLs with anchor tags
      originalSource = originalSource.replace(urlRegex, function(url : string) {
        return `<a href="${url}" target="_blank">${url}</a>`;
      });
  
      return `
        <div class="info-window">
          <h2>${this.conflictService.getLabelByIcon(event.icon)}</h2>
          <p><strong>Location:</strong> ${event.latitude}, ${event.longitude}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Original source:</strong> ${originalSource}</p>
        </div>
      `;
    } catch (error) {
      console.error("Error fetching data:", error);
      return `
        <div class="info-window">
          <h2>${this.conflictService.getLabelByIcon(event.icon)}</h2>
          <p><strong>Location:</strong> ${event.latitude}, ${event.longitude}</p>
          <p>Error loading additional information.</p>
        </div>
      `;
    }
  }

  getMarkerIcon(eventType: string) {
    return "assets/iconsWar/" + eventType
  };

  initMap() {
    // Map properties management
    const mapProperties = {
      center: new google.maps.LatLng(49.9946954, 36.12102),
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      trafficLayer: false,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
    // add coordinates to map
    let eventsToMark : any = [];
    if (this.filteredSelectedEvents.length > 0) {
      eventsToMark = this.filteredSelectedEvents;
    }
    else {
      eventsToMark = this.detailedSelectedEvents;
    }

    eventsToMark.forEach((event: any) => {
      this.addMarker(event);
    });
  }
}