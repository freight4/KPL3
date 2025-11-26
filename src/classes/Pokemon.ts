import { Species } from "../types/Species";

const TIER_POINTS: Record<string, number> = {
  "OU": 10, 
  "UUBL": 9, 
  "UU": 8, 
  "RUBL": 7, 
  "RU": 6, 
  "NUBL": 5, 
  "NU": 4, 
  "PUBL": 4, 
  "PU": 3, 
  "ZUBL": 3, 
  "ZU": 2,
  "NFE": 2,
  "LC": 2
};


export class Pokemon {
  name: string;
  num: number;
  tier: string;
  types: string[];
  baseStats: Record<string, number>;
  abilities: Record<string, string>;
  isTeraCaptain: boolean;

  constructor(species: any) {
    // this.name = species.name;
    // this.tier = species.tier ?? "Unknown";
    // this.types = species.types;
    // this.baseStats = species.baseStats;

     
    this.name = String(species.name);
    this.num = Number(species.num);
    this.types = Array.isArray(species.types) ? species.types.slice():  [];
    this.baseStats = {
      hp : species.baseStats?.hp ?? 0,
      atk : species.baseStats?.atk ?? 0,
      def : species.baseStats?.def ?? 0,
      spa : species.baseStats?.spa ?? 0,
      spd : species.baseStats?.spd ?? 0,
      spe : species.baseStats?.spe ?? 0,
    }
    this.abilities = species.abilities ?? {};
    this.tier = species.tier;
    this.isTeraCaptain = false;
  }

  
  
  get tier_points() {
    return TIER_POINTS[this.tier] ?? 0;
  }

  get tera_points() {
    if (!this.isTeraCaptain) return 0;
    if (this.tier === "OU") return 2;
    return 1;
  }

  get points() {
    return this.tier_points + this.tera_points;
  }

  get totalStats() {
    return Object.values(this.baseStats).reduce((a, b) => a + b, 0);
  }
}