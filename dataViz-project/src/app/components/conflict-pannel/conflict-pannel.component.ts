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
  eventTypes: any = [];
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
    this.events = this.conflictsService.getAllEvents().map((event: any) => {
      return {
        ...event,
        date: new Date(event.date)  // ISO 8601 format for dates
      }
    });

    // Calculate the last 30 days period
    // get the last event date in the array with
    let lastEventDate: any = this.events[0].date;
    this.events.forEach((event: any) => {
      if (event.date > lastEventDate) {
        lastEventDate = event.date;
      }
    });
    const lastMonth = new Date(lastEventDate);
    lastMonth.setDate(lastEventDate.getDate() - 31);
    this.selectedPeriod = [lastMonth, lastEventDate];
    this.startDate = this.events[0].date;
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
    this.createChart();
    //if (this.viewMode === 'basic')
    this.createLegend();
  }

  /**
   * Update the selected period Map events
   */
  private updateMapSelectedPeriod() {
    // Create a Map with the list of events by date for the selected period
    this.eventsBySelectedPeriod.clear();
    const list_days_in_period = d3.timeDay.range(this.selectedPeriod[0], this.selectedPeriod[1]);
    list_days_in_period.forEach((date: any) => {
      const transformedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!this.eventsBySelectedPeriod.has(transformedDate)) {
        this.eventsBySelectedPeriod.set(transformedDate, []);
      }
      this.eventsBySelectedPeriod.get(transformedDate).push(this.eventsByDate.get(transformedDate));
      this.conflictsService.setEventsBySelectedPeriod(this.eventsBySelectedPeriod, this.selectedPeriod[0], this.selectedPeriod[1]);
    });
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

    let x = d3.scaleTime()
      .domain(min_max_date)
      .range([margin.left, width - margin.right]);

    let svg = d3.select('#period-selector')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'period-selector-svg');

    let xAxis: any = d3.axisBottom(x)
      .ticks(d3.timeDay, 1)
      .tickFormat(this.selectedDateFormat);

    let gX = svg.append('g')
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
    const y = d3.scaleLinear()
      .domain([0, max_number_events_per_day + 10])
      .range([height - margin.bottom, margin.top]);

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
        // If type contains 'UA' replace by UA, if contains 'RU' replace by RU, else NEUTRAL
        if (type.includes('UA')) {
          type = 'UA';
        } else if (type.includes('RU')) {
          type = 'RU';
        } else if (type.includes('NATO')) {
          type = 'NATO';
        }
        else if (type.includes('NEUTRAL')) {
          type = 'NEUTRAL';
        }
        else {
          type = 'OTHER';
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
    // Create a Map with the list of events by date for the selected period
    this.conflictsService.createEventTypeColorsMap(this.eventTypes);

    this.updateDetailedViewSelection(eventsByDayAndType);

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

    // Transform the data into an array of objects
    const transformedData: any = Array.from(eventsByDayAndType, ([date, eventsMap]) => {
      const formattedDate: any = d3.timeParse("%d-%m-%Y")(date); // Adjust date format as needed
      const eventCounts: any = { date: formattedDate };
      eventsMap.forEach((count: any, type: any) => {
        eventCounts[type] = count;
      });
      return eventCounts;
    });

    // Extract the keys for stacking (exclude the 'date' key)
    const keys = this.eventTypes;

    // Create a stack generator
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderDescending)
      .offset(d3.stackOffsetNone);

    // Transform the data
    const series = stack(transformedData);
    // Find the maximum stack value
    const maxStackValue: any = d3.max(transformedData, (d: any) => {
      let total = 0;
      keys.forEach((key: any) => {
        total += d[key];
      });
      return total;
    });

    // Adjust the y scale's domain
    y.domain([0, maxStackValue]);
    // Assuming x is your time scale and y is your linear scale for counts
    svg.selectAll(".layer")
      .data(series)
      .enter().append("g")
      .attr("fill", (d: any) => {
        const c_ = (this.conflictsService.getEventTypeColor(d.key));
        if (c_ === undefined)
          return "#000000";
        else
          return c_;
      })
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", (d: any) => x(d.data.date) + 2.5)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", tickWidth - 5)

    // Create hoverable rectangles
    const columnGroups = svg.selectAll(".column-group")
      .data(transformedData)
      .enter().append('rect')
      .attr('class', 'hover-rect')
      .attr('x', (d, i) => tickPositions[i])
      .attr('y', margin.top)
      .attr('width', tickWidth)
      .attr('height', y(0) - margin.top)
      .style('fill', 'transparent')
      .style('pointer-events', 'all')

    columnGroups
      .on("mouseover", function (event, d) {
        // Highlight the group or show details for the entire date
        d3.select(this)
          .style("opacity", 0.7)
          .style("cursor", "pointer");

        showTooltip(event, d);
      })
      .on("mouseout", function () {
        // Remove highlight
        d3.select(this).selectAll("rect")
          .style("opacity", 1)
          .style("cursor", "default");

        hideTooltip();
      })
      .on("click", (event, d) => {
        this.updateDetailedViewSelection(d);
      });

    function showTooltip(event: any, data: any) {
      tooltip
        .style('opacity', 1)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
        .html(generateTooltipContent(data));
    }

    function hideTooltip() {
      tooltip.style('opacity', 0);
    }

    function generateTooltipContent(data: any) {
      let content = `<strong>Date:</strong> ${d3.timeFormat("%Y-%m-%d")(data.date)}<br/>`;
      if (data['NEUTRAL'])
        content += `<strong>Neutral events:</strong> ${data['NEUTRAL']}<br/>`;
      if (data['UA'])
        content += `<strong>Ukrainian events:</strong> ${data['UA']}<br/>`;
      if (data['RU'])
        content += `<strong>Russian events:</strong> ${data['RU']}<br/>`;
      if (data['NATO'])
        content += `<strong>NATO events:</strong> ${data['NATO']}<br/>`;
      if (data['OTHER'])
        content += `<strong>Other events:</strong> ${data['OTHER']}<br/>`;
      return content;
    }
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
      .style('fill', (d: any) => {
        const c_ = (this.conflictsService.getEventTypeColor(d));
        if (c_ === undefined)
          return "#000000";
        else
          return c_;
      });

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
    this.changeViewMode("");
  }

  /**
  * Change the view mode
  * @param viewMode 
  */
  public changeViewMode(viewMode: string) {
    d3.select('.period-selector-svg').remove();
    this.updateMapSelectedPeriod();
    this.createChart();
    d3.select('#period-selector-legend').select('.period-selector-legend-svg').remove();
    this.createLegend();
  }

  // Method to get the content for the tooltip
  private getTooltipContent(eventType: string, viewMode: string): string {
    // Return detailed event information for 'basic' viewMode
    return `Detailed Info: ${eventType}}`;
  }

  public detailedSelectedEvents: any = [];
  public detailedSelectedDate: string = "";

  private updateDetailedViewSelection(data: any) {
    if (data.date) {
      const date = `${data.date.getDate()}-${data.date.getMonth() + 1}-${data.date.getFullYear()}`; // transform the date in the format DD-MM-YYYY to string
      this.detailedSelectedDate = date;
      this.detailedSelectedEvents = this.eventsByDate.get(this.detailedSelectedDate);
      this.conflictsService.setSelectedDetailedEvents(this.detailedSelectedEvents);
      this.conflictsService.setStartDate(this.selectedPeriod[0]);
      this.conflictsService.setEndDate(this.selectedPeriod[1]);
      d3.select('#modal-detailed-view').style('display', 'block');
    }
  }

  public closeModaleDetailedView(): void {
    d3.select('#modal-detailed-view').style('display', 'none');
  }
}
