import { createSeededRandom } from "./seedGenerator";
import { generateName } from "./nameGenerator";
import { Town, TownBuilding, TownService, Quest } from "@/types/town";

interface TownGenerationParams {
  seed: string;
  worldId: string;
  position: { x: number; y: number };
  depth: number;
  parentId: string | null;
}

/**
 * Generate a town with buildings, services, and quests
 */
export function generateTown(params: TownGenerationParams): Town {
  const { seed, worldId, position, depth, parentId } = params;
  const random = createSeededRandom(`${seed}-town-${position.x}-${position.y}`);
  
  // Generate town name
  const townName = generateName(random, "town");
  
  // Determine town size based on depth
  // Deeper towns (further from starting point) tend to be smaller
  const sizeFactor = Math.max(0.5, 1 - (depth * 0.1));
  const basePopulation = random.randomInt(100, 1000);
  const population = Math.floor(basePopulation * sizeFactor);
  
  // Determine town type/region based on position and random factors
  const regionTypes = [
    "Frontier", "Trading Post", "Mining Colony", "Farming Village", 
    "Fishing Village", "Military Outpost", "Religious Settlement",
    "Scholarly Haven", "Artisan Community", "Merchant Hub"
  ];
  const regionIndex = random.randomInt(0, regionTypes.length - 1);
  const region = regionTypes[regionIndex];
  
  // Generate town description
  const descriptions = [
    `A small ${region.toLowerCase()} nestled in the wilderness.`,
    `A bustling ${region.toLowerCase()} known for its local crafts.`,
    `A quiet ${region.toLowerCase()} where travelers can rest.`,
    `A fortified ${region.toLowerCase()} that stands against the dangers of the wild.`,
    `An ancient ${region.toLowerCase()} with a rich history.`,
    `A newly established ${region.toLowerCase()} seeking to grow.`
  ];
  const descriptionIndex = random.randomInt(0, descriptions.length - 1);
  const description = descriptions[descriptionIndex];
  
  // Generate buildings
  const buildings = generateTownBuildings(random, townName, region, depth);
  
  // Generate quests
  const quests = generateTownQuests(random, townName, region, depth);
  
  // Create town object
  const town: Town = {
    id: `town-${worldId}-${position.x}-${position.y}`,
    name: townName,
    description,
    region,
    population,
    position,
    worldId,
    depth,
    parentId,
    buildings,
    quests,
    lastVisited: null,
    influenceRadius: 1 + Math.floor(population / 200), // Larger towns have bigger influence
    founded: Date.now()
  };
  
  return town;
}

/**
 * Generate buildings for a town
 */
