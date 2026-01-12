import { Component } from '@angular/core';
import { Team } from '../Draft/Team/team.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule_builder.component.html'
})
export class ScheduleBuilderComponent {

  teams: Team[] = [
    { name: 'Santa Barbara Snom', pokemon: [], expanded: false },
    { name: 'Minnesota Golden Bidoof', pokemon: [], expanded: false },
    { name: 'Dragonairs Dad', pokemon: [], expanded: false },
    { name: 'The Biggest Snepcineroar Fan', pokemon: [], expanded: false },
    { name: 'The Scovillain Scourgers', pokemon: [], expanded: false },
    { name: 'The Tampa Bay Lanturns', pokemon: [], expanded: false },
    { name: 'The Orlando Oshawotts', pokemon: [], expanded: false },
    { name: 'Jonas B', pokemon: [], expanded: false },
    { name: 'EliteFourInch', pokemon: [], expanded: false },
    { name: 'Jack R', pokemon: [], expanded: false }
  ];

  schedule: {
    week: number;
    games: [Team, Team][];
  }[] = [];

  test_schedule: {
    week: number;
    games: [Team, Team][];
  }[] = [];

generateSchedule() {
  const teams = [...this.teams]; // 10 teams
  const totalWeeks = 3;
  const gamesPerTeamPerWeek = 3;
  const schedule: { week: number; games: [Team, Team][] }[] = [];

  // Generate all unique matchups
  const matchups: [Team, Team][] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchups.push([teams[i], teams[j]]);
    }
  }
 
  this.shuffle(matchups); // randomize order
  
  
  // Initialize week counters
  for (let w = 1; w <= totalWeeks; w++) {
    schedule.push({ week: w, games: [] });
  }
  console.log('All matchups stored in test_schedule:', schedule);
  // Track games assigned per week per team
  const gamesPerWeek = new Map<Team, number[]>();
  teams.forEach(team => gamesPerWeek.set(team, Array(totalWeeks).fill(0)));

  
  for (const [teamA, teamB] of matchups) {
    // Find a week where both teams have < 3 games
    for (let week = 0; week < totalWeeks; week++) {
      if (
        gamesPerWeek.get(teamA)![week] < gamesPerTeamPerWeek &&
        gamesPerWeek.get(teamB)![week] < gamesPerTeamPerWeek
      ) {
        schedule[week].games.push([teamA, teamB]);
        
        gamesPerWeek.get(teamA)![week]++;
        gamesPerWeek.get(teamB)![week]++;
        break;
      }
    }
  }

  this.schedule = schedule;
}

  shuffle(array: any[]) {
    for (let i = array.length -1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  exportScheduleToCSV() {
  const rows: string[] = [];
  rows.push('Week,Home Team,Away Team');

  this.schedule.forEach(week => {
    week.games.forEach(game => {
      rows.push(
        `${week.week},"${game[0].name}","${game[1].name}"`
      );
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'league_schedule.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}
