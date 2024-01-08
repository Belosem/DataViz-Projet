import { Injectable } from '@angular/core';
import EventsData from '../../assets/data/events/ukraineConflictEventPoints.json';

@Injectable({
  providedIn: 'root'
})
export class ConflictsService {
  public events: any = [];

  constructor() { 
    this.events = EventsData;
  }

  public getEvents(): any[] {
    return this.events;
  }
}
