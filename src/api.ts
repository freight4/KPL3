import * as fs from "fs";
import * as PS from "pokemon-showdown";
const Dex = PS.Dex;
import { TypeChart } from "pokemon-showdown/dist/data/typechart";
import { Pokemon } from "./classes/Pokemon";
import { Species } from "./types/Species";


//get type charts from pokemon api 
// const typechart = Dex.TypeDataTable
// const typejson = JSON.stringify(typechart, null, 2);
// fs.writeFile("src/outputs/typechartjson.json", TypeChart, (err: NodeJS.ErrnoException | null) => {
//   if (err) {
//     console.error("Error writing JSON file:", err);
//   } else {
//     console.log("JSON file has been saved.");
//   }
// });
console.log(TypeChart)


// const tiers = ['OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC']
const tiers = ['OU']
const banned = [
  'Ogerpon-Teal-Tera', 'Ogerpon-Wellspring-Tera', 'Ogerpon-Cornerstone-Tera', "Pikachu-Original", "Pikachu-Hoenn", "Pikachu-Sinnoh", "Pikachu-Unova", "Pikachu-Kalos", "Pikachu-Alola", "Pikachu-Partner", "Pikachu-Starter", "Pikachu-World", "Pikachu-Rock-Star", "Pikachu-Belle", "Pikachu-Pop-Star", "Pikachu-PhD", "Pikachu-Libre", "Pikachu-Cosplay"
      
]

// #write the raw output to json file for logging 
const raw_specs = Dex.species.all().filter((obj: any) =>
  tiers.includes(obj.tier ?? "") &&
  !banned.includes(obj.name)
);

const rawput = JSON.stringify(raw_specs, null, 2);

fs.writeFile("src/outputs/rawlist.json", rawput, (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved.");
  }
});

const pokemonList = raw_specs.map((sp: any) => new Pokemon(sp));
const specslist = JSON.stringify(pokemonList, null, 2);


fs.writeFile("src/outputs/specslist.json", specslist, (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved.");
  }
});

