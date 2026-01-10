import TC from "../outputs/typechart.json";


function multiplyIntersect(a: Record<string, number> = {}, b: Record<string, number> = {}) {
  const result: Record<string, number> = {};

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {
    const av = a[key] ?? 1;
    const bv = b[key] ?? 1;
    result[key] = av * bv;
  }

  return result;
}

type TypeChart = Record<string, Record<string, number>>;
const typechart = TC as TypeChart
// console.log("typechart keys:", Object.keys(typechart).slice(0, 20));

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
  forme: string;
  types: string[];
  abilities: string[];
  learnset: string[];
  baseStats: Record<string, number>;
  isTeraCaptain: boolean;
  abilityDefenses: Record<string, number>;


  constructor(species: any) {
    // this.name = species.name;
    // this.tier = species.tier ?? "Unknown";
    // this.types = species.types;
    // this.baseStats = species.baseStats;


    this.name = String(species.name);
    this.num = Number(species.num);
    this.tier = species.tier;
    this.forme = species.forme;
    this.types = Array.isArray(species.types) ? species.types.slice():  [];
    // this.types = Array.isArray(species.types) ? species.types.slice():  [];
    this.types = Array.isArray(species.types)
      ? species.types
          .filter((t: unknown): t is string => typeof t === "string") // type guard
          .map((t: string) => t.toLowerCase())
      : [];
    this.abilities = Object.values(species.abilities) ?? {};
    this.learnset = [];
    this.baseStats = {
      hp : species.baseStats?.hp ?? 0,
      atk : species.baseStats?.atk ?? 0,
      def : species.baseStats?.def ?? 0,
      spa : species.baseStats?.spa ?? 0,
      spd : species.baseStats?.spd ?? 0,
      spe : species.baseStats?.spe ?? 0,
    }
    this.abilities = species.abilities ?? {};

    this.isTeraCaptain = false;
    this.abilityDefenses = {};
  }



  get tierCost() {
    return TIER_POINTS[this.tier] ?? 0;
  }

  get teraCost() {
    if (!this.isTeraCaptain) return 0;
    else if (this.tier === "OU") return 2;
    else if (["ZUBL", "ZU", "NFE", "LC"].includes(this.tier)) return 0.5;
    else return 1;
  }

  get cost() {
    return this.tierCost + this.teraCost;
  }

  get baseStatTotal() {
    return Object.values(this.baseStats).reduce((a, b) => a + b, 0);
  }

  get effectiveBaseStatTotal() {
    const bst = Object.values(this.baseStats).reduce((a, b) => a + b, 0);
    const { atk, spa } = this.baseStats;
    return bst - Math.min(atk, spa);
  }

get spritePath(): string {
  if (!this.forme || this.forme.trim() === "") {
    return `/sprite_folder/sprites/${this.num}.png`;
  }
  return `/sprite_folder/sprites/${this.num}_${this.forme}.png`;
}

  // get defensiveTypes() {
  //     if (Object.keys(this.types).length == 1) 
  //       return typechart[this.types[0]]
  //     else if (Object.keys(this.types).length == 0) 
  //       return typechart["stellar"]
  //     else
  //       return multiplyIntersect(typechart[this.types[0]], typechart[this.types[1]])
  get defensiveTypes() {
    if (this.types.length === 2) {
      return multiplyIntersect(
        typechart[this.types[0]],
        typechart[this.types[1]]
      );
    }

  // }
    if (this.types.length === 1) {
      return typechart[this.types[0]];
    }

    else
      return typechart["stellar"];
    
  }

  // get defensiveTotal() {
  //     if (Object.keys(this.abilityDefenses).length == 0)  
  //       return this.defensiveTypes
  //     else
  //       return multiplyIntersect(this.defensiveTypes, this.abilityDefenses)

  // }

    toJSON() {
      const json: any = { ...this }; // all normal fields

      // get all getter names from the prototype
      const proto = Object.getPrototypeOf(this);
      const props = Object.getOwnPropertyDescriptors(proto);

      for (const [key, descriptor] of Object.entries(props)) {
        if (typeof descriptor.get === "function") {
          // call the getter and add the value
          json[key] = (this as any)[key];
        }
      }

      return json;
  }

  toggleTera () {
    this.isTeraCaptain = !this.isTeraCaptain

  }

  addAbility(s: string, n: number) {
    this.abilityDefenses[s] = n;

  }

  removeAbility(s: string) {
    delete this.abilityDefenses[s];

  }

  applyLearnset(movelist: string[]) {
    this.learnset = movelist;

  }
}



//poketeam class needs:
// team
//     size limit
//     list(pokemon, (1<=len<=limit))
//     list(tera_captains (1<=len))
//     sum(price)
