import { DraftPokemon } from './draft-pokemon.model';

export interface Team {
  name: string;
  pokemon: DraftPokemon[];
  expanded?: boolean;
}