import { Item } from '@/types/item';
import { createSeededRandom } from './seedGenerator';

// Generate starter items for a new player
export function generateStarterItems(seed: string): Item[] {
  const random = createSeededRandom(seed);
  
  // Basic starter items
  const items: Item[] = [
    {
      id: `item-${seed}-starter-1`,
      name: "Rusty Sword",
      description: "A basic sword with a worn handle. It's seen better days, but it's better than nothing.",
      type: "weapon",
      rarity: "common",
      value: 10,
      weight: 2,
      quantity: 1,
      slot: "mainHand",
      bonuses: {
        attack: 2
      },
      consumable: false,
      equipped: false,
      size: { width: 1, height: 2 },
      imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: `item-${seed}-starter-2`,
      name: "Leather Tunic",
      description: "A simple leather tunic that provides minimal protection.",
      type: "armor",
      rarity: "common",
      value: 15,
      weight: 3,
      quantity: 1,
      slot: "body",
      bonuses: {
        defense: 1
      },
      consumable: false,
      equipped: false,
      size: { width: 2, height: 2 },
      imageUrl: "https://images.unsplash.com/photo-1605826832916-d0a401ffc887?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: `item-${seed}-starter-3`,
      name: "Health Potion",
      description: "A small vial of red liquid that restores 20 health when consumed.",
      type: "consumable",
      rarity: "common",
      value: 5,
      weight: 0.5,
      quantity: 3,
      bonuses: {},
      consumable: true,
      equipped: false,
      size: { width: 1, height: 1 },
      imageUrl: "https://images.unsplash.com/photo-1596133159219-9e262f491be9?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: `item-${seed}-starter-4`,
      name: "Mana Potion",
      description: "A small vial of blue liquid that restores 15 mana when consumed.",
      type: "consumable",
      rarity: "common",
      value: 5,
      weight: 0.5,
      quantity: 2,
      bonuses: {},
      consumable: true,
      equipped: false,
      size: { width: 1, height: 1 },
      imageUrl: "https://images.unsplash.com/photo-1596133159219-9e262f491be9?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: `item-${seed}-starter-5`,
      name: "Adventurer's Backpack",
      description: "A sturdy backpack that increases your inventory capacity.",
      type: "accessory",
      rarity: "common",
      value: 20,
      weight: 1,
      quantity: 1,
      bonuses: {},
      consumable: false,
      equipped: false,
      size: { width: 2, height: 2 },
      imageUrl: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?q=80&w=2070&auto=format&fit=crop"
    }
  ];
  
  return items;
}

// Generate shop inventory for a town
export function generateShopInventory(seed: string, townDepth: number, townType: string): Item[] {
  const random = createSeededRandom(seed);
  const inventory: Item[] = [];
  
  // Number of items based on town depth
  const numItems = 10 + Math.floor(townDepth * 2);
  
  // Generate weapons
  const numWeapons = Math.floor(numItems * 0.3);
  for (let i = 0; i < numWeapons; i++) {
    inventory.push(generateWeapon(seed + `-weapon-${i}`, townDepth, random));
  }
  
  // Generate armor
  const numArmor = Math.floor(numItems * 0.3);
  for (let i = 0; i < numArmor; i++) {
    inventory.push(generateArmor(seed + `-armor-${i}`, townDepth, random));
  }
  
  // Generate accessories
  const numAccessories = Math.floor(numItems * 0.2);
  for (let i = 0; i < numAccessories; i++) {
    inventory.push(generateAccessory(seed + `-accessory-${i}`, townDepth, random));
  }
  
  // Generate consumables
  const numConsumables = Math.floor(numItems * 0.2);
  for (let i = 0; i < numConsumables; i++) {
    inventory.push(generateConsumable(seed + `-consumable-${i}`, townDepth, random));
  }
  
  return inventory;
}

