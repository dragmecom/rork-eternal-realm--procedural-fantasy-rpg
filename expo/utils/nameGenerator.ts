import { createSeededRandom } from "./seedGenerator";

// Name parts for different types
const nameParts = {
  town: {
    prefixes: [
      "North", "South", "East", "West", "New", "Old", "Fort", "Port", "Lake", "River",
      "High", "Low", "Upper", "Lower", "Great", "Little", "Grand", "Royal", "Fair", "Golden"
    ],
    roots: [
      "wood", "field", "ford", "bridge", "ton", "bury", "ham", "ville", "shire", "port",
      "haven", "dale", "vale", "glen", "wick", "stead", "gate", "keep", "castle", "tower",
      "brook", "creek", "lake", "hill", "cliff", "ridge", "mount", "fall", "spring", "water"
    ],
    suffixes: [
      "ton", "ville", "burg", "berg", "shire", "field", "dale", "ford", "port", "haven",
      "wood", "land", "moor", "marsh", "vale", "glen", "view", "side", "gate", "way"
    ]
  },
  world: {
    prefixes: [
      "Mystic", "Ancient", "Eternal", "Forgotten", "Lost", "Hidden", "Sacred", "Cursed", "Blessed", "Enchanted",
      "Shadowy", "Radiant", "Celestial", "Infernal", "Primal", "Savage", "Verdant", "Frozen", "Burning", "Sundered"
    ],
    roots: [
      "realm", "land", "world", "domain", "kingdom", "empire", "plane", "dimension", "void", "abyss",
      "paradise", "haven", "sanctuary", "wilderness", "expanse", "frontier", "territory", "region", "continent", "isle"
    ],
    suffixes: [
      "ia", "or", "um", "us", "is", "ar", "on", "en", "an", "el",
      "ium", "ius", "alis", "oria", "aria", "erra", "ora", "ira", "ara", "era"
    ]
  },
  character: {
    prefixes: [
      "Brave", "Bold", "Wise", "Swift", "Strong", "Keen", "Sharp", "Bright", "Dark", "Grim",
      "Fair", "Noble", "Royal", "Wild", "Calm", "Fierce", "Proud", "Humble", "Silent", "Loud"
    ],
    firstNames: [
      "Ael", "Aer", "Af", "Ah", "Al", "Am", "An", "Ap", "Ar", "As",
      "At", "Ath", "Av", "Az", "Bal", "Ban", "Bar", "Bel", "Ben", "Ber",
      "Bes", "Bor", "Bran", "Breg", "Bren", "Brod", "Cam", "Car", "Cas", "Caw"
    ],
    lastNames: [
      "son", "moon", "star", "fire", "wind", "water", "earth", "wood", "iron", "steel",
      "heart", "mind", "soul", "spirit", "hand", "eye", "foot", "arm", "leg", "head",
      "beard", "hair", "tooth", "bone", "blood", "flesh", "skin", "horn", "claw", "fang"
    ]
  },
  monster: {
    prefixes: [
      "Dire", "Feral", "Savage", "Ancient", "Corrupted", "Twisted", "Vile", "Wretched", "Cursed", "Blighted",
      "Venomous", "Toxic", "Rabid", "Frenzied", "Enraged", "Maddened", "Undying", "Rotting", "Putrid", "Festering"
    ],
    roots: [
      "wolf", "bear", "boar", "rat", "bat", "spider", "snake", "toad", "lizard", "scorpion",
      "wasp", "beetle", "worm", "slug", "leech", "centipede", "mantis", "moth", "fly", "mosquito",
      "goblin", "orc", "troll", "ogre", "giant", "drake", "wyrm", "demon", "spirit", "wraith"
    ],
    suffixes: [
      "bane", "fang", "claw", "talon", "horn", "tusk", "maw", "jaw", "eye", "stalker",
      "lurker", "hunter", "killer", "slayer", "eater", "drinker", "render", "ripper", "slicer", "crusher"
    ]
  },
  item: {
    prefixes: [
      "Gleaming", "Shining", "Glowing", "Burning", "Freezing", "Shocking", "Venomous", "Holy", "Unholy", "Arcane",
      "Mystic", "Enchanted", "Blessed", "Cursed", "Ancient", "Timeworn", "Runic", "Inscribed", "Ornate", "Simple"
    ],
    roots: [
      "sword", "axe", "mace", "flail", "spear", "bow", "dagger", "staff", "wand", "orb",
      "shield", "armor", "helm", "gauntlet", "boot", "cloak", "robe", "amulet", "ring", "belt",
      "potion", "elixir", "scroll", "tome", "grimoire", "rune", "gem", "crystal", "stone", "charm"
    ],
    suffixes: [
      "of Power", "of Might", "of Strength", "of Dexterity", "of Agility", "of Speed", "of Vitality", "of Health", "of Energy", "of Magic",
      "of Protection", "of Warding", "of Shielding", "of Defense", "of Resistance", "of the Bear", "of the Wolf", "of the Eagle", "of the Serpent", "of the Dragon"
    ]
  }
};

/**
 * Generate a name from a seed and type
 * @param seed The seed to use for random generation
 * @param type The type of name to generate (town, world, character, monster, item)
 * @returns A generated name
 */
