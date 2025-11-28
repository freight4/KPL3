import * as fs from "fs";
import * as PS from "pokemon-showdown";
const Dex = PS.Dex;
import { Pokemon } from "./classes/Pokemon";




// const tiers = ['OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC']
// const tiers = ['OU']
// const tiers = ['ZUBL']
// const banned = [
//   'Ogerpon-Teal-Tera', 'Ogerpon-Wellspring-Tera', 'Ogerpon-Cornerstone-Tera', "Pikachu-Original", "Pikachu-Hoenn", "Pikachu-Sinnoh", "Pikachu-Unova", "Pikachu-Kalos", "Pikachu-Alola", "Pikachu-Partner", "Pikachu-Starter", "Pikachu-World", "Pikachu-Rock-Star", "Pikachu-Belle", "Pikachu-Pop-Star", "Pikachu-PhD", "Pikachu-Libre", "Pikachu-Cosplay"
      
// ]

// #write the raw output to json file for logging 
// const raw_specs = Dex.species.all().filter((obj: any) =>
//   tiers.includes(obj.tier ?? "") &&
//   !banned.includes(obj.name)
// );
const testmons = ["Bisharp", "Rillaboom", "Ninetales", "Ninetales-Alola"]
const emptystring = ""

const raw_specs = Dex.species.all().filter((obj: any) =>
  testmons.includes(obj.name) 
  // &&  !emptystring.includes(obj.forme)
);

const rawput = JSON.stringify(raw_specs, null, 2);

fs.writeFile("src/outputs/current/rawlist.json", rawput, (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved.");
  }
});

const pokemonList = raw_specs.map((sp: any) => new Pokemon(sp));
const specslist = JSON.stringify(pokemonList, null, 2);


fs.writeFile("src/outputs/current/specslist.json", specslist, (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved.");
  }
});

console.log(pokemonList[0].teraCost)
