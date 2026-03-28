import { Item } from './item';
import { PartyMember } from './game';

export interface Town {
  id: string;
  name: string;
  description: string;
  worldId: string;
  position: {
    x: number;
    y: number;
  };
  population: number;
  prosperity: number;
  safety: number;
  buildings: Building[];
  quests: string[];
  shopInventory: Item[];
  tavernRecruits: PartyMember[];
  depth: number;
  parentId: string | null;
  lastVisited?: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'inn' | 'shop' | 'blacksmith' | 'tavern' | 'temple' | 'guild';
  description: string;
  level: number;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
}