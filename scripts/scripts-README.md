# Pokemon Data Generation Scripts

This folder contains Node.js scripts that fetch Pokemon data and generate JSON files for the Angular app.

## Setup

1. **Copy your Pokemon and Pokedex classes to `scripts/classes/`**
   ```bash
   # From project root
   mkdir -p scripts/classes
   cp src/app/classes/Pokemon.ts scripts/classes/
   cp src/app/classes/Pokedex.ts scripts/classes/
   ```

2. **Install dependencies**
   ```bash
   cd scripts
   npm install
   ```

3. **Generate Pokemon data**
   ```bash
   npm run generate
   ```
   
   This will:
   - Fetch Pokemon species from Pokemon Showdown
   - Enrich with learnsets from PokeAPI
   - Write to `src/assets/data/pokemon-data.json`

## Files

- `package.json` - Script dependencies (pokemon-showdown, ts-node, etc.)
- `tsconfig.json` - TypeScript config for scripts
- `generate-pokemon.ts` - Main data generation script
- `classes/` - Copy of Pokemon/Pokedex classes (needed for script to run)

## Usage in Angular

The generated JSON is automatically available to your Angular app via the `PokedexService`:

```typescript
import { PokedexService } from './services/pokedex.service';

constructor(private pokedexService: PokedexService) {}

ngOnInit() {
  this.pokedexService.loadPokedex().subscribe(pokedex => {
    // Use pokedex.filter() just like before
    const filtered = pokedex.filter({
      operator: 'AND',
      filters: [{ tier: 'OU' }]
    });
  });
}
```

## Workflow

1. **Development**: Run `npm run generate` whenever you want fresh data
2. **Before build**: Add to root `package.json`:
   ```json
   {
     "scripts": {
       "prebuild": "cd scripts && npm run generate",
       "build": "ng build"
     }
   }
   ```

## Notes

- The `classes/` folder in scripts is a copy, not a symlink
- Keep both copies in sync if you modify Pokemon or Pokedex classes
- The generated JSON file can be committed to git or regenerated as needed
