const {Dex} = require('pokemon-showdown');
const fs = require('fs');


const tiers = ['OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC']
// const banned = ['Gimmighoul-Roaming', 'Treecko']
const banned = [
  'Ogerpon-Teal-Tera', 'Ogerpon-Wellspring-Tera', 'Ogerpon-Cornerstone-Tera', "Pikachu-Original", "Pikachu-Hoenn", "Pikachu-Sinnoh", "Pikachu-Unova", "Pikachu-Kalos", "Pikachu-Alola", "Pikachu-Partner", "Pikachu-Starter", "Pikachu-World", "Pikachu-Rock-Star", "Pikachu-Belle", "Pikachu-Pop-Star", "Pikachu-PhD", "Pikachu-Libre", "Pikachu-Cosplay"
      
]

const specs = Dex.species.all().filter(obj => 
    tiers.includes(obj.tier)
    && ! banned.includes(obj.name));

const output = JSON.stringify(specs, null, 2)


fs.writeFile('pokemon.json', output, (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
  } else {
    console.log('JSON file has been saved.');
  }
});

