import { createSeededRandom } from "./seedGenerator";
import { MapTile } from "@/types/map";
import { Monster, BattleEncounter } from "@/types/monster";
import { generateNameFromSeed } from "./nameGenerator";

// Monster templates by biome
const monsterTemplates: Record<string, any[]> = {
  forest: [
    {
      name: "Wolf",
      description: "A fierce wolf prowling the forest.",
      imageUrl: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=1974&auto=format&fit=crop",
      baseLevel: 1,
      stats: {
        hpBase: 20,
        hpPerLevel: 5,
        attackBase: 5,
        attackPerLevel: 1.5,
        defenseBase: 3,
        defensePerLevel: 1,
        speedBase: 8,
        speedPerLevel: 1.2
      },
      abilities: [
        {
          name: "Bite",
          description: "A vicious bite attack.",
          damageMultiplier: 1.0,
          type: "physical",
          targetAll: false,
          useChance: 0.7
        },
        {
          name: "Howl",
          description: "A frightening howl that lowers defense.",
          damageMultiplier: 0.5,
          type: "status",
          targetAll: true,
          useChance: 0.3
        }
      ],
      drops: [
        {
          itemId: "wolf_pelt",
          chance: 0.7,
          minQuantity: 1,
          maxQuantity: 2
        },
        {
          itemId: "wolf_fang",
          chance: 0.4,
          minQuantity: 1,
          maxQuantity: 1
        }
      ]
    },
    {
      name: "Bear",
      description: "A large bear defending its territory.",
      imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=1470&auto=format&fit=crop",
      baseLevel: 3,
      stats: {
        hpBase: 40,
        hpPerLevel: 8,
        attackBase: 8,
        attackPerLevel: 2,
        defenseBase: 5,
        defensePerLevel: 1.5,
        speedBase: 5,
        speedPerLevel: 0.8
      },
      abilities: [
        {
          name: "Claw Swipe",
          description: "A powerful swipe with its claws.",
          damageMultiplier: 1.0,
          type: "physical",
          targetAll: false,
          useChance: 0.6
        },
        {
          name: "Maul",
          description: "A devastating attack that can cause bleeding.",
          damageMultiplier: 1.5,
          type: "physical",
          targetAll: false,
          useChance: 0.4
        }
      ],
      drops: [
        {
          itemId: "bear_pelt",
          chance: 0.8,
          minQuantity: 1,
          maxQuantity: 1
        },
        {
          itemId: "bear_claw",
          chance: 0.5,
          minQuantity: 1,
          maxQuantity: 2
        }
      ]
    }
  ],
  plains: [
    {
      name: "Goblin",
      description: "A small, mischievous goblin.",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1588&auto=format&fit=crop",
      baseLevel: 2,
      stats: {
        hpBase: 15,
        hpPerLevel: 4,
        attackBase: 4,
        attackPerLevel: 1.2,
        defenseBase: 2,
        defensePerLevel: 0.8,
        speedBase: 7,
        speedPerLevel: 1.0
      },
      abilities: [
        {
          name: "Dagger Stab",
          description: "A quick stab with a rusty dagger.",
          damageMultiplier: 1.0,
          type: "physical",
          targetAll: false,
          useChance: 0.8
        },
        {
          name: "Throw Rock",
          description: "Throws a rock at the target.",
          damageMultiplier: 0.7,
          type: "physical",
          targetAll: false,
          useChance: 0.2
        }
      ],
      drops: [
        {
          itemId: "goblin_ear",
          chance: 0.6,
          minQuantity: 1,
          maxQuantity: 2
        },
        {
          itemId: "rusty_dagger",
          chance: 0.3,
          minQuantity: 1,
          maxQuantity: 1
        }
      ]
    },
    {
      name: "Bandit",
      description: "A human outlaw looking for easy prey.",
      imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1374&auto=format&fit=crop",
      baseLevel: 4,
      stats: {
        hpBase: 25,
        hpPerLevel: 5,
        attackBase: 6,
        attackPerLevel: 1.5,
        defenseBase: 4,
        defensePerLevel: 1.2,
        speedBase: 6,
        speedPerLevel: 1.0
      },
      abilities: [
        {
          name: "Sword Slash",
          description: "A slash with a short sword.",
          damageMultiplier: 1.0,
          type: "physical",
          targetAll: false,
          useChance: 0.7
        },
        {
          name: "Ambush",
          description: "A surprise attack that can stun the target.",
          damageMultiplier: 1.2,
          type: "physical",
          targetAll: false,
          useChance: 0.3
        }
      ],
      drops: [
        {
          itemId: "bandit_mask",
          chance: 0.4,
          minQuantity: 1,
          maxQuantity: 1
        },
        {
          itemId: "gold_pouch",
          chance: 0.6,
          minQuantity: 5,
          maxQuantity: 15
        }
      ]
    }
  ],
  mountains: [
    {
      name: "Rock Golem",
      description: "A creature made of living stone.",
      imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=1470&auto=format&fit=crop",
      baseLevel: 5,
      stats: {
        hpBase: 50,
        hpPerLevel: 10,
        attackBase: 7,
        attackPerLevel: 1.8,
        defenseBase: 10,
        defensePerLevel: 2.5,
        speedBase: 3,
        speedPerLevel: 0.5
      },
      abilities: [
        {
          name: "Boulder Throw",
          description: "Throws a large boulder at the target.",
          damageMultiplier: 1.2,
          type: "physical",
          targetAll: false,
          useChance: 0.5
        },
        {
          name: "Ground Slam",
          description: "Slams the ground, damaging all enemies.",
          damageMultiplier: 0.8,
          type: "physical",
          targetAll: true,
          useChance: 0.5
        }
      ],
      drops: [
        {
          itemId: "stone_core",
          chance: 0.3,
          minQuantity: 1,
          maxQuantity: 1
        },
        {
          itemId: "granite_chunk",
          chance: 0.7,
          minQuantity: 1,
          maxQuantity: 3
        }
      ]
    },
    {
      name: "Mountain Lion",
      description: "A fierce predator of the mountains.",
      imageUrl: "https://images.unsplash.com/photo-1545406213-c22c6a3b6c87?q=80&w=1470&auto=format&fit=crop",
      baseLevel: 4,
      stats: {
        hpBase: 30,
        hpPerLevel: 6,
        attackBase: 8,
        attackPerLevel: 2,
        defenseBase: 4,
        defensePerLevel: 1,
        speedBase: 9,
        speedPerLevel: 1.5
      },
      abilities: [
        {
          name: "Pounce",
          description: "A powerful leap attack.",
          damageMultiplier: 1.2,
          type: "physical",
          targetAll: false,
          useChance: 0.6
        },
        {
          name: "Claw Fury",
          description: "Multiple rapid claw attacks.",
          damageMultiplier: 0.7,
          type: "physical",
          targetAll: false,
          useChance: 0.4
        }
      ],
      drops: [
        {
          itemId: "lion_pelt",
          chance: 0.8,
          minQuantity: 1,
          maxQuantity: 1
        },
        {
          itemId: "sharp_claw",
          chance: 0.5,
          minQuantity: 1,
          maxQuantity: 3
        }
      ]
    }
  ],
  desert: [
    {
      name: "Scorpion",
      description: "A giant desert scorpion with a venomous sting.",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop",
      baseLevel: 3,
      stats: {
        hpBase: 25,
        hpPerLevel: 5,
        attackBase: 6,
        attackPerLevel: 1.5,
        defenseBase: 7,
        defensePerLevel: 1.8,
        speedBase: 6,
        speedPerLevel: 1.0
      },
      abilities: [
        {
          name: "Pincer Attack",
          description: "Attacks with its powerful pincers.",
          damageMultiplier: 1.0,
          type: "physical",
          targetAll: false,
          useChance: 0.7
        },
        {
          name: "Venomous Sting",
          description: "A poisonous sting that can cause poison status.",
          damageMultiplier: 0.8,
          type: "physical",
          targetAll: false,
          useChance: 0.3,
          statusEffect: {
            type: "poison",
            chance: 0.5,
            duration: 3
          }
        }
      ],
      drops: [
        {
          itemId: "scorpion_tail",
          chance: 0.6,
          minQuantity: 1,
          maxQuantity: 1
        },
        {
          itemId: "venom_sac",
          chance: 0.4,
          minQuantity: 1,
          maxQuantity: 1
        }
      ]
    },
    {
      name: "Sand Worm",
      description: "A massive worm that burrows through the desert sands.",
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1470&auto=format&fit=crop",
      baseLevel: 6,
      stats: {
        hpBase: 60,
        hpPerLevel: 12,
        attackBase: 9,
        attackPerLevel: 2.2,
        defenseBase: 6,
        defensePerLevel: 1.5,
        speedBase: 4,
        speedPerLevel: 0.7
      },
      abilities: [
        {
          name: "Devour",
          description: "Attempts to swallow the target whole.",
          damageMultiplier: 1.5,
          type: "physical",
          targetAll: false,
          useChance: 0.4
        },
        {
          name: "Sand Spray",
          description: "Sprays sand at all enemies, reducing accuracy.",
          damageMultiplier: 0.6,
          type: "physical",
          targetAll: true,
          useChance: 0.6
        }
      ],
      drops: [
        {
          itemId: "worm_segment",
          chance: 0.8,
          minQuantity: 2,
          maxQuantity: 5
        },
        {
          itemId: "desert_pearl",
          chance: 0.2,
          minQuantity: 1,
          maxQuantity: 1
        }
      ]
    }
  ],
  swamp: [
    {
      name: "Bog Troll",
      description: "A slimy troll that lurks in the swamp.",
      imageUrl: "https://images.unsplash.com/photo-1557431177-36141475c676?q=80&w=1470&auto=format&fit=crop",
      baseLevel: 5,
      stats: {
        hpBase: 45,
        hpPerLevel: 9,
        attackBase: 8,
        attackPerLevel: 2,
        defenseBase: 6,
        defensePerLevel: 1.5,
        speedBase: 4,
        speedPerLevel: 0.6
      },
      abilities: [
        {
          name: "Club Smash",
          description: "Smashes with a crude wooden club.",
          damageMultiplier: 1.2,
          type: "physical",
          targetAll: false,
          useChance: 0.6
        },
        {
          name: "Regenerate",
          description: "Regenerates some health.",
          damageMultiplier: 0,
          type: "status",
          targetAll: false,
          useChance: 0.4
        }
      ],
      drops: [
        {
          itemId: "troll_hide",
          chance: 0.7,
          minQuantity: 1,
          maxQuantity: 1
        },
        {
          itemId: "troll_tooth",
          chance: 0.5,
          minQuantity: 1,
          maxQuantity: 3
        }
      ]
    },
    {
      name: "Giant Leech",
      description: "A massive bloodsucking leech.",
      imageUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1517&auto=format&fit=crop",
      baseLevel: 2,
      stats: {
        hpBase: 20,
        hpPerLevel: 4,
        attackBase: 5,
        attackPerLevel: 1.2,
        defenseBase: 3,
        defensePerLevel: 0.8,
        speedBase: 5,
        speedPerLevel: 0.9
      },
      abilities: [
        {
          name: "Blood Drain",
          description: "Drains blood, dealing damage and healing itself.",
          damageMultiplier: 0.8,
          type: "physical",
          targetAll: false,
          useChance: 0.8
        },
        {
          name: "Slime Spray",
          description: "Sprays slime that can slow enemies.",
          damageMultiplier: 0.5,
          type: "status",
          targetAll: true,
          useChance: 0.2
        }
      ],
      drops: [
        {
          itemId: "leech_extract",
          chance: 0.6,
          minQuantity: 1,
          maxQuantity: 2
        },
        {
          itemId: "blood_sac",
          chance: 0.4,
          minQuantity: 1,
          maxQuantity: 1
        }
      ]
    }
  ]
};

