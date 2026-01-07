import * as fs from "fs";
import * as path from "path";
import * as PS from "pokemon-showdown";
const Dex = PS.Dex;
import { Pokemon } from "@classes/Pokemon";

// Fetch learnsets from PokeAPI
async function enrichPokemonLearnsets(pokemonList: Pokemon[]) {
  const names = pokemonList.map(p => p.name);

  const results = await Promise.all(
    names.map(async (name, index) => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) throw new Error(`Failed to fetch ${name}`);
        const data = await response.json() as any; // Add 'as any' here

        const moves = data.moves.map((m: any) => m.move.name);
        pokemonList[index].applyLearnset(moves);

        return { success: true, name };
      } catch (err) {
        console.warn(`Failed to fetch learnset for ${name}:`, err);
        (pokemonList[index] as any).learnsetFailed = true;
        return { success: false, name };
      }
    })
  );

  const failed = results.filter(r => !r.success).map(r => r.name);
  if (failed.length) console.log("Learnset fetch failed for:", failed.join(", "));
}

// Configuration
const tiers = ['OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC'];
const banned = [
  'Ogerpon-Teal-Tera', 
  'Ogerpon-Wellspring-Tera', 
  'Ogerpon-Cornerstone-Tera', 
  "Pikachu-Original", 
  "Pikachu-Hoenn", 
  "Pikachu-Sinnoh", 
  "Pikachu-Unova", 
  "Pikachu-Kalos", 
  "Pikachu-Alola", 
  "Pikachu-Partner", 
  "Pikachu-Starter", 
  "Pikachu-World", 
  "Pikachu-Rock-Star", 
  "Pikachu-Belle", 
  "Pikachu-Pop-Star", 
  "Pikachu-PhD", 
  "Pikachu-Libre", 
  "Pikachu-Cosplay"
];

// Main execution
async function generatePokemonData() {
  console.log("🔍 Fetching Pokemon species data from Pokemon Showdown...");
  
  // Get raw species data
  const raw_specs = Dex.species.all().filter((obj: any) =>
    tiers.includes(obj.tier ?? "") &&
    !banned.includes(obj.name)
  );

  console.log(`📊 Found ${raw_specs.length} Pokemon`);

  // Create Pokemon objects
  const pokemonList = raw_specs.map((sp: any) => new Pokemon(sp));

  // Enrich with learnsets
  console.log("🌐 Fetching learnsets from PokeAPI...");
  await enrichPokemonLearnsets(pokemonList);

  // Ensure output directory exists - CHANGED THIS LINE
  const outputDir = path.join(__dirname, "..", "src", "app", "outputs", "current");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to JSON
  const outputPath = path.join(outputDir, "pokemon-data.json");
  const jsonData = JSON.stringify(pokemonList, null, 2);
  
  fs.writeFileSync(outputPath, jsonData, "utf8");
  console.log(`✅ Pokemon data written to ${outputPath}`);

  // Optional: Write raw specs for debugging
  const rawOutputPath = path.join(outputDir, "pokemon-raw.json");
  fs.writeFileSync(rawOutputPath, JSON.stringify(raw_specs, null, 2), "utf8");
  console.log(`✅ Raw specs written to ${rawOutputPath}`);
}

// Run the script
generatePokemonData().catch((err) => {
  console.error("❌ Error generating Pokemon data:", err);
  process.exit(1);
});