export function generateNameFromSeed(seed: string, type: string): string {
  const random = createSeededRandom(seed);
  const parts = nameParts[type as keyof typeof nameParts] || nameParts.town;
  
  let name = "";
  
  // Different generation patterns based on type
  switch (type) {
    case "town":
      // 50% chance to add a prefix
      if (random.randomBool(0.5)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      name += random.randomItem((parts as typeof nameParts.town).roots);
      
      // 70% chance to add a suffix
      if (random.randomBool(0.7)) {
        name += random.randomItem((parts as typeof nameParts.town).suffixes);
      }
      break;
      
    case "world":
      // 70% chance to add a prefix
      if (random.randomBool(0.7)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      name += random.randomItem((parts as typeof nameParts.world).roots);
      
      // 60% chance to add a suffix
      if (random.randomBool(0.6)) {
        name += random.randomItem((parts as typeof nameParts.world).suffixes);
      }
      break;
      
    case "character":
      // 30% chance to add a title prefix
      if (random.randomBool(0.3)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a first name
      const charParts = parts as typeof nameParts.character;
      name += random.randomItem(charParts.firstNames);
      
      // 80% chance to add a last name
      if (random.randomBool(0.8)) {
        name += random.randomItem(charParts.lastNames);
      }
      break;
      
    case "monster":
      // 60% chance to add a prefix
      if (random.randomBool(0.6)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      const monsterParts = parts as typeof nameParts.monster;
      name += random.randomItem(monsterParts.roots);
      
      // 40% chance to add a suffix
      if (random.randomBool(0.4)) {
        name += random.randomItem(monsterParts.suffixes);
      }
      break;
      
    case "item":
      // 70% chance to add a prefix
      if (random.randomBool(0.7)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      const itemParts = parts as typeof nameParts.item;
      name += random.randomItem(itemParts.roots);
      
      // 50% chance to add a suffix
      if (random.randomBool(0.5)) {
        name += " " + random.randomItem(itemParts.suffixes);
      }
      break;
      
    default:
      // Default to town name pattern
      if (random.randomBool(0.5)) {
        name += random.randomItem(nameParts.town.prefixes) + " ";
      }
      name += random.randomItem(nameParts.town.roots);
      if (random.randomBool(0.7)) {
        name += random.randomItem(nameParts.town.suffixes);
      }
  }
  
  // Capitalize first letter of each word
  name = name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return name;
}

/**
 * Generate a name using a random generator and type
 * @param random The random generator to use
 * @param type The type of name to generate
 * @returns A generated name
 */
export function generateName(random: ReturnType<typeof createSeededRandom>, type: string): string {
  const parts = nameParts[type as keyof typeof nameParts] || nameParts.town;
  
  let name = "";
  
  // Different generation patterns based on type
  switch (type) {
    case "town": {
      // 50% chance to add a prefix
      if (random.randomBool(0.5)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      const townParts = parts as typeof nameParts.town;
      name += random.randomItem(townParts.roots);
      
      // 70% chance to add a suffix
      if (random.randomBool(0.7)) {
        name += random.randomItem(townParts.suffixes);
      }
      break;
    }
      
    case "world": {
      // 70% chance to add a prefix
      if (random.randomBool(0.7)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      const worldParts = parts as typeof nameParts.world;
      name += random.randomItem(worldParts.roots);
      
      // 60% chance to add a suffix
      if (random.randomBool(0.6)) {
        name += random.randomItem(worldParts.suffixes);
      }
      break;
    }
      
    case "character": {
      // 30% chance to add a title prefix
      if (random.randomBool(0.3)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a first name
      const charParts = parts as typeof nameParts.character;
      name += random.randomItem(charParts.firstNames);
      
      // 80% chance to add a last name
      if (random.randomBool(0.8)) {
        name += random.randomItem(charParts.lastNames);
      }
      break;
    }
      
    case "monster": {
      // 60% chance to add a prefix
      if (random.randomBool(0.6)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      const monsterParts = parts as typeof nameParts.monster;
      name += random.randomItem(monsterParts.roots);
      
      // 40% chance to add a suffix
      if (random.randomBool(0.4)) {
        name += random.randomItem(monsterParts.suffixes);
      }
      break;
    }
      
    case "item": {
      // 70% chance to add a prefix
      if (random.randomBool(0.7)) {
        name += random.randomItem(parts.prefixes) + " ";
      }
      
      // Always add a root
      const itemParts = parts as typeof nameParts.item;
      name += random.randomItem(itemParts.roots);
      
      // 50% chance to add a suffix
      if (random.randomBool(0.5)) {
        name += " " + random.randomItem(itemParts.suffixes);
      }
      break;
    }
      
    default: {
      // Default to town name pattern
      if (random.randomBool(0.5)) {
        name += random.randomItem(nameParts.town.prefixes) + " ";
      }
      name += random.randomItem(nameParts.town.roots);
      if (random.randomBool(0.7)) {
        name += random.randomItem(nameParts.town.suffixes);
      }
    }
  }
  
  // Capitalize first letter of each word
  name = name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return name;
}