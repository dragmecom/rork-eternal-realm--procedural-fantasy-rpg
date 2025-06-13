import { Monster } from "@/types/monster";

// Monster templates for different biomes and difficulty levels
export const monsterTemplates: Monster[] = [
  // Forest Monsters
  {
    id: "template-wolf",
    name: "Forest Wolf",
    description: "A fierce wolf with glowing eyes and sharp teeth.",
    imageUrl: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=2033&auto=format&fit=crop",
    level: 3,
    stats: {
      hp: 45,
      maxHp: 45,
      attack: 12,
      defense: 8,
      speed: 15,
      magicResist: 5
    },
    abilities: [
      {
        name: "Bite",
        description: "A vicious bite attack",
        damage: 12,
        type: "physical",
        targetAll: false,
        useChance: 0.7
      },
      {
        name: "Howl",
        description: "A frightening howl that lowers defense",
        damage: 0,
        type: "status",
        statusEffect: {
          type: "confusion",
          chance: 0.3,
          duration: 2
        },
        targetAll: true,
        useChance: 0.3
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 10,
        maxQuantity: 25
      },
      {
        itemId: "wolf_fang",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 2
      },
      {
        itemId: "potion_minor",
        chance: 0.3,
        minQuantity: 1,
        maxQuantity: 1
      }
    ],
    biomeAffinity: ["forest", "plains", "highlands"],
    weatherAffinity: ["clear", "cloudy", "rain", "fog"],
    difficultyRange: {
      min: 2,
      max: 5
    }
  },
  {
    id: "template-bear",
    name: "Forest Bear",
    description: "A massive bear with powerful claws.",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=2070&auto=format&fit=crop",
    level: 5,
    stats: {
      hp: 80,
      maxHp: 80,
      attack: 18,
      defense: 12,
      speed: 8,
      magicResist: 7
    },
    abilities: [
      {
        name: "Claw Swipe",
        description: "A powerful swipe with sharp claws",
        damage: 18,
        type: "physical",
        targetAll: false,
        useChance: 0.8
      },
      {
        name: "Roar",
        description: "A terrifying roar that can paralyze",
        damage: 0,
        type: "status",
        statusEffect: {
          type: "paralysis",
          chance: 0.4,
          duration: 1
        },
        targetAll: true,
        useChance: 0.2
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 20,
        maxQuantity: 40
      },
      {
        itemId: "potion_medium",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 1
      }
    ],
    biomeAffinity: ["forest", "mountains", "highlands"],
    weatherAffinity: ["clear", "cloudy", "rain", "snow"],
    difficultyRange: {
      min: 4,
      max: 7
    }
  },
  
  // Desert Monsters
  {
    id: "template-scorpion",
    name: "Giant Scorpion",
    description: "A massive scorpion with a deadly stinger.",
    imageUrl: "https://images.unsplash.com/photo-1610847499832-918a1c3c6811?q=80&w=2076&auto=format&fit=crop",
    level: 4,
    stats: {
      hp: 60,
      maxHp: 60,
      attack: 15,
      defense: 14,
      speed: 10,
      magicResist: 6,
      elementalResistance: ["fire"]
    },
    abilities: [
      {
        name: "Pincer Attack",
        description: "A crushing attack with powerful pincers",
        damage: 15,
        type: "physical",
        targetAll: false,
        useChance: 0.6
      },
      {
        name: "Poison Sting",
        description: "A venomous sting that can poison enemies",
        damage: 10,
        type: "physical",
        statusEffect: {
          type: "poison",
          chance: 0.5,
          duration: 3
        },
        targetAll: false,
        useChance: 0.4
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 15,
        maxQuantity: 30
      },
      {
        itemId: "scorpion_tail",
        chance: 0.5,
        minQuantity: 1,
        maxQuantity: 1
      },
      {
        itemId: "antidote",
        chance: 0.3,
        minQuantity: 1,
        maxQuantity: 2
      }
    ],
    biomeAffinity: ["desert", "wasteland"],
    weatherAffinity: ["clear", "heatwave", "sandstorm"],
    difficultyRange: {
      min: 3,
      max: 6
    }
  },
  
  // Mountain Monsters
  {
    id: "template-golem",
    name: "Rock Golem",
    description: "A creature made of living stone.",
    imageUrl: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=2064&auto=format&fit=crop",
    level: 7,
    stats: {
      hp: 120,
      maxHp: 120,
      attack: 22,
      defense: 20,
      speed: 5,
      magicResist: 10,
      elementalResistance: ["physical"],
      elementalWeakness: ["lightning"]
    },
    abilities: [
      {
        name: "Boulder Throw",
        description: "Throws a massive boulder",
        damage: 25,
        type: "physical",
        targetAll: false,
        useChance: 0.4
      },
      {
        name: "Ground Slam",
        description: "Slams the ground, damaging all enemies",
        damage: 18,
        type: "physical",
        targetAll: true,
        useChance: 0.3
      },
      {
        name: "Stone Skin",
        description: "Hardens its skin, increasing defense",
        damage: 0,
        type: "status",
        targetAll: false,
        useChance: 0.3
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 30,
        maxQuantity: 60
      },
      {
        itemId: "golem_core",
        chance: 0.3,
        minQuantity: 1,
        maxQuantity: 1
      },
      {
        itemId: "potion_medium",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 2
      }
    ],
    biomeAffinity: ["mountains", "highlands", "wasteland"],
    weatherAffinity: ["clear", "cloudy", "storm"],
    difficultyRange: {
      min: 6,
      max: 9
    }
  },
  
  // Swamp Monsters
  {
    id: "template-slime",
    name: "Toxic Slime",
    description: "A gelatinous creature oozing with poison.",
    imageUrl: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=2071&auto=format&fit=crop",
    level: 2,
    stats: {
      hp: 35,
      maxHp: 35,
      attack: 8,
      defense: 5,
      speed: 6,
      magicResist: 8,
      elementalResistance: ["poison"],
      elementalWeakness: ["fire"]
    },
    abilities: [
      {
        name: "Acid Touch",
        description: "A corrosive touch that deals poison damage",
        damage: 8,
        type: "physical",
        element: "poison",
        targetAll: false,
        useChance: 0.7
      },
      {
        name: "Toxic Cloud",
        description: "Releases a cloud of toxic gas",
        damage: 6,
        type: "magical",
        element: "poison",
        statusEffect: {
          type: "poison",
          chance: 0.6,
          duration: 3
        },
        targetAll: true,
        useChance: 0.3
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 5,
        maxQuantity: 15
      },
      {
        itemId: "slime_essence",
        chance: 0.6,
        minQuantity: 1,
        maxQuantity: 3
      },
      {
        itemId: "antidote",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 1
      }
    ],
    biomeAffinity: ["swamp", "marsh"],
    weatherAffinity: ["rain", "fog", "cloudy"],
    difficultyRange: {
      min: 1,
      max: 4
    }
  },
  
  // Tundra Monsters
  {
    id: "template-frost-wolf",
    name: "Frost Wolf",
    description: "A wolf with fur white as snow and ice-blue eyes.",
    imageUrl: "https://images.unsplash.com/photo-1579170053380-58064b2dee67?q=80&w=2071&auto=format&fit=crop",
    level: 5,
    stats: {
      hp: 65,
      maxHp: 65,
      attack: 16,
      defense: 10,
      speed: 18,
      magicResist: 8,
      elementalResistance: ["ice"],
      elementalWeakness: ["fire"]
    },
    abilities: [
      {
        name: "Frost Bite",
        description: "A freezing bite attack",
        damage: 16,
        type: "physical",
        element: "ice",
        targetAll: false,
        useChance: 0.6
      },
      {
        name: "Freezing Howl",
        description: "A chilling howl that can freeze enemies",
        damage: 0,
        type: "magical",
        element: "ice",
        statusEffect: {
          type: "paralysis",
          chance: 0.4,
          duration: 2
        },
        targetAll: true,
        useChance: 0.4
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 20,
        maxQuantity: 40
      },
      {
        itemId: "frost_crystal",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 2
      },
      {
        itemId: "wolf_fang",
        chance: 0.5,
        minQuantity: 1,
        maxQuantity: 2
      }
    ],
    biomeAffinity: ["tundra", "mountains"],
    weatherAffinity: ["snow", "clear", "cloudy"],
    difficultyRange: {
      min: 4,
      max: 7
    }
  },
  
  // Jungle Monsters
  {
    id: "template-panther",
    name: "Shadow Panther",
    description: "A sleek predator that moves silently through the dense foliage.",
    imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=2032&auto=format&fit=crop",
    level: 6,
    stats: {
      hp: 70,
      maxHp: 70,
      attack: 20,
      defense: 12,
      speed: 22,
      magicResist: 8
    },
    abilities: [
      {
        name: "Pounce",
        description: "A lightning-fast attack from hiding",
        damage: 24,
        type: "physical",
        targetAll: false,
        useChance: 0.5
      },
      {
        name: "Rending Claws",
        description: "A vicious attack that causes bleeding",
        damage: 18,
        type: "physical",
        statusEffect: {
          type: "poison", // Using poison to represent bleeding
          chance: 0.5,
          duration: 3
        },
        targetAll: false,
        useChance: 0.5
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 25,
        maxQuantity: 50
      },
      {
        itemId: "jungle_vine",
        chance: 0.3,
        minQuantity: 1,
        maxQuantity: 3
      },
      {
        itemId: "potion_medium",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 1
      }
    ],
    biomeAffinity: ["jungle", "forest"],
    weatherAffinity: ["clear", "rain", "fog"],
    difficultyRange: {
      min: 5,
      max: 8
    }
  },
  
  // Volcanic Monsters
  {
    id: "template-fire-elemental",
    name: "Lava Elemental",
    description: "A being of molten rock and fire.",
    imageUrl: "https://images.unsplash.com/photo-1554475659-1f1a2af12ba7?q=80&w=2069&auto=format&fit=crop",
    level: 8,
    stats: {
      hp: 100,
      maxHp: 100,
      attack: 25,
      defense: 15,
      speed: 12,
      magicResist: 20,
      elementalResistance: ["fire"],
      elementalWeakness: ["ice"]
    },
    abilities: [
      {
        name: "Magma Strike",
        description: "A burning attack of molten rock",
        damage: 25,
        type: "physical",
        element: "fire",
        targetAll: false,
        useChance: 0.6
      },
      {
        name: "Eruption",
        description: "A violent eruption that damages all enemies",
        damage: 20,
        type: "magical",
        element: "fire",
        targetAll: true,
        useChance: 0.3
      },
      {
        name: "Heat Wave",
        description: "An intense wave of heat that can cause burns",
        damage: 15,
        type: "magical",
        element: "fire",
        statusEffect: {
          type: "poison", // Using poison to represent burning
          chance: 0.5,
          duration: 3
        },
        targetAll: true,
        useChance: 0.1
      }
    ],
    drops: [
      {
        itemId: "gold",
        chance: 1.0,
        minQuantity: 40,
        maxQuantity: 80
      },
      {
        itemId: "lava_stone",
        chance: 0.4,
        minQuantity: 1,
        maxQuantity: 1
      },
      {
        itemId: "potion_major",
        chance: 0.3,
        minQuantity: 1,
        maxQuantity: 1
      }
    ],
    biomeAffinity: ["volcanic", "lavaFields"],
    weatherAffinity: ["clear", "heatwave"],
    difficultyRange: {
      min: 7,
      max: 10
    }
  }
];