// import { DraftPokemon } from './draft-pokemon.model';

// export interface Team {
//   name: string;
//   pokemon: DraftPokemon[];
//   expanded?: boolean;
// }

import { Pokemon } from '../../classes/Pokemon';

export interface Team {
  name: string;
  pokemon: Pokemon[];  // Changed from DraftPokemon[]
  expanded?: boolean;
}