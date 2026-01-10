import { Component } from '@angular/core';

@Component({
  selector: 'app-schedule',
  standalone: true,
  templateUrl: './schedule_builder.component.html'
})
export class ScheduleBuilderComponent  {

  teams = [
    { name: 'Team A' },
    { name: 'Team B' },
    { name: 'Team C' },
    { name: 'Team D' },
  ];

  schedule: Array<[any, any]> = [];

  generateSchedule() {
  const teamCopy = [...this.teams];
  this.schedule = [];  // reset

  while (teamCopy.length >= 2) {
    const team1 = teamCopy.shift();
    const team2 = teamCopy.shift();
    this.schedule.push([team1, team2]);
  }

  if (teamCopy.length === 1) {
    this.schedule.push([teamCopy[0], { name: 'BYE' }]);
  }
  }

  shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

}