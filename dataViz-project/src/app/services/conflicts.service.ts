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
  public endDate : string = "";
  
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
}
