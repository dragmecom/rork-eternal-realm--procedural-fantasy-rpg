import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sword, Shield, CircleUser, Shirt, Footprints, Gem } from 'lucide-react-native';
import { Item, ItemRarity } from '@/types/item';

// Get icon for item type
export const getItemIcon = (type: string, size: number = 24, color: string = '#fff') => {
  switch (type) {
    case 'weapon':
      return <Sword size={size} color={color} />;
    case 'armor':
      return <Shirt size={size} color={color} />;
    case 'accessory':
      return <CircleUser size={size} color={color} />;
    case 'offhand':
      return <Shield size={size} color={color} />;
    case 'feet':
      return <Footprints size={size} color={color} />;
    case 'gem':
      return <Gem size={size} color={color} />;
    default:
      return <Gem size={size} color={color} />;
  }
};

// Get color for item rarity
export const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case 'common':
      return '#aaaaaa';
    case 'uncommon':
      return '#1eff00';
    case 'rare':
      return '#0070dd';
    case 'epic':
      return '#a335ee';
    case 'legendary':
      return '#ff8000';
    case 'artifact':
      return '#e6cc80';
    default:
      return '#ffffff';
  }
};

// Alias for backward compatibility
export const getItemRarityColor = getRarityColor;

// Get icon for item type - alias for backward compatibility
export const getItemTypeIcon = getItemIcon;

// Format item description with bonuses
export const formatItemDescription = (item: Item): string => {
  let description = item.description;
  
  if (Object.keys(item.bonuses).length > 0) {
    description += "\n\nBonuses:";
    
    for (const [stat, value] of Object.entries(item.bonuses)) {
      const formattedStat = stat
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      
      description += `\n+${value} ${formattedStat}`;
    }
  }
  
  return description;
};

// Get item value with color based on comparison
export const getComparisonValue = (
  currentValue: number | undefined,
  newValue: number | undefined
): { value: string; color: string } => {
  if (currentValue === undefined || newValue === undefined) {
    return { value: newValue?.toString() || '0', color: '#ffffff' };
  }
  
  if (newValue > currentValue) {
    return { value: `+${newValue}`, color: '#1eff00' };
  } else if (newValue < currentValue) {
    return { value: `${newValue}`, color: '#ff0000' };
  } else {
    return { value: `${newValue}`, color: '#ffffff' };
  }
};

// Compare item stats with equipped item
export const compareItems = (
  newItem: Item,
  equippedItem: Item | null
): { [key: string]: { current: number; new: number; diff: number } } => {
  const stats: { [key: string]: { current: number; new: number; diff: number } } = {};
  
  // Add all stats from new item
  Object.entries(newItem.bonuses).forEach(([stat, value]) => {
    stats[stat] = {
      current: 0,
      new: Number(value),
      diff: Number(value)
    };
  });
  
  // Add all stats from equipped item
  if (equippedItem) {
    Object.entries(equippedItem.bonuses).forEach(([stat, value]) => {
      if (stats[stat]) {
        stats[stat].current = Number(value);
        stats[stat].diff = stats[stat].new - stats[stat].current;
      } else {
        stats[stat] = {
          current: Number(value),
          new: 0,
          diff: -Number(value)
        };
      }
    });
  }
  
  return stats;
};