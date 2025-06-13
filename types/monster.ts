import { Item } from "./item";

export interface MonsterStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  magicResist: number; // Ensure this property exists
  // Add other stats as needed
}

export interface MonsterAbility {
  name: string;
  description: string;
  damage: number;
  type: string; // physical, magical, etc.
  useChance: number; // 0.0 to 1.0
  // Add other properties as needed
}

export interface MonsterDrop {
  itemId: string;
  chance: number; // 0.0 to 1.0
  minQuantity: number;
  maxQuantity: number;
}

export interface Monster {
  id: string;
  name: string;
  description: string;
  level: number;
  type: string; // beast, undead, humanoid, etc.
  stats: MonsterStats;
  abilities: MonsterAbility[];
  drops: MonsterDrop[];
  imageUrl: string; // Required property
  // Add other properties as needed
}

export type BattleResult = "ongoing" | "victory" | "defeat" | "escape";

export interface PlayerStatus {
  poisoned: boolean;
  poisonTurnsLeft: number;
  sleeping: boolean;
  sleepTurnsLeft: number;
  paralyzed: boolean;
  paralysisTurnsLeft: number;
  confused: boolean;
  confusionTurnsLeft: number;
}

export interface TurnOrder {
  type: 'player' | 'monster';
  id: string;
  name: string;
  speed: number;
  index?: number; // Only for monsters
  status: string | null;
}

export interface BattleState {
  inBattle: boolean;
  monsters: Monster[];
  playerTurn: boolean;
  currentRound: number;
  battleLog: string[];
  playerStatus: PlayerStatus;
  selectedAction: BattleAction | null;
  selectedTarget: number | null;
  battleResult: BattleResult;
  rewards: { experience: number; gold: number; items: any[] } | null;
  canRun: boolean;
  turnOrder: TurnOrder[];
}

export interface BattleAction {
  type: "attack" | "spell" | "item" | "run";
  target?: number;
  spell?: string; // Changed from spellId to spell
  item?: Item;
}