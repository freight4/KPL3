import { DraftPokemon } from '../Team/draft-pokemon.model';
// Static import version (for build-time JSON)
import pokemonJson from './Pokemon.json';
export function getPokemonPool(): DraftPokemon[] {
  return (pokemonJson as any[]).map(p => ({
    name: p.name,
    tier: p.tier,
    cost: getDefaultCost(p.tier),
    isTeraCaptain: false
  }));
}

function getDefaultCost(tier: string): number {
  switch (tier) {
    case 'OU': return 10;
    case 'UUBL': return 9;
    case 'UU': return 8;
    case 'RUBL': return 7;
    case 'RU': return 6;
    case 'NUBL': return 5;
    case 'NU': return 4;
    case 'PUBL': return 4;
    case 'PU': return 3;
    case 'ZUBL': return 3;
    case 'ZU': return 2;
    case 'NFE': return 2;
    case 'LC': return 2;
    default: return 100;
  }
}