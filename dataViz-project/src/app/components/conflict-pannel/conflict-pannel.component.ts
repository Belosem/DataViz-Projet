import { Component } from '@angular/core';
import { ConflictsService } from '../../services/conflicts.service';
import { AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-conflict-pannel',
  templateUrl: './conflict-pannel.component.html',
  styleUrls: ['./conflict-pannel.component.scss']
})
export class ConflictPannelComponent implements AfterViewInit {
  events: any = [];
  selectedPeriod: any = null; // [start, end]
  selectedPeriodFormat: any = d3.timeFormat('%d %b. %Y');
  selectedDateFormat: any = d3.timeFormat('%d %b.');
  eventsByDate = new Map(); // Map Containing the list of events by dates
  eventsBySelectedPeriod = new Map(); // Map Containing the list of events by dates on the selected period
  viewMode = 'basic'; // (basic | detailed) : basic = only UA,RU,NEUTRAL, detailed = all types
  eventTypes: string[] = [];
  // Date pickers
  pickerStart: any;
  pickerEnd: any;
  startDate: Date = new Date();
  endDate: Date = new Date();

  /**
   * Constructor : get the events from the conflicts service
   * @param conflictsService 
   */
  constructor(private conflictsService: ConflictsService) {
    console.log('conflict pannel constructor');
    this.events = this.conflictsService.getAllEvents().map((event: any) => {
      return {
        ...event,
        date: new Date(event.date)  // ISO 8601 format for dates
      }
    });

    // Calculate the last 30 days period
    // get the last event date in the array with
    const lastEventDate = this.events[500].date; // Random event date for now
    const lastMonth = new Date(lastEventDate);
    lastMonth.setDate(lastEventDate.getDate() - 31);
    this.selectedPeriod = [lastMonth, lastEventDate];
    this.startDate = lastMonth;
    this.endDate = lastEventDate;
    // Create a Map with the list of events by date
    this.events.forEach((event: any) => {
      const date = event.date;
      // Transform the date in the format DD-MM-YYYY to string
      const transformedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!this.eventsByDate.has(transformedDate)) {
        this.eventsByDate.set(transformedDate, []);
      }
      this.eventsByDate.get(transformedDate).push(event);
    });

