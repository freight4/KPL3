
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pokeball-transition',
  standalone: true,
  templateUrl: './pokeball-transition.html',
  styleUrl: './pokeball-transition.css'
})
export class PokeballTransitionComponent {
  @Input() active = false;
}
