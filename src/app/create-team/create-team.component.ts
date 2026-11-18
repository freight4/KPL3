
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../User/user';
import { PokeballTransitionComponent } from '../pokeball-transition/pokeball-transition';

@Component({
  selector: 'app-create-team',
  standalone: true,
  imports: [
    FormsModule,
    PokeballTransitionComponent
  ],
  templateUrl: './create-team.component.html',
  styleUrl: './create-team.component.css'
})
export class CreateTeamComponent {

  teamName = '';
  isSaving = false;
  errorMessage = '';

  // Pokeball Animation
  showPokeballAnimation = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  // =========================================
  // POKEBALL ANIMATION
  // =========================================

  playPokeballAnimation(): void {

  if (this.showPokeballAnimation || this.isSaving) return;

  if (!this.teamName.trim()) {
    this.errorMessage = 'Please enter a team name.';
    return;
  }

  this.errorMessage = '';
  this.showPokeballAnimation = true;

  setTimeout(() => {
    this.submitTeamName();
  }, 1800);
}

  // =========================================
  // SUBMIT TEAM NAME
  // =========================================

  submitTeamName() {

    const name = this.teamName.trim();

    if (!name) {
      this.errorMessage = 'Please enter a team name.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.userService.updateTeamName(name).subscribe({

      next: (response) => {

        this.userService.teamName = response.team_name;

        this.router.navigateByUrl('/draft');

      },

      error: (error) => {

        console.error('Error creating team:', error);

        this.errorMessage =
          error.error?.detail || 'Unable to create your team. Please try again.';

        this.isSaving = false;

        // Allow the user to retry after an API failure
        this.showPokeballAnimation = false;

      }

    });
  }
}
