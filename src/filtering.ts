import * as fs from "fs";
import { Pokedex } from './classes/Pokedex';
import { fullPokedex } from './api';


// const filtered = fullPokedex.filter({
//   operator: 'OR',
//   filters: [
//     { operator: 'AND', filters: [{ moves: ['throat-chop'] }, { types: ['dark'] }] },
//     { operator: 'AND', filters: [{ bst: { comparison: '>', value: 400 } }, { tier: 'NU' }, { hasAltForme: true}] }
//   ]
// });

// const filtered = fullPokedex.filter({
//   operator: 'OR',
//   filters: [
//     { tier: 'OU' }, { tier: 'UU' }
//   ]
// });

const filtered = fullPokedex.filter({
  operator: 'AND',
  filters: [
  {operator: 'OR',   filters: [{ hasAltForme: true }] },
  {operator: 'OR',   filters: [{ name: 'Ninetales' }, { name: 'Ninetales-Alola' } ] } ]

});

const filteredjson = JSON.stringify(filtered, null, 2);

fs.writeFile("src/outputs/test/filterlist.json", filteredjson, (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved.");
  }
});