    this.updateMapSelectedPeriod();
  }

  dateSelectionFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }
  /**
   * After view init : create the chart
   * Function executed after the view is initialized
   */
  ngAfterViewInit() {
    console.log('conflict pannel after view init');
    this.createChart();
    if (this.viewMode === 'basic')
      this.createLegend();

    /** Updating events when changed */
    /*this.conflictsService.selectedEvents$.subscribe((selectedEvents: any) => {
      this.eventsBySelectedPeriod = selectedEvents;
      this.updateMapSelectedPeriod();
      console.log('Events by eventsBySelectedPeriod in subscribe:', this.eventsBySelectedPeriod);
    });
    */

  }

  /**
   * Update the selected period Map events
   */
  private updateMapSelectedPeriod() {
    // Create a Map with the list of events by date for the selected period

    const list_days_in_period = d3.timeDay.range(this.selectedPeriod[0], this.selectedPeriod[1]);
    list_days_in_period.forEach((date: any) => {
      const transformedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!this.eventsBySelectedPeriod.has(transformedDate)) {
        this.eventsBySelectedPeriod.set(transformedDate, []);
      }
      this.eventsBySelectedPeriod.get(transformedDate).push(this.eventsByDate.get(transformedDate));
      this.conflictsService.setEventsBySelectedPeriod(this.eventsBySelectedPeriod, this.selectedPeriod[0], this.selectedPeriod[1]);
    });
    console.log('Events by eventsBySelectedPeriod :', this.eventsBySelectedPeriod);
  }

  /**
   * Create the chart
   */
  private createChart() {
    const margin = { top: 60, right: 15, bottom: 20, left: 15 };
    const parent = d3.select('#conflict-pannel-container').node() as HTMLElement;
    const width = parent.clientWidth - 50;
    const height = parent.clientHeight - 50;

    const selected_events: any = this.events.filter((d: any) => d.date >= this.selectedPeriod[0] && d.date <= this.selectedPeriod[1]);
    const min_max_date: any = d3.extent(selected_events, (d: any) => d.date);

    const x = d3.scaleTime()
      .domain(min_max_date)
      .range([margin.left, width - margin.right]);

    const svg = d3.select('#period-selector')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'period-selector-svg');

    const xAxis: any = d3.axisBottom(x)
      .ticks(d3.timeDay, 1)
      .tickFormat(this.selectedDateFormat);

    const gX = svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    // Calculate space between ticks for hoverable rectangles
    const ticks = gX.selectAll('.tick').nodes();
    const tickPositions = ticks.map((tick: any) => x(tick.__data__));
    const tickWidth = tickPositions[1] - tickPositions[0];

    // Add circles by events by date (y axis calculated by the number of events)
    let max_number_events_per_day = 0;
    for (let element of this.eventsBySelectedPeriod) {
      if (element[1][0].length > max_number_events_per_day)
        max_number_events_per_day = element[1][0].length;
    }

    // Set the y axis
    console.log("max_number_events_per_day", max_number_events_per_day);
    const y = d3.scaleLinear()
      .domain([0, max_number_events_per_day + 10])
      .range([height - margin.bottom, margin.top]);

    // Adjust circles to be approximately centered between the ticks
    const numDates = selected_events.length;
    const offset = (width) / (numDates * 2); // Calculate an offset to center the circles
    // Create a list of event types
    this.eventTypes = [];
    // Process data to group and count events by type for each day
    const eventsByDayAndType = new Map();
    // Create a Map with the list of events by date for the selected period containg the number of events by type
    this.eventsBySelectedPeriod.forEach((events: any, date: any) => { // For each day
      const dayEventsByType = new Map(); // Map containing the number of events by type for the day
      events[0].forEach((event: any) => {
        // if the event type is not in the map, add it
        let type = event.icon;
        if (this.viewMode === 'basic') {
          // If type contains 'UA' replace by UA, if contains 'RU' replace by RU, else NEUTRAL
          if (type.includes('UA')) {
            type = 'UA';
          } else if (type.includes('RU')) {
            type = 'RU';
          } else {
            type = 'NEUTRAL';
          }
        }
        if (!dayEventsByType.get(type)) {
          dayEventsByType.set(type, 0);
          this.eventTypes.push(type);
        }
        // increment the number of events by type
        dayEventsByType.set(type, dayEventsByType.get(type) + 1);
      });
      // Add the day to the Map
      eventsByDayAndType.set(date, dayEventsByType);
    });

    // Append hoverable rectangles
    svg.selectAll('.hover-rect')
      .data(eventsByDayAndType.values())
      .enter()
      .append('rect')
      .attr('class', 'hover-rect')
      .attr('x', (d, i) => tickPositions[i] - tickWidth / 2)
      .attr('y', margin.top)
      .attr('width', tickWidth)
      .attr('height', y(0) - margin.top)
      .style('fill', 'transparent')
      .style('pointer-events', 'all')
      .on('mouseover', function () {
        d3.select(this)
          .style('fill', 'lightgray')
          .style('cursor', 'pointer')
        //.style('stroke', '#000000')
        //.style('stroke-width', 1);
      })
      .on('mouseout', function () { d3.select(this).style('fill', 'transparent').style('stroke-width', 0); });

    // Define a color scale for different event types
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    console.log('eventsByDayAndType', eventsByDayAndType)

    // Append a tooltip container to the body
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('padding', '2px')
      .style('background', 'white')
      .style('border', '0px')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .style('z-index', '10'); // Ensure tooltip is above other elements

    eventsByDayAndType.forEach((dayEvents, date) => {
      let count_acc = 0;
      dayEvents.forEach((count: number, eventType: string) => {
        // Compute the center position for each circle
        const radius = (count > 5) ? ((count < 15) ? count : 15) : 5;
        const circleX = x(new Date(date.split('-').reverse().join('-'))) + offset;
        const circleY = y(count) - count_acc;

        const circle = svg.append('circle');
        if (this.viewMode === 'basic') {
          circle.attr('cx', circleX)
            .attr('cy', circleY - radius)
            .attr('r', radius)
            .attr('fill', colorScale(eventType))
            .attr('stroke', '#000000')
            .attr('stroke-width', 1);
        }

        // Show tooltip on mouseover
        circle.on('mouseover', (event, d) => {
          circle.style('cursor', 'pointer');
          if (this.viewMode === 'basic')
            circle.style('fill', 'lightgray');

          tooltip.transition()
            .duration(200)
            .style('opacity', .9);

          tooltip.html(this.getTooltipContent(eventType, this.viewMode))
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
          .on('mouseout', (d) => {
            circle.style('cursor', 'default')
              .style('fill', colorScale(eventType));

            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          });

        const detailed_circle_img = svg.append('svg:image')
        // if viewMode is detailed, circle should contain the image of the event type (icon) in a circle
        if (this.viewMode === 'detailed') {
          const radius = 20;
          detailed_circle_img
            .attr('xlink:href', `assets/icons_war/${eventType}`)
            .attr('x', circleX - (radius / 2))
            .attr('y', circleY - radius)
            .attr('width', radius)
            .attr('height', radius);
        }
        count_acc += 10;
        detailed_circle_img.on('mouseover', (event, d) => {
          detailed_circle_img.style('cursor', 'pointer');

          tooltip.transition()
            .duration(200)
            .style('opacity', .9);

          tooltip.html(this.getTooltipContent(eventType, this.viewMode))
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
          .on('mouseout', (d) => {
            detailed_circle_img.style('cursor', 'default')
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          });
      });
    });
  }

  createLegend() {
    this.eventTypes = [...new Set(this.eventTypes)];

    d3.select('#period-selector-legend')
      .append('svg')
      .attr('width', 100)
      .attr('height', 100)
      .attr('class', 'period-selector-legend-svg');

    const svg = d3.select('#period-selector-legend').select('svg');
    const legend = svg.selectAll('.legend')
      .data(this.eventTypes)
      .enter().append('g')
      .attr('class', 'period-selector-legend')
      .attr('transform', (d, i) => { return 'translate(0,' + i * 20 + ')'; });

    legend.append('rect')
      .attr('x', 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d: any) => d3.schemeCategory10[this.eventTypes.indexOf(d)]);

    legend.append('text')
      .attr('x', 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text((d: any) => d);
  }

  onDateChange(): void {
    // Update the selectedPeriod with new start and end dates
    this.selectedPeriod = [this.startDate, this.endDate];
    this.updateMapSelectedPeriod();
    this.changeViewMode(this.viewMode);
  }
  
  /**
  * Change the view mode
  * @param viewMode 
  */
  public changeViewMode(viewMode: string) {
    this.viewMode = viewMode;
    d3.select('.period-selector-svg').remove();
    this.updateMapSelectedPeriod();
    this.createChart();
    d3.select('#period-selector-legend').select('.period-selector-legend-svg').remove();
    if (this.viewMode === 'basic') {
      this.createLegend();
    }
  }

  // Method to get the content for the tooltip
  private getTooltipContent(eventType: string, viewMode: string): string {
    if (viewMode === 'basic') {
      // Return detailed event information for 'basic' viewMode
      return `Detailed Info: ${eventType}`;
    } else {
      // Return general information for 'detailed' viewMode
      return `Event Type: ${eventType}`;
    }
  }
}
