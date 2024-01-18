import { Injectable } from '@angular/core';
import EventsData from '../../assets/data/events/ukraineConflictEventPoints.json';
import { BehaviorSubject, retry } from 'rxjs';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class ConflictsService {
  public AllEvents: any = [];

  public selectedEvents: Map<any, any> = new Map();
  public selectedEvents$: BehaviorSubject<Map<any, any>> = new BehaviorSubject<Map<any, any>>(this.selectedEvents);

  public startDate: string = ""
  public startDate$: BehaviorSubject<string> = new BehaviorSubject<string>(this.startDate);

  public endDate: string = "";
  public endDate$: BehaviorSubject<string> = new BehaviorSubject<string>(this.endDate);

  public selectedDetailedEvents: [] = []
  public selectedDetailedEvents$: BehaviorSubject<[]> = new BehaviorSubject<[]>(this.selectedDetailedEvents);

  public regionName: string = "World";
  public regionName$: BehaviorSubject<string> = new BehaviorSubject<string>(this.regionName);

  public icon_labelsMap: Map<string, string> = new Map([]);

  public eventType_colorsMap: Map<string, string> = new Map([]);

  public filteredEvents$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);

  constructor() {
    this.AllEvents = EventsData;
    this.createIconLabelsMap().then(icon_labelsMap => {
      this.icon_labelsMap = icon_labelsMap;
    }).catch(error => {
      console.error("Error loading the file:", error);
    });
  }

  private createIconLabelsMap(): Promise<Map<string, string>> {
    return new Promise((resolve, reject) => {
      let icon_labelsMap: Map<string, string> = new Map([]);
      let reader = new FileReader();
      fetch("../../assets/iconsWar/deobfuscation_icon_geo_confirmed.csv")
        .then(response => response.blob())
        .then(blob => {
          reader.readAsText(blob);
          reader.onload = () => {
            let text = reader.result as string;
            let iconLabelsCSV = text.split("\n");
            iconLabelsCSV.forEach((row: any) => {
              let rowSplit = row.split(",");
              // remove "\r" in the end of the string
              rowSplit[1] = rowSplit[1].slice(0, -1);
              icon_labelsMap.set(rowSplit[0], rowSplit[1]);
            });
            resolve(icon_labelsMap);
          };
          reader.onerror = (error) => reject(error);
        })
        .catch(error => reject(error));
    });
  }

  public createEventTypeColorsMap(eventTypes: []) {
    let eventType_colorsMap: Map<string, string> = new Map([]);
    const base_colors: string[] = [
      "#0051CA", // UA
      "#E00000", // RU
      "#AC7339", // NEUTRAL
      "#0A5900", // NATO
      "#666666" // OTHER
      ];
    let color: string = "";
    eventTypes.forEach((eventType: any) => {
      // 3 Base colors : UA, RU, NATO, NEUTRAL, OTHER
      if (eventType.includes('UA')) {
        // Create a variant of the base color for UA
        color = d3.rgb(base_colors[0]).toString();
      }
      else if (eventType.includes('RU')) {
        // Create a variant of the base color for RU
        color = d3.rgb(base_colors[1]).toString();
      }
      else if (eventType.includes('NEUTRAL')) {
        // Create a variant of the base color for NEUTRAL
        color = d3.rgb(base_colors[2]).toString();
      }
      else if (eventType.includes('NATO')) {
        // Create a variant of the base color for OTHER
        color = d3.rgb(base_colors[3]).toString();
      }
      else {
        // Create a variant of the base color for OTHER
        color = d3.rgb(base_colors[4]).toString();
      }
      eventType_colorsMap.set(eventType, color);
    });
    this.eventType_colorsMap = eventType_colorsMap;

  }

  public getEventTypeColor(eventType: string) {
    return this.eventType_colorsMap.get(eventType);
  }

  public getAllEvents(): any[] {
    return this.AllEvents;
  }

  public setEventsBySelectedPeriod(events: Map<any, any>, startDate: string, endDate: string): void {
    this.selectedEvents$.next(events);
    this.startDate$.next(startDate);
    this.endDate$.next(endDate);
  }

  public getSelectedEvents(): Map<any, any> {
    return this.selectedEvents;
  }

  public setStartDate(date: string): void {
    this.startDate$.next(date);
  }

  public getStartDate(): string {
    return this.startDate;
  }

  public setEndDate(date: string): void {
    this.endDate$.next(date);
  }

  public getEndDate(): string {
    return this.endDate;
  }

  public setSelectedDetailedEvents(events: []): void {
    this.selectedDetailedEvents$.next(events);
  }

  public getSelectedDetailedEvents(): [] {
    return this.selectedDetailedEvents;
  }

  public setRegionName(region: string): void {
    this.regionName$.next(region);
  }

  public getRegionName(): string {
    return this.regionName;
  }

  public getLabelByIcon(icon: string) {
    if (this.icon_labelsMap.get(icon))
      return this.icon_labelsMap.get(icon)
    else
      return icon;
  }

  public setFilteredEvents(events: []): void {
    this.filteredEvents$.next(events);
  }
  
}