/**
 * Generate a monster encounter based on the current tile
 */
export function generateMonsterEncounter(
  tile: MapTile,
  worldSeed: string,
  playerLevel: number
): BattleEncounter {
  // Skip monster encounters if the tile has a town (safe zone)
  if (tile.hasTown) {
    return {
      triggered: false,
      monsters: [],
      ambush: false,
      canRun: true
    };
  }
  
  const encounterSeed = `${worldSeed}-${tile.x}-${tile.y}-${Date.now()}`;
  const random = createSeededRandom(encounterSeed);
  
  // Base encounter chance (20%)
  let encounterChance = 0.2;
  
  // Adjust based on biome
  if (tile.biome === "forest") encounterChance += 0.05;
  if (tile.biome === "mountains") encounterChance += 0.1;
  if (tile.biome === "swamp") encounterChance += 0.15;
  
  // Check if encounter is triggered
  const encounterTriggered = random.randomBool(encounterChance);
  
  if (!encounterTriggered) {
    return {
      triggered: false,
      monsters: [],
      ambush: false,
      canRun: true
    };
  }
  
  // Determine number of monsters (1-3)
  const numMonsters = random.randomInt(1, 3);
  
  // Determine if it's an ambush (20% chance)
  const isAmbush = random.randomBool(0.2);
  
  // Determine if player can run (80% chance)
  const canRun = random.randomBool(0.8);
  
  // Generate monsters
  const monsters: Monster[] = [];
  
  for (let i = 0; i < numMonsters; i++) {
    const monster = generateMonster(
      tile,
      worldSeed,
      playerLevel,
      `${encounterSeed}-monster-${i}`
    );
    
    monsters.push(monster);
  }
  
  return {
    triggered: true,
    monsters,
    ambush: isAmbush,
    canRun
  };
}

