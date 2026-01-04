import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { getPokemonPool } from './Pokemon/pokemon-pool';
import { Team } from './Team/team.model';
import { DraftPokemon } from './Team/draft-pokemon.model';

import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-draft',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './draft.component.html'
})

export class DraftComponent {

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

  pokemonPool: DraftPokemon[] = getPokemonPool();

  // Accordion state
  tierExpanded: { [tier: string]: boolean } = {};

  toggleTier(tier: string) {
    this.tierExpanded[tier] = !this.tierExpanded[tier];
  }
  removePokemon(team: Team, pokemon: DraftPokemon) {
  team.pokemon = team.pokemon.filter(p => p.name !== pokemon.name);
}
  
  filterPokemonByName(pokemon: DraftPokemon[]): DraftPokemon[] {
  if (!this.searchTerm) return pokemon;
  const term = this.searchTerm.toLowerCase();
  return pokemon.filter(p => p.name.toLowerCase().includes(term));
}

draftPokemon(team: Team, p: DraftPokemon) {
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
  team.pokemon.push({ ...p });
}

getTotalCost(team: Team): number {
  return team.pokemon.reduce((sum, p) => sum + (p.cost || 0), 0);
}

  toggleTeam(team: Team) {
    team.expanded = !team.expanded;
  }
getTeraCaptainCount(team: Team): number {
  return team.pokemon.filter(p => p.isTeraCaptain).length;
}
  
toggleTeraCaptain(team: Team, pokemon: DraftPokemon) {
  // Helper: define extra cost by tier
  const tierCostMap: { [tier: string]: number } = {
    'OU': 2,
    'UUBL': 2,
    'UU': 1,
    'RUBL': 1,
    'NUBL': 1,
    'NU': 1,
    'PUBL': 1,
    'PU': 1,
    'ZUBL': 0.5,
    'ZU': 0.5,
    'NFE': 0.5,
    'LC': 0.5
  };

  const extraCost = tierCostMap[pokemon.tier] ?? 1; // default 1 if tier missing

  if (pokemon.isTeraCaptain) {
    // Turn off Tera Captain: subtract tier-specific cost
    pokemon.isTeraCaptain = false;
    if (pokemon.cost !== undefined) {
      pokemon.cost -= extraCost;
    }
  } else {
    // Only allow ONE Tera Captain per team
    team.pokemon.forEach(p => {
      if (p.isTeraCaptain) {
        const oldExtra = tierCostMap[p.tier] ?? 1;
        p.isTeraCaptain = false;
        if (p.cost !== undefined) {
          p.cost -= oldExtra; // remove extra cost from previous Tera Captain
        }
      }
    });

    // Set the selected Pokémon as Tera Captain
    pokemon.isTeraCaptain = true;
    if (pokemon.cost !== undefined) {
      pokemon.cost += extraCost; // add tier-specific extra cost
    }
  }
}

  // Helpers
getTiers(): string[] {
  // Get all unique tiers in the pool
  const tiers = Array.from(new Set(this.pokemonPool.map(p => p.tier)));

  // Sort according to custom order
  return tiers.sort((a, b) => {
    const indexA = this.tierOrder.indexOf(a);
    const indexB = this.tierOrder.indexOf(b);

    // If a tier isn’t in the custom order, push it to the end
    const posA = indexA === -1 ? 999 : indexA;
    const posB = indexB === -1 ? 999 : indexB;

    return posA - posB;
  });
}

  getPokemonByTier(tier: string): DraftPokemon[] {
    return this.pokemonPool.filter(p => p.tier === tier);
  }

  isDrafted(p: DraftPokemon): boolean {
    return this.teams.some(team =>
      team.pokemon.some(d => d.name === p.name)
    );
  }

draftPokemonByName(p: DraftPokemon, teamName: string) {
  const team = this.teams.find(t => t.name === teamName);
  if (!team) return;

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
  team.pokemon.push({ ...p });
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
  this.currentPickIndex = 0; // reset to first pick
}

searchTerm: string = '';

// Call this whenever the search input changes
onSearchChange() {
  const term = this.searchTerm.toLowerCase().trim();

  if (!term) {
    // Collapse all tiers when search is empty
    this.getTiers().forEach(tier => this.tierExpanded[tier] = false);
    return;
  }
  // Auto-expand tiers that have matching Pokémon
  this.getTiers().forEach(tier => {
    const matches = this.getPokemonByTier(tier)
      .some(p => p.name.toLowerCase().includes(term));
    this.tierExpanded[tier] = matches;
  });
}
getFilteredPokemonByTier(tier: string): DraftPokemon[] {
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