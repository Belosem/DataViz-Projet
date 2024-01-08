import { Component } from '@angular/core';
import { ConflictsService } from '../../services/conflicts.service';

@Component({
  selector: 'app-conflict-pannel',
  templateUrl: './conflict-pannel.component.html',
  styleUrls: ['./conflict-pannel.component.scss']
})
export class ConflictPannelComponent {
  events : any = [];

  constructor(private conflictsService: ConflictsService) {
    console.log('conflict pannel constructor');
    this.events = this.conflictsService.getEvents();
    console.log(this.events);
  }
}
