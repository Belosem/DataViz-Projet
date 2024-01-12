import { Component, AfterViewInit, OnInit } from '@angular/core';

import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3';

@Component({
  selector: 'app-conflict-stats',
  templateUrl: './conflict-stats.component.html',
  styleUrls: ['./conflict-stats.component.scss']
})
export class ConflictStatsComponent implements OnInit{
  data: any;
  selectedRegion: string = 'Adygeya';
  regions: { value: string; label: string }[] = [
    { value: 'Adygeya', label: 'Adygeya' },
    { value: 'Altay', label: 'Altay'}
    // Add more regions as needed
  ];

  constructor() {}

  ngOnInit() {
    // Load data for the default region on app loading
    this.loadData();
  }

  AfterViewInit() {
    // Load initial data
    this.loadData();
  }

  onRegionChange() {
    // Load data for the selected region
    this.loadData();
  }


  loadData() {
    const regionPath = `../../../assets/data/russia_geojson/${this.selectedRegion}.geojson`;

    d3.json(regionPath).then(
      (donneesGeo) => {
        console.log('data', donneesGeo)
        // Clear previous map
        d3.select('#map-container').selectAll('*').remove();

        // Draw map
        this.drawMap(donneesGeo);
      },
      (error) => {
        console.error('Error loading data:', error);
      }
    );
  }

  /* 
  * Draw geo map
  */
  drawMap(donneesGeo: any) {
    // Access the container of conflict-stats
    const statsContainer = d3.select('#conflict-stats-container').node() as HTMLElement;

    // Dynamically get the width and height of the stats container
    const width = statsContainer.offsetWidth;
    const height = statsContainer.offsetHeight;

    // Define projection
    const projection = geoMercator()
      .center([40, 44.6])  // Adjust the center to focus on the region
      .translate([width / 2, height / 2])
      .scale(9000);
    const path = geoPath().projection(projection);
    const svg = d3.select('#map-container').append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create a tooltip div
    const tooltip = d3.select('#conflict-stats-container').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Draw map
    svg.append('path')
      .attr('d', path(donneesGeo.geometry))
      .attr('fill', 'steelblue')
      .attr('stroke', 'black');
/* Russia

    // Create a tooltip div
    const tooltip = d3
      .select("#conflict-stats-container")
      .append("div")
      .attr("class", "hidden tooltip");

    // Draw map
    svg
      .selectAll('path')
      .data(donneesGeo.features)
      .enter()
      .append("path")
      .attr("d", (d: any) => path(d))
      .attr("class", "region")
      .attr('fill', 'steelblue')
      .attr('stroke', 'black')
      .on("mousemove", (event: any, d: any) => {
        const mousePosition = [event.x, event.y];
        // Show tooltip on mousemove
        tooltip
          .classed("hidden", false)
          .attr(
            "style",
            "left:" +
              (mousePosition[0]) +
              "px; top:" +
              (mousePosition[1]) +
              "px"
          )
          .html(d.properties.name_latin);
      })
      .on("mouseout", () => {
        // Hide tooltip on mouseout
        tooltip.classed("hidden", true);
      });
  */

    console.log('Map created successfully !');
  }

}
