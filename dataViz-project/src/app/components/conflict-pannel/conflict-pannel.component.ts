import { Component } from '@angular/core';
import { ConflictsService } from '../../services/conflicts.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-conflict-pannel',
  templateUrl: './conflict-pannel.component.html',
  styleUrls: ['./conflict-pannel.component.scss']
})
export class ConflictPannelComponent {
  events: any = [];

  constructor(private conflictsService: ConflictsService) {
    console.log('conflict pannel constructor');
    this.events = this.conflictsService.getEvents().map((event: any) => {
      return {
        ...event,
        date: new Date(event.date)  // ISO 8601 format for dates
      }
    });
    console.log(this.events[0]);
    this.createChart();
  }

  private createChart() {
    const margin = { top: 10, right: 0, bottom: 20, left: 0 };
    const width = 600; // Set the width
    const height = 120;

    const min_max_date : any = d3.extent(this.events, (d: any) => new Date(d.date));
    // Set up the x scale
    const x = d3.scaleTime()
      .domain(min_max_date) // Convert date to Date object
      .range([margin.left, width - margin.right]);
    // Interval of 24h
    const interval = d3.timeHour.every(24);
    // Set up the x axis
    const svg = d3.select('#period-selector')
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height);
  }
}
