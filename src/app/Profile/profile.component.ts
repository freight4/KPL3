
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../User/user';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {
  showProfile = false;
  isLoggedIn = true;

  currentRecord = "0 Wins, 0 Losses"
  currentStanding = "1st"




  constructor(private userService: UserService) {}
  get teamName() {
    return this.userService.teamName;
  }

  get discordName() {
    return this.userService.discordName;
  }

 

  viewProfile() {
    this.showProfile = true;
    console.log('Opening profile');
    
  }

  login() {
  // Redirect to your Discord login endpoint
  window.location.href = 'http://localhost:4200/login';
  this.isLoggedIn = true; 
  }

  logout() {
    console.log('Logging out');
    this.isLoggedIn = false; 
    
    this.userService.teamName = "";
    this.userService.discordName = "";
    window.location.href = 'http://localhost:4200/login';
    // Add Discord logout API integration here.

    
  }

  closeProfile() {
  this.showProfile = false;
  }

 

}