// Generate a random weapon
function generateWeapon(seed: string, depth: number, random: ReturnType<typeof createSeededRandom>): Item {
  const weaponTypes = [
    { name: "Sword", damageMin: 3, damageMax: 6 },
    { name: "Axe", damageMin: 4, damageMax: 8 },
    { name: "Mace", damageMin: 3, damageMax: 7 },
    { name: "Dagger", damageMin: 2, damageMax: 4 },
    { name: "Spear", damageMin: 3, damageMax: 7 },
    { name: "Bow", damageMin: 2, damageMax: 5 },
    { name: "Staff", damageMin: 2, damageMax: 4 },
    { name: "Wand", damageMin: 1, damageMax: 3 }
  ];
  
  const prefixes = [
    "Rusty", "Sharp", "Gleaming", "Ancient", "Masterwork", 
    "Enchanted", "Blessed", "Cursed", "Demonic", "Angelic",
    "Brutal", "Precise", "Swift", "Heavy", "Light"
  ];
  
  const suffixes = [
    "of Power", "of Strength", "of Agility", "of Wisdom", 
    "of the Bear", "of the Wolf", "of the Eagle", "of the Serpent",
    "of Slaying", "of Destruction", "of Ruin", "of Victory"
  ];
  
  // Select weapon type
  const weaponType = weaponTypes[random.randomInt(0, weaponTypes.length - 1)];
  
  // Determine rarity based on depth
  const rarityRoll = random.random();
  let rarity: string;
  
  if (rarityRoll < 0.6 - (depth * 0.05)) {
    rarity = "common";
  } else if (rarityRoll < 0.85 - (depth * 0.03)) {
    rarity = "uncommon";
  } else if (rarityRoll < 0.95 - (depth * 0.01)) {
    rarity = "rare";
  } else if (rarityRoll < 0.99 - (depth * 0.005)) {
    rarity = "epic";
  } else {
    rarity = "legendary";
  }
  
  // Generate name
  let name = "";
  if (rarity === "common") {
    name = weaponType.name;
  } else if (rarity === "uncommon") {
    name = `${prefixes[random.randomInt(0, prefixes.length - 1)]} ${weaponType.name}`;
  } else {
    name = `${prefixes[random.randomInt(0, prefixes.length - 1)]} ${weaponType.name} ${suffixes[random.randomInt(0, suffixes.length - 1)]}`;
  }
  
  // Calculate damage based on weapon type, depth, and rarity
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2,
    legendary: 3
  }[rarity] || 1;
  
  const depthMultiplier = 1 + (depth * 0.2);
  const baseDamage = random.randomInt(
    weaponType.damageMin, 
    weaponType.damageMax
  );
  
  const damage = Math.floor(baseDamage * rarityMultiplier * depthMultiplier);
  
  // Generate bonuses
  const bonuses: Record<string, number> = {
    attack: damage
  };
  
  // Add additional bonuses based on rarity
  if (rarity !== "common") {
    const numBonuses = {
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4
    }[rarity] || 0;
    
    const possibleBonuses = [
      "strength", "dexterity", "vitality", "energy",
      "fireResist", "coldResist", "lightningResist", "poisonResist",
      "magicFind", "magicResist"
    ];
    
    for (let i = 0; i < numBonuses; i++) {
      const bonusType = possibleBonuses[random.randomInt(0, possibleBonuses.length - 1)];
      const bonusValue = Math.floor(random.randomInt(1, 3) * rarityMultiplier * depthMultiplier);
      bonuses[bonusType] = bonusValue;
    }
  }
  
  // Generate description
  let description = `A ${rarity} ${weaponType.name.toLowerCase()} that deals ${damage} damage.`;
  
  // Calculate value
  const value = Math.floor(10 * rarityMultiplier * depthMultiplier * (1 + Object.keys(bonuses).length * 0.5));
  
  // Generate weapon
  return {
    id: `item-${seed}`,
    name,
    description,
    type: "weapon",
    rarity,
    value,
    weight: random.randomFloat(1, 5),
    quantity: 1,
    slot: "mainHand",
    bonuses,
    consumable: false,
    equipped: false,
    size: { width: 1, height: 2 },
    imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=2070&auto=format&fit=crop"
  };
}

