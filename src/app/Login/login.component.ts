
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../User/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  private API_URL = 'http://localhost:8000';

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

  // Receive Discord information from authentication tab
  handleDiscordResponse = (event: MessageEvent) => {

    if (event.origin !== this.API_URL) return;

    if (event.data?.type === 'KPL_DISCORD_AUTH') {

      const response = event.data.user;

      this.userService.setDiscordInfo(response);

      console.log('Team Name:', this.userService.teamName);
      console.log('Discord Name:', this.userService.discordName);

      this.router.navigateByUrl('/draft');
    }
  };

  // Guest Login
  continueAsGuest() {
    this.userService.setGuest();
    this.router.navigateByUrl('/draft');
  }


}
