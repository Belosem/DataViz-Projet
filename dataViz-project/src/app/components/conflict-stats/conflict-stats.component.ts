import { Component, AfterViewInit, OnInit } from '@angular/core';

import * as d3 from 'd3';
import { geoMercator, geoPath, ZoomBehavior} from 'd3';
import { ConflictsService } from 'src/app/services/conflicts.service';

@Component({
  selector: 'app-conflict-stats',
  templateUrl: './conflict-stats.component.html',
  styleUrls: ['./conflict-stats.component.scss']
})
export class ConflictStatsComponent implements AfterViewInit {
  data: any;
  selectedEvents: any = [];
  googleMap!: google.maps.Map;
  selectedCountry: string = 'Russia';
  countries: { value: string; label: string; path: string }[] = [
    { value: 'Russia', label: 'Russia', path: '../../../assets/data/russia_geojson/Russia.geojson' },
    { value: 'Ukraine', label: 'Ukraine', path: '../../../assets/data/ukraine_geojson/UA_FULL_Ukraine.geojson' }
    // Add more countries as needed
  ];

  constructor(private conflictsService: ConflictsService) {
    this.conflictsService.selectedEvents$.subscribe((selectedEvents) => {
      this.selectedEvents = selectedEvents;
      console.log('Selected Events:', this.selectedEvents);
    });
  }

  /**
   * Load inial data
   */
  ngAfterViewInit() {
    // Load initial data
    this.loadData();

    // Initialize Google Map in the background
    this.initializeGoogleMap();
  }

  /**
   * Load data for the selected country
   */
  onCountryChange() {
    this.loadData();
  }

  /**
   * Initialize Google Map in the background
   */
  initializeGoogleMap() {
    const mapOptions = {
      center: new google.maps.LatLng(35.2271, -80.8431),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.googleMap = new google.maps.Map(document.getElementById('google-map-container')!, mapOptions);
  }


  getCountryPath(value: string): string {
    const country = this.countries.find(country => country.value === value);
    return country ? country.path : '';
  }

  /**
   * Load data
   */
  loadData() {
    const countryPath = this.getCountryPath(this.selectedCountry);
    // console.log('Country path : ', countryPath);

    d3.json(countryPath).then(
      (jsonData) => {
        this.data = jsonData;
        console.log('Data loaded :', this.data);

        // Clear previous map
        d3.select('#map-container').selectAll('*').remove();

        // draw selected country map
        this.drawMap(this.data);
      },
      (erreur) => {
        console.error('Error when loading data :', erreur);
      }
    );
  }


    /**
   * Add events on the map depending on the selected period
   * @param svg 
   * @param projection 
   * @param eventsData 
   */
    setSelectedEvents(svg: any, projection: any, eventsData: any[]) {

      const markersGroup = svg.append('g').attr('class', 'markers');
  
      // Convertissez les coordonnées des coins de la carte en coordonnées x, y
      const [[x0, y0], [x1, y1]] = d3.geoPath().projection(projection).bounds(this.data);
  
      // Filtrer les markers
      const filteredEvents = eventsData.filter((event) => {
        const [x, y] = projection([event.longitude, event.latitude]);
        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
      });
  
      // Get event coordinates
      filteredEvents.forEach((event) => {
        const [x, y] = projection([event.longitude, event.latitude]);
  
        // Add markers on the map
        markersGroup.append('image')
          .attr('x', x)
          .attr('y', y)
          .attr('width', 10)
          .attr('height', 10)
          .attr('xlink:href', `assets/icons_war/${event.icon}`);
      });
    }

  /**
   * Draw map
   * @param jsonData
   */
  drawMap(jsonData: any) {
    // Access the container of conflict-stats
    const statsContainer = d3.select('#conflict-stats-container').node() as HTMLElement;

    // Dynamically get the width and height of the stats container
    const width = statsContainer.offsetWidth;
    const height = statsContainer.offsetHeight;

    // Define projection
    const projection = geoMercator()
      .center([105, 71])
      .translate([width / 2, height / 2])
      .scale(200);

    const path = geoPath().projection(projection);

    const svg = d3.select('#map-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create a tooltip div
    const tooltip = d3
      .select("#map-container")
      .append("div")
      .attr("class", "hidden tooltip");

    // Create a group for the map features
    const mapGroup = svg.append('g');

    // Draw map features
    mapGroup
      .selectAll(".region")
      .data(jsonData.features)
      .join('path')
      .attr('class', 'region')
      .attr('d', (d: any) => path(d))
      .style('fill', 'steelblue')
      .attr('stroke', 'black')
      .on('mousemove', (event: any, d: any) => {
        const mousePosition = [event.x, event.y];
        // Show tooltip on mousemove
        tooltip
          .classed('hidden', false)
          .attr(
            'style',
            'left:' +
            (mousePosition[0] + 15) +
            'px; top:' +
            (mousePosition[1] - 35) +
            'px'
          )
          .html(() => {
            return this.selectedCountry === 'Russia'
              ? d.properties.name_latin : d.properties["name:fr"];
          });
      })
      .on('mouseout', () => {
        // Hide tooltip on mouseout
        tooltip.classed('hidden', true);
      });

    this.setSelectedEvents(mapGroup, projection, this.selectedEvents);

    // Enable zooming
    const zoom: ZoomBehavior<Element, unknown> = d3.zoom()
      .scaleExtent([1, 8])  // Adjust the scale extent as needed
      .on('zoom', (event) => {
        mapGroup.attr('transform', event.transform);
      });
    svg.call(zoom as any);

    console.log('Map created successfully!');
  }
}