function generateTownBuildings(
  random: ReturnType<typeof createSeededRandom>,
  townName: string,
  region: string,
  depth: number
): TownBuilding[] {
  const buildings: TownBuilding[] = [];
  
  // Every town has an inn
  const innNames = [
    "The Sleeping Dragon", "The Weary Traveler", "The Golden Hearth",
    "The Rusty Anchor", "The Silver Chalice", "The Drunken Mage"
  ];
  const innNameIndex = random.randomInt(0, innNames.length - 1);
  const innName = innNames[innNameIndex];
  
  buildings.push({
    id: `inn-${townName.toLowerCase().replace(/\s/g, "-")}`,
    name: innName,
    description: "A place to rest and recover from your adventures.",
    type: "inn",
    services: [
      {
        id: "rest",
        name: "Rest and Recover",
        description: "Fully restore your health and mana.",
        type: "heal",
        cost: 10 + (depth * 5),
        level: 1
      }
    ]
  });
  
  // Every town has a tavern (for quests and recruitment)
  const tavernNames = [
    "The Laughing Bard", "The Tipsy Troll", "The Broken Shield",
    "The Hungry Ogre", "The Whispering Raven", "The Salty Dog"
  ];
  const tavernNameIndex = random.randomInt(0, tavernNames.length - 1);
  const tavernName = tavernNames[tavernNameIndex];
  
  buildings.push({
    id: `tavern-${townName.toLowerCase().replace(/\s/g, "-")}`,
    name: tavernName,
    description: "A lively place where adventurers gather to share tales and find work.",
    type: "tavern",
    services: [
      {
        id: "recruit",
        name: "Recruit Companions",
        description: "Hire adventurers to join your party.",
        type: "recruit",
        cost: 50 + (depth * 25),
        level: 1 + Math.floor(depth / 2)
      },
      {
        id: "quest-board",
        name: "Quest Board",
        description: "Find available quests in the area.",
        type: "quest",
        cost: 0,
        level: 1
      }
    ]
  });
  
  // Add a shop
  const shopNames = [
    "General Goods", "Adventurer's Supplies", "The Trading Post",
    "Rare Finds", "The Market Stall", "Wilderness Outfitters"
  ];
  const shopNameIndex = random.randomInt(0, shopNames.length - 1);
  const shopName = shopNames[shopNameIndex];
  
  buildings.push({
    id: `shop-${townName.toLowerCase().replace(/\s/g, "-")}`,
    name: shopName,
    description: "A shop selling various goods and supplies.",
    type: "shop",
    services: [
      {
        id: "buy",
        name: "Buy Items",
        description: "Purchase items from the shop.",
        type: "buy",
        cost: 0,
        level: 1 + Math.floor(depth / 3)
      },
      {
        id: "sell",
        name: "Sell Items",
        description: "Sell items to the shop.",
        type: "sell",
        cost: 0,
        level: 1
      }
    ]
  });
  
  // Add region-specific buildings
  switch (region) {
    case "Mining Colony":
      buildings.push({
        id: `blacksmith-${townName.toLowerCase().replace(/\s/g, "-")}`,
        name: "The Forge",
        description: "A blacksmith specializing in weapons and armor.",
        type: "blacksmith",
        services: [
          {
            id: "upgrade",
            name: "Upgrade Equipment",
            description: "Improve your weapons and armor.",
            type: "upgrade",
            cost: 100 + (depth * 50),
            level: 1 + depth
          }
        ]
      });
      break;
      
    case "Scholarly Haven":
      buildings.push({
        id: `library-${townName.toLowerCase().replace(/\s/g, "-")}`,
        name: "The Archives",
        description: "A repository of knowledge and magical scrolls.",
        type: "library",
        services: [
          {
            id: "learn-spell",
            name: "Learn Spells",
            description: "Study new magical abilities.",
            type: "learn",
            cost: 150 + (depth * 75),
            level: 1 + depth
          }
        ]
      });
      break;
      
    case "Religious Settlement":
      buildings.push({
        id: `temple-${townName.toLowerCase().replace(/\s/g, "-")}`,
        name: "The Sanctuary",
        description: "A place of worship and healing.",
        type: "temple",
        services: [
          {
            id: "blessing",
            name: "Receive Blessing",
            description: "Gain temporary bonuses to your abilities.",
            type: "buff",
            cost: 75 + (depth * 25),
            level: 1 + Math.floor(depth / 2)
          },
          {
            id: "cure",
            name: "Cure Ailments",
            description: "Remove curses and negative status effects.",
            type: "cure",
            cost: 50 + (depth * 20),
            level: 1
          }
        ]
      });
      break;
  }
  
  // Randomly add one more building
  const extraBuildingChance = 0.5 + (depth * 0.1);
  if (random.randomBool(extraBuildingChance)) {
    const extraBuildingTypes = [
      "alchemist", "jeweler", "stables", "guild", "bank"
    ];
    const extraBuildingIndex = random.randomInt(0, extraBuildingTypes.length - 1);
    const extraBuildingType = extraBuildingTypes[extraBuildingIndex];
    
    let extraBuilding: TownBuilding;
    
    switch (extraBuildingType) {
      case "alchemist":
        extraBuilding = {
          id: `alchemist-${townName.toLowerCase().replace(/\s/g, "-")}`,
          name: "The Bubbling Cauldron",
          description: "An alchemist's shop filled with potions and elixirs.",
          type: "alchemist",
          services: [
            {
              id: "buy-potions",
              name: "Buy Potions",
              description: "Purchase healing and magical potions.",
              type: "buy",
              cost: 0,
              level: 1 + Math.floor(depth / 2)
            },
            {
              id: "craft-potions",
              name: "Craft Potions",
              description: "Create potions from gathered ingredients.",
              type: "craft",
              cost: 25 + (depth * 10),
              level: 1 + depth
            }
          ]
        };
        break;
        
      case "jeweler":
        extraBuilding = {
          id: `jeweler-${townName.toLowerCase().replace(/\s/g, "-")}`,
          name: "The Glittering Gem",
          description: "A jeweler specializing in magical gems and enchanted jewelry.",
          type: "jeweler",
          services: [
            {
              id: "buy-gems",
              name: "Buy Gems",
              description: "Purchase magical gems and jewelry.",
              type: "buy",
              cost: 0,
              level: 2 + depth
            },
            {
              id: "socket-gems",
              name: "Socket Gems",
              description: "Add gem sockets to your equipment.",
              type: "upgrade",
              cost: 200 + (depth * 100),
              level: 3 + depth
            }
          ]
        };
        break;
        
      case "stables":
        extraBuilding = {
          id: `stables-${townName.toLowerCase().replace(/\s/g, "-")}`,
          name: "The Swift Steed",
          description: "A stable offering mounts and transportation services.",
          type: "stables",
          services: [
            {
              id: "rent-mount",
              name: "Rent Mount",
              description: "Rent a mount for faster travel.",
              type: "travel",
              cost: 50 + (depth * 25),
              level: 1 + Math.floor(depth / 2)
            }
          ]
        };
        break;
        
      case "guild":
        extraBuilding = {
          id: `guild-${townName.toLowerCase().replace(/\s/g, "-")}`,
          name: "Adventurer's Guild",
          description: "A guild hall where adventurers can find work and training.",
          type: "guild",
          services: [
            {
              id: "training",
              name: "Training",
              description: "Receive training to gain experience.",
              type: "train",
              cost: 100 + (depth * 50),
              level: 1 + depth
            },
            {
              id: "special-quests",
              name: "Special Quests",
              description: "Take on high-reward, high-risk quests.",
              type: "quest",
              cost: 0,
              level: 2 + depth
            }
          ]
        };
        break;
        
      case "bank":
      default:
        extraBuilding = {
          id: `bank-${townName.toLowerCase().replace(/\s/g, "-")}`,
          name: "The Secure Vault",
          description: "A bank where you can store your valuables.",
          type: "bank",
          services: [
            {
              id: "store-items",
              name: "Store Items",
              description: "Store items in your personal vault.",
              type: "storage",
              cost: 10 + (depth * 5),
              level: 1
            },
            {
              id: "currency-exchange",
              name: "Currency Exchange",
              description: "Exchange different types of currency.",
              type: "exchange",
              cost: 0,
              level: 1 + Math.floor(depth / 2)
            }
          ]
        };
        break;
    }
    
    buildings.push(extraBuilding);
  }
  
  return buildings;
}

