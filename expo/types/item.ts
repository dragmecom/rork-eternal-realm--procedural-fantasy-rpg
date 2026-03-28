export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'offhand' | 'feet' | 'head' | 'hands' | 'necklace' | 'ring' | 'consumable' | 'quest' | 'material' | 'gem';

export type EquipmentSlot = 'head' | 'body' | 'hands' | 'feet' | 'mainHand' | 'offHand' | 'necklace' | 'ring1' | 'ring2';

export interface ItemBonuses {
  [key: string]: number;
}

export interface ConsumableEffect {
  health?: number;
  mana?: number;
  statusCure?: 'poison' | 'sleep' | 'paralysis' | 'confusion' | 'all';
  tempBonus?: {
    stat: string;
    amount: number;
    duration: number;
  };
}

export interface Item {
  id: string; // Required, not optional
  name: string;
  description: string;
  type: string;
  rarity: ItemRarity;
  value: number;
  weight: number;
  level?: number;
  slot?: EquipmentSlot;
  bonuses: ItemBonuses;
  requirements?: {
    level?: number;
    strength?: number;
    dexterity?: number;
    energy?: number;
  };
  consumable?: ConsumableEffect;
  quantity: number;
  equipped?: boolean;
  imageUrl?: string;
}