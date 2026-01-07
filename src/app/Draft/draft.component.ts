import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PokedexService } from '../services/pokedex.service';
import { Team } from './Team/team.model';
import { Pokemon } from '../classes/Pokemon'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-draft',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './draft.component.html'
})

export class DraftComponent implements OnInit {

  teams: Team[] = [
    { name: 'Santa Barbara Snom', pokemon: [], expanded: false },
    { name: 'Minnesota Golden Bidoof', pokemon: [], expanded: false },
    { name: 'Alex D', pokemon: [], expanded: false },
    { name: 'Jake L', pokemon: [], expanded: false },
    { name: 'The Scovillain Scourgers', pokemon: [], expanded: false },
    { name: 'The Tampa Bay Lanturns', pokemon: [], expanded: false },
    { name: 'Eileen C', pokemon: [], expanded: false },
    { name: 'Jonas B', pokemon: [], expanded: false },
    { name: 'EliteFourInch', pokemon: [], expanded: false },
    { name: 'Jack R', pokemon: [], expanded: false },
    { name: 'Alec L', pokemon: [], expanded: false }
  ];
  
  tierOrder: string[] = [
    'OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU',
    'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC'
  ];

  pokemonPool: Pokemon[] = [];
  loading = true;
  error: string | null = null;

  // Accordion state
  tierExpanded: { [tier: string]: boolean } = {};

  constructor(private pokedexService: PokedexService) {}

  ngOnInit(): void {
    // Load Pokemon data from the service
    this.pokedexService.loadPokedex().subscribe({
      next: (pokedex) => {
        this.pokemonPool = pokedex.pokemons;
        this.loading = false;
        console.log(`✅ Loaded ${this.pokemonPool.length} Pokemon for draft`);
      },
      error: (err) => {
        console.error('❌ Error loading Pokemon:', err);
        this.error = err.message || 'Failed to load Pokemon data';
        this.loading = false;
      }
    });
  }

  toggleTier(tier: string) {
    this.tierExpanded[tier] = !this.tierExpanded[tier];
  }

  removePokemon(team: Team, pokemon: Pokemon) {
    team.pokemon = team.pokemon.filter(p => p.name !== pokemon.name);
  }
  
  filterPokemonByName(pokemon: Pokemon[]): Pokemon[] {
    if (!this.searchTerm) return pokemon;
    const term = this.searchTerm.toLowerCase();
    return pokemon.filter(p => p.name.toLowerCase().includes(term));
  }

  draftPokemon(team: Team, p: Pokemon) {
    // Rule: max 8 Pokémon per team
    if (team.pokemon.length >= 8) {
      alert(`Each team can have a maximum of 8 Pokémon.`);
      return;
    }

    // Prevent duplicates
    if (this.isDrafted(p)) return;

    // Rule: max 2 OU/UUBL Pokémon per team
    if (['OU', 'UUBL'].includes(p.tier)) {
      const count = team.pokemon.filter(poke => ['OU', 'UUBL'].includes(poke.tier)).length;
      if (count >= 2) {
        alert(`Each team can have a maximum of 2 Pokémon from OU or UUBL tiers.`);
        return;
      }
    }

    // Add Pokémon to the team
    team.pokemon.push(p);
  }

  getTotalCost(team: Team): number {
    // Use the Pokemon class's cost getter
    return team.pokemon.reduce((sum, p) => sum + p.cost, 0);
  }

  toggleTeam(team: Team) {
    team.expanded = !team.expanded;
  }

  getTeraCaptainCount(team: Team): number {
    return team.pokemon.filter(p => p.isTeraCaptain).length;
  }
  
  toggleTeraCaptain(team: Team, pokemon: Pokemon) {
    // Use the Pokemon class's toggleTera method
    pokemon.toggleTera();
  }

  getTiers(): string[] {
    const tiers = Array.from(new Set(this.pokemonPool.map(p => p.tier)));
    return tiers.sort((a, b) => {
      const indexA = this.tierOrder.indexOf(a);
      const indexB = this.tierOrder.indexOf(b);
      const posA = indexA === -1 ? 999 : indexA;
      const posB = indexB === -1 ? 999 : indexB;
      return posA - posB;
    });
  }

  getPokemonByTier(tier: string): Pokemon[] {
    return this.pokemonPool.filter(p => p.tier === tier);
  }

  isDrafted(p: Pokemon): boolean {
    return this.teams.some(team =>
      team.pokemon.some(d => d.name === p.name)
    );
  }

  draftPokemonByName(p: Pokemon, teamName: string) {
    const team = this.teams.find(t => t.name === teamName);
    if (!team) return;

    if (team.pokemon.length >= 8) {
      alert(`Each team can have a maximum of 8 Pokémon.`);
      return;
    }

    if (this.isDrafted(p)) return;

    if (['OU', 'UUBL'].includes(p.tier)) {
      const count = team.pokemon.filter(poke => ['OU', 'UUBL'].includes(poke.tier)).length;
      if (count >= 2) {
        alert(`Each team can have a maximum of 2 Pokémon from OU or UUBL tiers.`);
        return;
      }
    }

    team.pokemon.push(p);
  }

  // Snake draft
  snakeDraftOrder: Team[] = [];
  draftRounds: number = 8;

  generateSnakeDraft() {
    const shuffled = [...this.teams].sort(() => Math.random() - 0.5);
    const order: Team[] = [];

    for (let round = 0; round < this.draftRounds; round++) {
      order.push(...(round % 2 === 0 ? shuffled : [...shuffled].reverse()));
    }

    this.snakeDraftOrder = order;
    this.currentPickIndex = 0;
  }

  searchTerm: string = '';

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.getTiers().forEach(tier => this.tierExpanded[tier] = false);
      return;
    }

    this.getTiers().forEach(tier => {
      const matches = this.getPokemonByTier(tier)
        .some(p => p.name.toLowerCase().includes(term));
      this.tierExpanded[tier] = matches;
    });
  }

  getFilteredPokemonByTier(tier: string): Pokemon[] {
    const term = this.searchTerm.toLowerCase().trim();
    return this.getPokemonByTier(tier)
               .filter(p => !term || p.name.toLowerCase().includes(term));
  }

  currentPickIndex = 0;

  get previousTeam(): Team | null {
    if (!this.snakeDraftOrder.length) return null;
    return this.currentPickIndex > 0
      ? this.snakeDraftOrder[this.currentPickIndex - 1]
      : null;
  }

  get currentTeam(): Team | null {
    if (!this.snakeDraftOrder.length) return null;
    return this.snakeDraftOrder[this.currentPickIndex];
  }

  get nextTeam(): Team | null {
    if (!this.snakeDraftOrder.length) return null;
    return this.currentPickIndex < this.snakeDraftOrder.length - 1
      ? this.snakeDraftOrder[this.currentPickIndex + 1]
      : null;
  }

  goToPreviousPick() {
    if (this.currentPickIndex > 0) {
      this.currentPickIndex--;
    }
  }

  goToNextPick() {
    if (this.currentPickIndex < this.snakeDraftOrder.length - 1) {
      this.currentPickIndex++;
    }
  }
}