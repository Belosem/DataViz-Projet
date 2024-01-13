import { Component, AfterViewInit, OnInit } from '@angular/core';

import * as d3 from 'd3';
import { geoMercator, geoPath, ZoomBehavior, Selection, BaseType } from 'd3';

@Component({
  selector: 'app-conflict-stats',
  templateUrl: './conflict-stats.component.html',
  styleUrls: ['./conflict-stats.component.scss']
})
export class ConflictStatsComponent implements OnInit {
  data: any;
  selectedCountry: string = 'Russia';
  countries: { value: string; label: string; path:string }[] = [
    { value: 'Russia', label: 'Russia', path: '../../../assets/data/russia_geojson/Russia.geojson'},
    { value: 'Ukraine', label: 'Ukraine', path: '../../../assets/data/ukraine_geojson/UA_FULL_Ukraine.geojson'}
    // Add more countries as needed
  ];

  constructor() {}

  /**
   * Load data for the default country on app loading
   */
  ngOnInit() {
    this.loadData();
  }

  /**
   * Load inial data
   */
  AfterViewInit() {
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
  loadData () {
    const countryPath = this.getCountryPath(this.selectedCountry);
    // console.log('Country path : ', countryPath);

    d3.json(countryPath).then(
      (jsonData) => {
        this.data = jsonData;
        console.log('Data loaded :', jsonData);

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

  /* 
  * Draw geo map
  */
  drawMap(jsonData: any) {
    // Access the container of conflict-stats
    const statsContainer = d3.select('#conflict-stats-container').node() as HTMLElement;

    // Dynamically get the width and height of the stats container
    const width = statsContainer.offsetWidth;
    const height = statsContainer.offsetHeight;

    // Define projection
    const projection = geoMercator()
      .center([105, 71])  // Adjust the center to focus on the region
      .translate([width / 2, height / 2])
      .scale(200);

    const path = geoPath().projection(projection);

    const svg = d3.select('#map-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create a tooltip div
    const tooltip = d3
      .select("body")
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
