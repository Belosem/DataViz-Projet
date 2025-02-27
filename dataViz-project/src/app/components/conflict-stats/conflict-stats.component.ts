import { Component, AfterViewInit, OnInit } from '@angular/core';

import * as d3 from 'd3';
import { geoMercator, geoPath, ZoomBehavior } from 'd3';
import { ConflictsService } from 'src/app/services/conflicts.service';

@Component({
  selector: 'app-conflict-stats',
  templateUrl: './conflict-stats.component.html',
  styleUrls: ['./conflict-stats.component.scss']
})
export class ConflictStatsComponent implements AfterViewInit {
  data: any;
  events: any = [];
  selectedCountry: string = 'Russia';
  countries: { value: string; label: string; path: string }[] = [
    { value: 'Russia', label: 'Russia', path: '../../../assets/data/russia_geojson/Russia.geojson' },
    { value: 'Ukraine', label: 'Ukraine', path: '../../../assets/data/ukraine_geojson/UA_FULL_Ukraine.geojson' }
    // Add more countries as needed
  ];
  eventsCountPerRegion: { [region: string]: number } = {};

  constructor(private conflictsService: ConflictsService) {

  }

  /**
   * Load inial data
   */
  ngAfterViewInit() {
    this.events = this.conflictsService.getAllEvents().map((event: any) => {
      return {
        ...event,
        date: new Date(event.date)  // ISO 8601 format for dates
      }
    });

    // Load initial data
    this.loadData();
  }

  /**
   * Load data for the selected country
   */
  onCountryChange() {
    this.loadData();
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
        console.log('Region Data loaded :', this.data);

        // this.eventsCountPerRegion = this.countEventsPerRegion(this.events, this.data);
        // console.log("Events per region : ", this.countEventsPerRegion);

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

  /*  setSelectedEvents(svg: any, projection: any, eventsData: any[]) {
  
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
    */



  /**
   * Draw map
   * @param jsonData
   */
  drawMap(jsonData: any) {
    // Access the container of conflict-stats
    const statsContainer = d3.select('#conflict-stats-container').node() as HTMLElement;

    // Dynamically get the width and height of the stats container
    const width = 900;
    const height = 600;

    // Define projection
    const projectionRussia = geoMercator()
      .center([103, 71])
      .translate([width / 2, height / 2])
      .scale(280);

    const projectionUkraine = geoMercator()
      .center([30, 49])
      .translate([width / 2, height / 2])
      .scale(2000);

    // Choose the appropriate projection based on the selected country
    const selectedProjection = this.selectedCountry === 'Russia' ? projectionRussia : projectionUkraine;

    var path = geoPath().projection(selectedProjection);

    /**
     * if (this.selectedCountry === 'Russia') {
      path = geoPath().projection(projectionRussia);
    } else {
      path = geoPath().projection(projectionUkraine);
    }
     */

    const svg = d3.select('#map-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create a tooltip div
    const tooltip = d3
      .select("#map-container")
      .append("div")
      .attr('class', 'tooltip')
      .style('opacity', 0.9)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('padding', '5px')
      .style('background', '#D4D3DC')
      .style('border', '0px')
      .style('border-radius', '2px')
      .style('pointer-events', 'none')
      .style('z-index', '10');

    // Create a group for the map features
    const mapGroup = svg.append('g');

    // Draw map features
    mapGroup
      .selectAll(".region")
      .data(jsonData.features)
      .join('path')
      .attr('class', 'region')
      .attr('d', (d: any) => path(d))
      .style('fill', '#4e77cb')
      .attr('stroke', '#D4D3DC')
      .on('mousemove', (event: any, d: any) => {
        const mousePosition = [event.pageX, event.pageY];
        // Show tooltip on mousemove
        tooltip
          .style('opacity', 5)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px')
          .html(() => {
            return this.selectedCountry === 'Russia'
              ? d.properties.name_latin : d.properties["name:fr"];
          });

        // Change color on hover
        d3.select(event.currentTarget).style('fill', '#646464');
      })
      .on('mouseout', (event: any, d: any) => {
        // Hide tooltip on mouseout
        tooltip.style('opacity', 0);
        d3.select(event.currentTarget).style('fill', '#4e77cb');
      });

    // this.setSelectedEvents(mapGroup, projection, this.selectedEvents);
    /*
      // Enable zooming
      const zoom: ZoomBehavior<Element, unknown> = d3.zoom()
        .scaleExtent([1, 8])  // Adjust the scale extent as needed
        .on('zoom', (event) => {
          mapGroup.attr('transform', event.transform);
        });
      svg.call(zoom as any);
    */


    console.log('Map created successfully!');
  }

}
