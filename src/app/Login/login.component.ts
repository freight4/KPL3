
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../User/user';
import { PokeballTransitionComponent } from '../pokeball-transition/pokeball-transition';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    PokeballTransitionComponent
  ],
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

  // Pokeball Animation
  showPokeballAnimation = false;

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

  // =========================================
  // POKEBALL ANIMATION
  // =========================================

 
playPokeballAnimation(action: 'guest' | 'discord' | 'team'): void {
  if (this.showPokeballAnimation || this.isSaving) return;

  if (action === 'discord') {
    this.loginWithDiscord();
    return;
  }

  if (action === 'team' && !this.newTeamName.trim()) {
    this.errorMessage = 'Please enter a team name.';
    return;
  }

  this.errorMessage = '';
  this.showPokeballAnimation = true;

  setTimeout(() => {
    if (action === 'guest') {
      this.continueAsGuest();
    } else {
      this.submitTeamName();
    }
  }, 1800);
}


  // =========================================
  // DISCORD LOGIN
  // =========================================

  loginWithDiscord(): void {
  window.open(`${this.API_URL}/auth/discord/login`, '_blank');
}

  handleDiscordResponse = (event: MessageEvent) => {

  if (event.origin !== this.API_URL) return;
  if (event.data?.type !== 'KPL_DISCORD_AUTH') return;

  const response = event.data.user;

  // Save authenticated user information
  this.userService.setDiscordInfo(response);

  // Bring the original login page into focus
  window.focus();

  // Trigger the Pokeball animation
  this.showPokeballAnimation = true;

  // Wait for the animation to finish
  setTimeout(() => {

    if (response.needs_team_name || !response.team_name) {
      this.router.navigateByUrl('/create-team');
    } else {
      this.router.navigateByUrl('/draft');
    }

  }, 50);
};

  // =========================================
  // TEAM REGISTRATION
  // =========================================

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

  // =========================================
  // GUEST LOGIN
  // =========================================

  continueAsGuest() {

    this.userService.setGuest();

    this.router.navigateByUrl('/draft');

  }

}
