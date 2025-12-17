// src/app/data/pokedex.ts
import { Pokemon } from './Pokemon';

type Comparison = '>' | '<' | '>=' | '<=' | '=';

interface AttributeFilter {
  tier?: string;
  name?: string;
  types?: string[];
  abilities?: string[];
  moves?: string[];
  bst?: { value: number; comparison: Comparison };
  ebst?: { value: number; comparison: Comparison };
  hasAltForme?: boolean;
}

interface FilterGroup {
  operator: 'AND' | 'OR';
  filters: (AttributeFilter | FilterGroup)[];
}

export class Pokedex {
  pokemons: Pokemon[];

  constructor(pokemons: Pokemon[]) {
    this.pokemons = pokemons;
  }

  filter(group: FilterGroup): Pokemon[] {
    const evaluate = (pokemon: Pokemon, filter: AttributeFilter | FilterGroup): boolean => {
    try {
        if ('operator' in filter) {
        const results = filter.filters.map(f => evaluate(pokemon, f));
        return filter.operator === 'AND'
            ? results.every(Boolean)
            : results.some(Boolean);
        } else {
        let pass = true;

        if (filter.tier) pass = pass && pokemon.tier === filter.tier;
        if (filter.name) pass = pass && pokemon.name === filter.name;
        if (filter.types) pass = pass && filter.types.some(t => pokemon.types?.includes(t));
        if (filter.abilities) pass = pass && filter.abilities.some(a => pokemon.abilities?.includes(a));
        if (filter.moves) pass = pass && filter.moves.some(m => pokemon.learnset?.includes(m));
        if (filter.bst) pass = pass && compareNumber(pokemon.baseStatTotal ?? 0, filter.bst.comparison, filter.bst.value);
        if (filter.ebst) pass = pass && compareNumber(pokemon.effectiveBaseStatTotal ?? 0, filter.ebst.comparison, filter.ebst.value);
        if (filter.hasAltForme !== undefined) {
            const hasForme = pokemon.forme !== ""; 
            pass = pass && (filter.hasAltForme ? hasForme : !hasForme);
            }
        return pass;
        }
    } catch (e) {
        // If anything goes wrong (missing property, unexpected type), just skip this Pokemon
        return false;
    }
    };

    const compareNumber = (a: number, comparison: Comparison, b: number) => {
    switch (comparison) {
        case '>': return a > b;
        case '<': return a < b;
        case '>=': return a >= b;
        case '<=': return a <= b;
        case '=': return a === b;
    }
    };


    return this.pokemons.filter(pokemon => evaluate(pokemon, group));
  }
}
