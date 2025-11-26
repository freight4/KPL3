import subprocess
import json
import re
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from collections import Counter



@dataclass
class Pokemon:
    name: str
    id: str
    fullname: str
    num: int
    gen: int
    tier: str
    natDexTier: str
    abilities: Dict[str, str]
    types: List[str]
    baseStats: Dict[str, int]



# Command to execute the Node.js script
# command = ["node", "api.js"]
# process = subprocess.run(command, capture_output=True, text=True, check=True)
# node_output = process.stdout
# data = json.loads(node_output)

with open("pokemon.json", "r", encoding="utf-8") as f:
    data = json.load(f)


mon_list = []
for mon in data:
    current = Pokemon(**{k: v for k, v in mon.items() if k in Pokemon.__annotations__})
    mon_list.append(current)


# for mon in mon_list:
#     print(mon)
#     print(mon.name)
#     print(mon.baseStats['hp'])

# tiers = Counter(mon.tier for mon in mon_list if mon.tier is not None)
# for tier, count in tiers.items():
#     print(f"{tier}: {count}")


dex_nums = Counter(mon.num for mon in mon_list if mon.num is not None)
for num, count in dex_nums.most_common():
    print(f"{num}: {count}")
