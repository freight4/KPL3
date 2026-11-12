import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProfileComponent } from './Profile/profile.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,   // Provides *ngIf
    RouterModule,   // Provides routerLink
    RouterOutlet,   // Provides router-outlet
    ProfileComponent
  ],
  templateUrl: './app.html',
  styleUrl : './app.css'
})
export class AppComponent {

  profileOpen = false;

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

}