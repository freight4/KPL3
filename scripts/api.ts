import * as fs from "fs";
import * as PS from "pokemon-showdown";
const Dex = PS.Dex;
import { Pokemon } from "./classes/Pokemon";
import { Pokedex } from './classes/Pokedex';


// async function fetchPokemonData(name: string) {
//   const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
//   if (!response.ok) throw new Error(`Failed to fetch ${name}`);
//   return response.json();
// }

// async function fetchAllPokemonData(names: string[]) {
//   const promises = names.map(name => fetchPokemonData(name));
//   const results = await Promise.all(promises); // waits for all requests to finish
//   return results;
// }


// async function enrichPokemonLearnsets(pokemonList: Pokemon[]) {
//   // Get the list of names
//   const names = pokemonList.map(p => p.name);

//   const apiData = await fetchAllPokemonData(names);
//   const moves = apiData[0].moves.map((m: any) => m.move.name);


//   // Loop through both lists
//   apiData.forEach((data, index) => {
//     const moves = data.moves.map((m: any) => m.move.name); // extract just the move names
//     pokemonList[index].applyLearnset(moves); // apply to the Pokémon object
//   });
// }

async function enrichPokemonLearnsets(pokemonList: Pokemon[]) {
  const names = pokemonList.map(p => p.name);

  // Wrap each fetch in a try/catch so one failure doesn't stop everything
  const results = await Promise.all(
    names.map(async (name, index) => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) throw new Error(`Failed to fetch ${name}`);
        const data = await response.json();

        // Extract moves and apply to the Pokémon object
        const moves = data.moves.map((m: any) => m.move.name);
        pokemonList[index].applyLearnset(moves);

        return { success: true, name };
      } catch (err) {
        console.warn(`Failed to fetch learnset for ${name}:`, err);
        // optionally mark the Pokémon as failed
        (pokemonList[index] as any).learnsetFailed = true;
        return { success: false, name };
      }
    })
  );

  // Optional: log summary
  const failed = results.filter(r => !r.success).map(r => r.name);
  if (failed.length) console.log("Learnset fetch failed for:", failed.join(", "));
}



const tiers = ['OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC']
// const tiers = ['OU']
// const tiers = ['ZUBL']
const banned = [
  'Ogerpon-Teal-Tera', 'Ogerpon-Wellspring-Tera', 'Ogerpon-Cornerstone-Tera', "Pikachu-Original", "Pikachu-Hoenn", "Pikachu-Sinnoh", "Pikachu-Unova", "Pikachu-Kalos", "Pikachu-Alola", "Pikachu-Partner", "Pikachu-Starter", "Pikachu-World", "Pikachu-Rock-Star", "Pikachu-Belle", "Pikachu-Pop-Star", "Pikachu-PhD", "Pikachu-Libre", "Pikachu-Cosplay"
      
] //need to go through and complete list of banned/repeated mons

// #write the raw output to json file for logging 
const raw_specs = Dex.species.all().filter((obj: any) =>
  tiers.includes(obj.tier ?? "") &&
  !banned.includes(obj.name)
);

// const testmons = ["Bisharp", "Rillaboom", "Ninetales", "Ninetales-Alola", "Clodsire"]
// const emptystring = ""
// const raw_specs = Dex.species.all().filter((obj: any) =>
//   testmons.includes(obj.name) 
//   // &&  !emptystring.includes(obj.forme)
// );

const rawput = JSON.stringify(raw_specs, null, 2);

fs.writeFile("src/outputs/current/rawlist.json", rawput, (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved.");
  }
});

const pokemonList = raw_specs.map((sp: any) => new Pokemon(sp));


// console.log(pokemonList[0].teraCost)
// console.log("types:", pokemonList[0].types);

const names = pokemonList.map((pokemon: Pokemon) => pokemon.name);
// console.log(names)



enrichPokemonLearnsets(pokemonList).then(() => {
  const specslist = JSON.stringify(pokemonList, null, 2);
  fs.writeFile(
    "src/outputs/current/specslist.json",
    specslist,
    (err: NodeJS.ErrnoException | null) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON file has been saved.");
      }
    }
  );
}).catch((err) => {
  console.error("Error enriching Pokémon:", err);
});

export const fullPokedex = new Pokedex(pokemonList);

//meant for import on angular side with following code:
//
// see filtering.ts for exmaple usage