// Generate a random armor piece
function generateArmor(seed: string, depth: number, random: ReturnType<typeof createSeededRandom>): Item {
  const armorTypes = [
    { name: "Helmet", slot: "head", defenseMin: 1, defenseMax: 3 },
    { name: "Chestplate", slot: "body", defenseMin: 3, defenseMax: 6 },
    { name: "Gauntlets", slot: "hands", defenseMin: 1, defenseMax: 2 },
    { name: "Boots", slot: "feet", defenseMin: 1, defenseMax: 3 }
  ];
  
  const materials = [
    { name: "Leather", multiplier: 1 },
    { name: "Chain", multiplier: 1.2 },
    { name: "Iron", multiplier: 1.5 },
    { name: "Steel", multiplier: 1.8 },
    { name: "Mithril", multiplier: 2.2 },
    { name: "Adamantite", multiplier: 2.5 },
    { name: "Dragonscale", multiplier: 3 }
  ];
  
  const prefixes = [
    "Sturdy", "Reinforced", "Ornate", "Ancient", "Masterwork", 
    "Enchanted", "Blessed", "Cursed", "Demonic", "Angelic",
    "Impenetrable", "Lightweight", "Heavy", "Gleaming", "Dull"
  ];
  
  const suffixes = [
    "of Protection", "of Warding", "of Deflection", "of Resilience", 
    "of the Turtle", "of the Mountain", "of the Guardian", "of the Sentinel",
    "of Fortitude", "of Endurance", "of Vitality", "of Vigor"
  ];
  
  // Select armor type
  const armorType = armorTypes[random.randomInt(0, armorTypes.length - 1)];
  
  // Determine rarity based on depth
  const rarityRoll = random.random();
  let rarity: string;
  
  if (rarityRoll < 0.6 - (depth * 0.05)) {
    rarity = "common";
  } else if (rarityRoll < 0.85 - (depth * 0.03)) {
    rarity = "uncommon";
  } else if (rarityRoll < 0.95 - (depth * 0.01)) {
    rarity = "rare";
  } else if (rarityRoll < 0.99 - (depth * 0.005)) {
    rarity = "epic";
  } else {
    rarity = "legendary";
  }
  
  // Select material based on rarity
  const materialIndex = Math.min(
    Math.floor(materials.length * (rarityRoll + (depth * 0.1))),
    materials.length - 1
  );
  const material = materials[materialIndex];
  
  // Generate name
  let name = "";
  if (rarity === "common") {
    name = `${material.name} ${armorType.name}`;
  } else if (rarity === "uncommon") {
    name = `${prefixes[random.randomInt(0, prefixes.length - 1)]} ${material.name} ${armorType.name}`;
  } else {
    name = `${prefixes[random.randomInt(0, prefixes.length - 1)]} ${material.name} ${armorType.name} ${suffixes[random.randomInt(0, suffixes.length - 1)]}`;
  }
  
  // Calculate defense based on armor type, material, depth, and rarity
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2,
    legendary: 3
  }[rarity] || 1;
  
  const depthMultiplier = 1 + (depth * 0.2);
  const baseDefense = random.randomInt(
    armorType.defenseMin, 
    armorType.defenseMax
  );
  
  const defense = Math.floor(baseDefense * material.multiplier * rarityMultiplier * depthMultiplier);
  
  // Generate bonuses
  const bonuses: Record<string, number> = {
    defense: defense
  };
  
  // Add additional bonuses based on rarity
  if (rarity !== "common") {
    const numBonuses = {
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4
    }[rarity] || 0;
    
    const possibleBonuses = [
      "strength", "dexterity", "vitality", "energy",
      "fireResist", "coldResist", "lightningResist", "poisonResist",
      "magicFind", "magicResist"
    ];
    
    for (let i = 0; i < numBonuses; i++) {
      const bonusType = possibleBonuses[random.randomInt(0, possibleBonuses.length - 1)];
      const bonusValue = Math.floor(random.randomInt(1, 3) * rarityMultiplier * depthMultiplier);
      bonuses[bonusType] = bonusValue;
    }
  }
  
  // Generate description
  let description = `A ${rarity} ${material.name.toLowerCase()} ${armorType.name.toLowerCase()} that provides ${defense} defense.`;
  
  // Calculate value
  const value = Math.floor(10 * material.multiplier * rarityMultiplier * depthMultiplier * (1 + Object.keys(bonuses).length * 0.5));
  
  // Generate armor
  return {
    id: `item-${seed}`,
    name,
    description,
    type: "armor",
    rarity,
    value,
    weight: random.randomFloat(1, 5),
    quantity: 1,
    slot: armorType.slot as any,
    bonuses,
    consumable: false,
    equipped: false,
    size: { width: 2, height: 2 },
    imageUrl: "https://images.unsplash.com/photo-1605826832916-d0a401ffc887?q=80&w=2070&auto=format&fit=crop"
  };
}