/**
 * Generate a single monster based on the current tile and player level
 */
function generateMonster(
  tile: MapTile,
  worldSeed: string,
  playerLevel: number,
  seed: string
): Monster {
  const random = createSeededRandom(seed);
  
  // Determine biome
  const biome = tile.biome || "plains";
  
  // Get templates for this biome
  const templates = monsterTemplates[biome] || monsterTemplates.plains;
  
  // Select a random template
  const template = random.randomItem(templates);
  
  // Determine monster level (player level +/- 2)
  const levelVariance = random.randomInt(-2, 2);
  const monsterLevel = Math.max(1, playerLevel + levelVariance);
  
  // Generate monster name
  const monsterName = template.name;
  
  // Calculate stats based on level
  const hp = Math.floor(template.stats.hpBase + (template.stats.hpPerLevel * (monsterLevel - 1)));
  const attack = Math.floor(template.stats.attackBase + (template.stats.attackPerLevel * (monsterLevel - 1)));
  const defense = Math.floor(template.stats.defenseBase + (template.stats.defensePerLevel * (monsterLevel - 1)));
  const speed = Math.floor(template.stats.speedBase + (template.stats.speedPerLevel * (monsterLevel - 1)));
  
  // Generate abilities
  const abilities = template.abilities.map((ability: any) => ({
    name: ability.name,
    description: ability.description,
    damage: Math.floor(attack * ability.damageMultiplier),
    type: ability.type,
    targetAll: ability.targetAll || false,
    useChance: ability.useChance || 0.5,
    statusEffect: ability.statusEffect
  }));
  
  // Create monster object
  const monster: Monster = {
    id: `monster-${seed}`,
    name: monsterName,
    description: template.description,
    imageUrl: template.imageUrl,
    level: monsterLevel,
    stats: {
      hp,
      maxHp: hp,
      attack,
      defense,
      speed
    },
    abilities,
    drops: template.drops,
    biomeAffinity: [biome],
    weatherAffinity: [],
    difficultyRange: {
      min: template.baseLevel,
      max: template.baseLevel + 5
    }
  };
  
  return monster;
}