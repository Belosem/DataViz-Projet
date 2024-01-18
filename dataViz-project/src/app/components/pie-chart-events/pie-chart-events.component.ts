import { Component, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { ConflictsService } from 'src/app/services/conflicts.service';

@Component({
  selector: 'app-pie-chart-events',
  templateUrl: './pie-chart-events.component.html',
  styleUrls: ['./pie-chart-events.component.scss']
})
export class PieChartEventsComponent implements OnChanges {
  @Input() public pieChartData: any = [];
  @Input() public dateRange: any;
  @Input() public selectedDate : string = "";
  @Input() public regionName: string | null = "";
  @Input() public parentContainerName : string = "";
  public filteredEventName : any = "";
  public periodFormat: any = d3.timeFormat('%d %b. %Y');
  
  constructor(private conflictService: ConflictsService) { }

  ngOnChanges() {
    // Change date format
    this.selectedDate = this.periodFormat(new Date(this.selectedDate));
    this.dateRange = [this.periodFormat(new Date(this.dateRange[0])), this.periodFormat(new Date(this.dateRange[1]))];
    // Data cleaning
    const eventsByType: Map<string, []> = this.pieChartData.reduce((map: any, event: any) => {
      const key = event.icon;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(event);
      return map;
    }, new Map());

    // Prepare the data for D3's pie function
    const pieData: any = Array.from(eventsByType, ([name, events]) => ({ name, events }));

    // Remove previous svg
    d3.select('#pie-chart-container').selectAll('svg').remove();

    // Set up dimensions and radius of the pie chart
    const parent = d3.select(this.parentContainerName).node() as HTMLElement;  // Get the parent container size
    const width = parent.clientWidth - 50;
    const height = parent.clientHeight - 50;
    const radius = Math.min(width, height) / 2;

    // Set up the pie chart
    const pie = d3.pie().value((d: any) => d.events.length);

    // Set up the arc
    const arc = d3.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    const outerArc = d3.arc()
      .innerRadius(radius * 0.95)
      .outerRadius(radius * 0.95);

    // Prepare groups
    const svg = d3.select('#pie-chart-container')
      .append('svg')
      .attr('width', width)
      .attr("height", height)
      .attr('class', 'pie-chart')
      .append('g')

    svg.append("g")
      .attr("class", "slices");
    svg.append("g")
      .attr("class", "labels");
    svg.append("g")
      .attr("class", "lines");
    
      // Set svg position
    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const key = (d: any) => d.data.name;
    // Set up the color scale
    const color_range: string[] = []
    pieData.forEach((element: any) => {
      let type = element.name;
      if(type.includes('UA')) 
        type = 'UA';
      else if(type.includes('RU'))
        type = 'RU';
      else if(type.includes('NEUTRAL'))
        type = 'NEUTRAL';
      else if(type.includes('NATO'))
        type = 'NATO';
      else if(type.includes('OTHER'))
        type = 'OTHER';
      else
        type = 'OTHER';
      const color = this.conflictService.getEventTypeColor(type);
      (color) ? color_range.push(color) : "#000000";
    });

    const color: any = d3.scaleOrdinal()
      .domain(pieData)
      .range(color_range);

    this.change(svg, pieData, pie, arc, outerArc, key, color, radius);
  }

  // inspired by https://gist.github.com/dbuezas/9306799
  private change(svg: any, pieData: any, pie: any, arc: any, outerArc: any, key: any, color: any, radius: any) {
    this.filteredEventName = "";

    const arcTween = (a: any, arcGenerator: any) => {
      const current = { ...a };
      return (t: any) => {
        const interpolate = d3.interpolate(current, a);
        return arcGenerator(interpolate(t));
      };
    };

    // Define a function to calculate the mid-angle of a slice
    const midAngle = (d: any) => d.startAngle + (d.endAngle - d.startAngle) / 2;

    const textTween = (a: any) => {
      const current = { ...a };
      return (t: any) => {
        const interpolate = d3.interpolate(current, a);
        const d2 = interpolate(t);
        const pos = outerArc.centroid(d2);
        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      };
    };

    const textAnchorTween = (a: any) => {
      const current = { ...a };
      return (t: any) => {
        const interpolate = d3.interpolate(current, a);
        const d2 = interpolate(t);
        return midAngle(d2) < Math.PI ? "start" : "end";
      };
    };

    const slice = svg.select(".slices")
      .selectAll("path.slice")
      .data(pie(pieData), key);

    slice.enter()
      .insert("path")
      .style("fill", (d: any) => color(d.data.name))
      .attr("class", "slice")
      .merge(slice) // Merge enter and update selections
      .transition().duration(1000)
      .attrTween("d", (d: any) => arcTween(d, arc))
      .attr("stroke", "white");

    // Apply event listeners to both new and updated elements
    // Re-select the slices to apply event listeners to both new and updated elements
    svg.select(".slices").selectAll("path.slice")
      .on("mouseover", (event: { currentTarget: any; }, d: any) => {
        d3.select(event.currentTarget).style("opacity", 0.7);
        // Additional mouseover logic here
      })
      .on("mouseout", (event: { currentTarget: any; }, d: any) => {
        d3.select(event.currentTarget).style("opacity", 1);
      })
      .on("click", (event: any, d: { data: any; }) => {
        this.conflictService.setFilteredEvents(d.data.events);
        d3.selectAll(".slice").style("opacity", 1);
        d3.select(event.currentTarget).attr("id", "selected-slice");
        if(d.data.name.includes('UA'))
          this.filteredEventName = "Ukraine - " + this.conflictService.getLabelByIcon(d.data.name);
        else if(d.data.name.includes('RU'))
          this.filteredEventName = "Russia - " + this.conflictService.getLabelByIcon(d.data.name);
        else if(d.data.name.includes('NEUTRAL'))
          this.filteredEventName = "Neutral - " + this.conflictService.getLabelByIcon(d.data.name);
        else if(d.data.name.includes('NATO'))
          this.filteredEventName = "NATO - " + this.conflictService.getLabelByIcon(d.data.name);
        else
          this.filteredEventName = "Other - " + this.conflictService.getLabelByIcon(d.data.name);
      });
    
    slice.exit().remove();

    const text = svg.select(".labels")
      .selectAll("text")
      .data(pie(pieData), key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text((d : any) => this.conflictService.getLabelByIcon(d.data.name))
      .merge(text) // Merge enter and update selections
      .transition().duration(1000)
      .attrTween("transform", (d : any) => textTween(d))
      .styleTween("text-anchor", textAnchorTween);

    text.exit().remove();

    const polylineTween = (a: any) => {
      const current = { ...a };
      return (t: any) => {
        const interpolate = d3.interpolate(current, a);
        const d2 = interpolate(t);
        const pos = outerArc.centroid(d2);
        pos[0] = radius * 0.98 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    };

    const polyline = svg.select(".lines")
      .selectAll("polyline")
      .data(pie(pieData), key);

    polyline.enter()
      .append("polyline")
      .merge(polyline) // Merge enter and update selections
      .transition().duration(1000)
      .attrTween("points", polylineTween);

    d3.selectAll("polyline").style("opacity", "0.3").style("stroke", "black").style("stroke-width", "2px").style("fill", "none");
    polyline.exit().remove();
  }
}