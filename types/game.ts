import { Item } from './item';
import { Town } from './town';
import { Quest } from './quest';
import { BiomeType, WeatherType, AdventureOption } from './map';

// Export GameMapTile for use in game context
export interface GameMapTile {
  x: number;
  y: number;
  biome: BiomeType;
  elevation: number;
  humidity: number;
  temperature: number;
  explored: boolean;
  hasTown: boolean;
  town?: Town;
  description?: string;
  worldId: string;
  weather?: WeatherType;
  type: string; // Changed from optional to required
  moisture?: number;
  // Add properties from MapTile to make it compatible
  difficulty: number;
  discovered: boolean;
  options: AdventureOption[];
}

export interface GameState {
  player: Player | null;
  currentWorld: World | null;
  discoveredTiles: GameMapTile[];
  towns: Town[];
  activeQuests: Quest[];
  completedQuests: string[];
  lastVisitedTown: string | null;
  lastSaveTimestamp: number;
  partyMembers: PartyMember[];
}

export interface Player {
  name: string;
  class: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  statPoints: number;
  stats: PlayerStats;
  position: { x: number; y: number };
  inventory: Item[];
  inventoryCapacity: number;
  equipment: Equipment;
  currency: number;
  boat_flag: boolean;
}

export interface PlayerStats {
  strength: number;
  dexterity: number;
  vitality: number;
  energy: number;
  maxHealth: number;
  currentHealth: number;
  maxMana: number;
  currentMana: number;
  attack: number;
  defense: number;
  fireResist: number;
  coldResist: number;
  lightningResist: number;
  poisonResist: number;
  magicFind: number;
  magicResist: number;
}

export interface Equipment {
  head: Item | null;
  body: Item | null;
  hands: Item | null;
  feet: Item | null;
  mainHand: Item | null;
  offHand: Item | null;
  necklace: Item | null;
  ring1: Item | null;
  ring2: Item | null;
}

export interface World {
  id: string;
  name: string;
  seed: string;
  mapSize: number;
  difficultyBias: number;
  climateBias: number;
  moistureBias: number;
  numTowns: number;
  createdAt: number;
}

export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
  stats: PlayerStats;
  equipment: Equipment;
  abilities: Ability[];
  portrait?: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  damage?: number;
  healing?: number;
  effects?: AbilityEffect[];
  targetType: 'single' | 'all' | 'self' | 'ally';
  element?: 'fire' | 'cold' | 'lightning' | 'poison' | 'physical' | 'magic';
}

export interface AbilityEffect {
  type: 'buff' | 'debuff' | 'dot' | 'hot';
  stat?: string;
  value: number;
  duration: number;
}