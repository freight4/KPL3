
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {

  

  

  viewProfile() {
    console.log('Opening profile');
    
  }

  logout() {
    console.log('Logging out');

    // Add Discord logout API integration here.

    
  }

}