// Generate a random accessory
function generateAccessory(seed: string, depth: number, random: ReturnType<typeof createSeededRandom>): Item {
  const accessoryTypes = [
    { name: "Amulet", slot: "necklace" },
    { name: "Necklace", slot: "necklace" },
    { name: "Ring", slot: "ring1" },
    { name: "Band", slot: "ring1" }
  ];
  
  const materials = [
    "Silver", "Gold", "Platinum", "Mithril", "Adamantite", 
    "Obsidian", "Crystal", "Jade", "Ruby", "Sapphire", 
    "Emerald", "Diamond", "Amber", "Onyx", "Opal"
  ];
  
  const prefixes = [
    "Glowing", "Shimmering", "Radiant", "Ancient", "Masterwork", 
    "Enchanted", "Blessed", "Cursed", "Demonic", "Angelic",
    "Mystical", "Arcane", "Ethereal", "Celestial", "Infernal"
  ];
  
  const suffixes = [
    "of Power", "of Wisdom", "of Vitality", "of Protection", 
    "of the Mage", "of the Warrior", "of the Rogue", "of the Cleric",
    "of Insight", "of Foresight", "of Clarity", "of Focus"
  ];
  
  // Select accessory type
  const accessoryType = accessoryTypes[random.randomInt(0, accessoryTypes.length - 1)];
  
  // Determine rarity based on depth
  const rarityRoll = random.random();
  let rarity: string;
  
  if (rarityRoll < 0.6 - (depth * 0.05)) {
    rarity = "common";
  } else if (rarityRoll < 0.85 - (depth * 0.03)) {
    rarity = "uncommon";
  } else if (rarityRoll < 0.95 - (depth * 0.01)) {
    rarity = "rare";
  } else if (rarityRoll < 0.99 - (depth * 0.005)) {
    rarity = "epic";
  } else {
    rarity = "legendary";
  }
  
  // Select material
  const material = materials[random.randomInt(0, materials.length - 1)];
  
  // Generate name
  let name = "";
  if (rarity === "common") {
    name = `${material} ${accessoryType.name}`;
  } else if (rarity === "uncommon") {
    name = `${prefixes[random.randomInt(0, prefixes.length - 1)]} ${material} ${accessoryType.name}`;
  } else {
    name = `${prefixes[random.randomInt(0, prefixes.length - 1)]} ${material} ${accessoryType.name} ${suffixes[random.randomInt(0, suffixes.length - 1)]}`;
  }
  
  // Generate bonuses
  const bonuses: Record<string, number> = {};
  
  // Number of bonuses based on rarity
  const numBonuses = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  }[rarity] || 1;
  
  const possibleBonuses = [
    "strength", "dexterity", "vitality", "energy",
    "maxHealth", "maxMana", "attack", "defense",
    "fireResist", "coldResist", "lightningResist", "poisonResist",
    "magicFind", "magicResist"
  ];
  
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2,
    legendary: 3
  }[rarity] || 1;
  
  const depthMultiplier = 1 + (depth * 0.2);
  
  for (let i = 0; i < numBonuses; i++) {
    const bonusType = possibleBonuses[random.randomInt(0, possibleBonuses.length - 1)];
    const bonusValue = Math.floor(random.randomInt(1, 3) * rarityMultiplier * depthMultiplier);
    bonuses[bonusType] = bonusValue;
  }
  
  // Generate description
  let description = `A ${rarity} ${material.toLowerCase()} ${accessoryType.name.toLowerCase()} with magical properties.`;
  
  // Calculate value
  const value = Math.floor(15 * rarityMultiplier * depthMultiplier * (1 + Object.keys(bonuses).length * 0.5));
  
  // Generate accessory
  return {
    id: `item-${seed}`,
    name,
    description,
    type: "accessory",
    rarity,
    value,
    weight: random.randomFloat(0.1, 0.5),
    quantity: 1,
    slot: accessoryType.slot as any,
    bonuses,
    consumable: false,
    equipped: false,
    size: { width: 1, height: 1 },
    imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2088&auto=format&fit=crop"
  };
}

