
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../User/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  private API_URL = 'http://localhost:8000';

  // Team Registration Variables
  showTeamNameForm = false;
  newTeamName = '';
  isSaving = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    window.addEventListener('message', this.handleDiscordResponse);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleDiscordResponse);
  }

  // Open Discord authentication in a new tab
  loginWithDiscord() {
    window.open(
      `${this.API_URL}/auth/discord/login`,
      '_blank'
    );
  }

  handleDiscordResponse = (event: MessageEvent) => {
  if (event.origin !== this.API_URL) return;
  if (event.data?.type !== 'KPL_DISCORD_AUTH') return;

  const response = event.data.user;

  this.userService.setDiscordInfo(response);

  if (response.needs_team_name || !response.team_name) {
    this.router.navigateByUrl('/create-team');
  } else {
    this.router.navigateByUrl('/draft');
  }
};

  // Submit New Team Name
  submitTeamName() {

    if (!this.newTeamName.trim()) {
      this.errorMessage = 'Please enter a team name.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.userService.updateTeamName(this.newTeamName.trim()).subscribe({

      next: (response) => {

        this.userService.teamName = response.team_name;

        console.log('Team Name:', this.userService.teamName);
        console.log('Discord Name:', this.userService.discordName);

        this.isSaving = false;
        this.router.navigateByUrl('/draft');

      },

      error: (error) => {

        console.error('Error saving team name:', error);

        this.errorMessage = 'Unable to save your team name. Please try again.';
        this.isSaving = false;

      }

    });

  }

  // Guest Login
  continueAsGuest() {

    this.userService.setGuest();

    this.router.navigateByUrl('/draft');

  }

}
