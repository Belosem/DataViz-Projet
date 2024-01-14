import { Injectable } from '@angular/core';
import EventsData from '../../assets/data/events/ukraineConflictEventPoints.json';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConflictsService {
  public AllEvents: any = [];

  public selectedEvents : Map<any, any> = new Map();
  public selectedEvents$ : BehaviorSubject<Map<any, any>> = new BehaviorSubject<Map<any, any>>(this.selectedEvents);

  public startDate : string = ""
  public startDate$ : BehaviorSubject<string> = new BehaviorSubject<string>(this.startDate);

  public endDate : string = "";
  public endDate$ : BehaviorSubject<string> = new BehaviorSubject<string>(this.endDate);
  
  public selectedDetailedEvents : [] = []
  public selectedDetailedEvents$ : BehaviorSubject<[]> = new BehaviorSubject<[]>(this.selectedDetailedEvents);

  public regionName : string = "World";
  public regionName$ : BehaviorSubject<string> = new BehaviorSubject<string>(this.regionName);
  
  constructor() { 
    this.AllEvents = EventsData;
  }

  public getAllEvents(): any[] {
    return this.AllEvents;
  }

  public setEventsBySelectedPeriod(events : Map<any, any>, startDate : string, endDate : string) : void {
    this.selectedEvents$.next(events);
  }

  public getSelectedEvents() : Map<any, any> {
    return this.selectedEvents;
  }

  public setStartDate(date : string) : void {
    this.startDate$.next(date);
  }

  public getStartDate() : string {
    return this.startDate;
  }

  public setEndDate(date : string) : void {
    this.endDate$.next(date);
  }

  public getEndDate() : string {
    return this.endDate;
  }

  public setSelectedDetailedEvents(events : []) : void {
    this.selectedDetailedEvents$.next(events);
  }

  public getSelectedDetailedEvents() : [] {
    return this.selectedDetailedEvents;
  }

  public setRegionName(region : string) : void {
    this.regionName$.next(region);
  }

  public getRegionName() : string {
    return this.regionName;
  }

}
