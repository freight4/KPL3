import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,   // 🔴 REQUIRED for routerLink
    RouterOutlet
  ],
  templateUrl: './app.html'
})
export class AppComponent {}
