import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pokemon } from '../classes/Pokemon';
import { Pokedex } from '../classes/Pokedex';

@Injectable({
  providedIn: 'root'
})
export class PokedexService {
  private dataUrl = 'app/outputs/current/pokemon-data.json';

  constructor(private http: HttpClient) {}

  /**
   * Loads the Pokemon data from JSON and returns a Pokedex instance
   */
  loadPokedex(): Observable<Pokedex> {
    return this.http.get<any[]>(this.dataUrl).pipe(
      map(pokemonData => {
        // Convert plain objects back to Pokemon instances
        const pokemonList = pokemonData.map(data => {
          const pokemon = new Pokemon(data);
          // Restore learnset if it exists
          if (data.learnset) {
            pokemon.applyLearnset(data.learnset);
          }
          return pokemon;
        });
        
        return new Pokedex(pokemonList);
      })
    );
  }

  /**
   * Loads raw Pokemon data without creating Pokedex
   */
  loadPokemonList(): Observable<Pokemon[]> {
    return this.http.get<any[]>(this.dataUrl).pipe(
      map(pokemonData => 
        pokemonData.map(data => {
          const pokemon = new Pokemon(data);
          if (data.learnset) {
            pokemon.applyLearnset(data.learnset);
          }
          return pokemon;
        })
      )
    );
  }
}