/**
 * Generate quests for a town
 */
export function generateTownQuests(
  random: ReturnType<typeof createSeededRandom>,
  townName: string,
  region: string,
  depth: number
): Quest[] {
  const quests: Quest[] = [];
  
  // Determine number of quests based on depth
  const numQuests = 1 + Math.floor(depth / 2) + random.randomInt(0, 2);
  
  for (let i = 0; i < numQuests; i++) {
    // Generate a monster hunting quest
    const quest = generateQuest(random, townName, region, depth);
    quests.push(quest);
  }
  
  return quests;
}

/**
 * Generate a single quest
 */
export function generateQuest(
  random: ReturnType<typeof createSeededRandom>,
  townName: string,
  region: string,
  depth: number
): Quest {
  // Monster hunting quest
  const monsterTypes = [
    "wolves", "bandits", "goblins", "skeletons", "spiders", "slimes",
    "trolls", "orcs", "cultists", "elementals", "demons", "undead"
  ];
  
  const monsterIndex = random.randomInt(0, monsterTypes.length - 1);
  const monsterType = monsterTypes[monsterIndex];
  
  // Calculate quest difficulty based on depth
  const difficulty = 1 + depth + random.randomInt(-1, 2);
  
  // Calculate quantity based on difficulty (must be a whole number)
  const baseQuantity = Math.max(1, Math.floor(difficulty / 2));
  const quantity = baseQuantity + random.randomInt(0, 2);
  
  // Calculate rewards based on difficulty and quantity
  const baseRewardXP = 50 * difficulty;
  const baseRewardCurrency = 25 * difficulty;
  
  const rewardXP = baseRewardXP * quantity;
  const rewardCurrency = baseRewardCurrency * quantity;
  
  // Generate quest title
  const titles = [
    `Extermination: ${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)}`,
    `Hunting ${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)}`,
    `${townName}'s ${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)} Problem`,
    `Clearing Out the ${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)}`,
    `Bounty: ${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)}`
  ];
  
  const titleIndex = random.randomInt(0, titles.length - 1);
  const title = titles[titleIndex];
  
  // Generate quest description
  const descriptions = [
    `The town of ${townName} has been troubled by ${monsterType} recently. Eliminate ${quantity} of them to earn a reward.`,
    `${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)} have been attacking travelers near ${townName}. Hunt down ${quantity} of them.`,
    `A bounty has been placed on ${monsterType} in the ${region}. Bring proof of killing ${quantity} of them.`,
    `The local guild is offering a reward for adventurers who can eliminate ${quantity} ${monsterType} from the area.`,
    `${townName} needs help dealing with ${monsterType}. Slay ${quantity} of them to earn the town's gratitude and a reward.`
  ];
  
  const descriptionIndex = random.randomInt(0, descriptions.length - 1);
  const description = descriptions[descriptionIndex];
  
  // Create quest object
  const quest: Quest = {
    id: `quest-${townName.toLowerCase().replace(/\s/g, "-")}-${monsterType}-${Date.now()}`,
    title,
    description,
    type: "hunt",
    targetType: monsterType,
    targetQuantity: quantity,
    difficulty,
    rewardXP,
    rewardCurrency,
    rewardItems: [],
    giver: `${generateName(random, "npc")} of ${townName}`,
    location: `Near ${townName}`,
    timeLimit: null,
    isAvailable: true,
    isCompleted: false
  };
  
  // Add a chance for an item reward for higher difficulty quests
  if (difficulty > 3 && random.randomBool(0.5)) {
    quest.rewardItems.push({
      id: `reward-item-${Date.now()}`,
      name: `${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)} Hunter's Trophy`,
      description: "A trophy awarded for successful monster hunting.",
      type: "quest",
      rarity: difficulty > 5 ? "rare" : "uncommon",
      value: rewardCurrency / 2,
      weight: 1
    });
  }
  
  return quest;
}