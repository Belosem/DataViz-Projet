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
  @Input() public regionName: string | null = "";
  @Input() public parentContainerName : string = "";

  ngOnChanges() {
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
    console.log("ngOnChanges pieData:", pieData);

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
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

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
    const color_range: string[] = this.set_color_range(pieData);
    const color: any = d3.scaleOrdinal()
      .domain(pieData)
      .range(color_range);

    this.change(svg, pieData, pie, arc, outerArc, key, color, radius);
  }

  private set_color_range(pieData: any): string[] {
    // 3 Base colors : UA, RU, NEUTRAL
    const base_colors: string[] = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
    const color_range: string[] = [];
    pieData.forEach((element: any) => {
      if (element.name.includes('UA')) {
        // Create a variant of the base color for UA
        const color = d3.rgb(base_colors[0]).toString();
        color_range.push(color);
      }
      else if (element.name.includes('RU')) {
        // Create a variant of the base color for RU
        const color = d3.rgb(base_colors[1]).toString();
        color_range.push(color);
      }
      else if (element.name.includes('NEUTRAL')) {
        // Create a variant of the base color for NEUTRAL
        const color = d3.rgb(base_colors[2]).toString();
        color_range.push(color);
      }
      else {
        // Create a variant of the base color for OTHER
        const color = d3.rgb(base_colors[3]).toString();
        color_range.push(color);
      }
    });
    return color_range;
  }

  private change(svg: any, pieData: any, pie: any, arc: any, outerArc: any, key: any, color: any, radius: any) {
    const arcTween = (a: any, arcGenerator: any) => {
      const current = { ...a };
      return (t: any) => {
        const interpolate = d3.interpolate(current, a);
        return arcGenerator(interpolate(t));
      };
    };

    // Define a function to calculate the mid-angle of a slice
    const midAngle = (d: any) => d.startAngle + (d.endAngle - d.startAngle) / 2;

    // TEXT LABELS
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

    /* ------- PIE SLICES -------*/
    const slice = svg.select(".slices")
      .selectAll("path.slice")
      .data(pie(pieData), key);

    slice.enter()
      .insert("path")
      .style("fill", (d: any) => color(d.data.name))
      .attr("class", "slice")
      .merge(slice) // Merge enter and update selections
      .transition().duration(1000)
      .attrTween("d", (d: any) => arcTween(d, arc));

    slice.exit().remove();

    const text = svg.select(".labels")
      .selectAll("text")
      .data(pie(pieData), key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text((d : any) => d.data.name)
      .merge(text) // Merge enter and update selections
      .transition().duration(1000)
      .attrTween("transform", (d : any) => textTween(d))
      .styleTween("text-anchor", textAnchorTween);

    text.exit().remove();

    // SLICE TO TEXT POLYLINES
    const polylineTween = (a: any) => {
      const current = { ...a };
      return (t: any) => {
        const interpolate = d3.interpolate(current, a);
        const d2 = interpolate(t);
        const pos = outerArc.centroid(d2);
        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
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