// Generate a random consumable
function generateConsumable(seed: string, depth: number, random: ReturnType<typeof createSeededRandom>): Item {
  const consumableTypes = [
    { name: "Health Potion", effect: "Restores health", color: "red" },
    { name: "Mana Potion", effect: "Restores mana", color: "blue" },
    { name: "Strength Elixir", effect: "Temporarily increases strength", color: "orange" },
    { name: "Dexterity Elixir", effect: "Temporarily increases dexterity", color: "green" },
    { name: "Vitality Elixir", effect: "Temporarily increases vitality", color: "yellow" },
    { name: "Energy Elixir", effect: "Temporarily increases energy", color: "purple" },
    { name: "Antidote", effect: "Cures poison", color: "green" },
    { name: "Fire Resistance Potion", effect: "Temporarily increases fire resistance", color: "red" },
    { name: "Cold Resistance Potion", effect: "Temporarily increases cold resistance", color: "blue" },
    { name: "Lightning Resistance Potion", effect: "Temporarily increases lightning resistance", color: "yellow" }
  ];
  
  const sizes = [
    { name: "Small", multiplier: 1 },
    { name: "Medium", multiplier: 1.5 },
    { name: "Large", multiplier: 2 },
    { name: "Greater", multiplier: 3 }
  ];
  
  // Select consumable type
  const consumableType = consumableTypes[random.randomInt(0, consumableTypes.length - 1)];
  
  // Determine size based on depth
  const sizeIndex = Math.min(
    Math.floor(sizes.length * (random.random() + (depth * 0.1))),
    sizes.length - 1
  );
  const size = sizes[sizeIndex];
  
  // Determine rarity based on size
  const rarities = ["common", "uncommon", "rare", "epic"];
  const rarity = rarities[sizeIndex];
  
  // Generate name
  const name = `${size.name} ${consumableType.name}`;
  
  // Calculate effect value based on size and depth
  const baseValue = random.randomInt(10, 20);
  const effectValue = Math.floor(baseValue * size.multiplier * (1 + (depth * 0.2)));
  
  // Generate description
  let description = `A ${size.name.toLowerCase()} ${consumableType.color} potion that ${consumableType.effect.toLowerCase()} by ${effectValue} points.`;
  
  // Calculate value
  const value = Math.floor(5 * size.multiplier * (1 + (depth * 0.2)));
  
  // Generate consumable
  return {
    id: `item-${seed}`,
    name,
    description,
    type: "consumable",
    rarity,
    value,
    weight: 0.5 * size.multiplier,
    quantity: random.randomInt(1, 3),
    bonuses: {},
    consumable: true,
    equipped: false,
    size: { width: 1, height: 1 },
    imageUrl: "https://images.unsplash.com/photo-1596133159219-9e262f491be9?q=80&w=2070&auto=format&fit=crop"
  };
}