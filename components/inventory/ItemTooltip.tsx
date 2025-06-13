import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameState } from '@/context/GameContext';
import { Item } from '@/types/item';

interface ItemTooltipProps {
  item: Item;
  onEquip?: (item: Item) => void;
  onUnequip?: (item: Item) => void;
  onDrop?: (item: Item) => void;
  onClose: () => void;
  isEquipped?: boolean;
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ 
  item, 
  onEquip,
  onUnequip,
  onDrop,
  onClose,
  isEquipped = false
}) => {
  const { equipItem, unequipItem, dropItem } = useGameState();

  // Handle equip/unequip item
  const handleEquipToggle = () => {
    if (isEquipped) {
      if (onUnequip) {
        onUnequip(item);
      } else if (unequipItem) {
        unequipItem(item.id);
      }
    } else {
      if (onEquip) {
        onEquip(item);
      } else if (equipItem) {
        equipItem(item.id);
      }
    }
    // Close tooltip immediately after action
    onClose();
  };

  // Handle drop item
  const handleDrop = () => {
    if (onDrop) {
      onDrop(item);
    } else if (dropItem) {
      dropItem(item.id);
    }
    onClose();
  };

  // Handle use item (for consumables)
  const handleUse = () => {
    // Logic for using consumable items would go here
    console.log("Using item:", item.name);
    onClose();
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#ffffff';
      case 'uncommon':
        return '#1eff00';
      case 'rare':
        return '#0070dd';
      case 'epic':
        return '#a335ee';
      case 'legendary':
        return '#ff8000';
      default:
        return '#ffffff';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.itemName, { color: getRarityColor(item.rarity) }]}>
        {item.name}
      </Text>
      
      <Text style={styles.itemType}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        {item.slot ? ` - ${item.slot.charAt(0).toUpperCase() + item.slot.slice(1)}` : ''}
      </Text>
      
      <Text style={styles.itemDescription}>{item.description}</Text>
      
      {/* Item stats/bonuses */}
      {item.bonuses && Object.keys(item.bonuses).length > 0 && (
        <View style={styles.statsContainer}>
          {Object.entries(item.bonuses).map(([stat, value]) => (
            <Text key={stat} style={styles.statText}>
              {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{value}
            </Text>
          ))}
        </View>
      )}
      
      {/* Consumable effects */}
      {item.consumable && (
        <View style={styles.statsContainer}>
          {item.consumable.health && (
            <Text style={styles.statText}>Restores {item.consumable.health} Health</Text>
          )}
          {item.consumable.mana && (
            <Text style={styles.statText}>Restores {item.consumable.mana} Mana</Text>
          )}
          {item.consumable.statusCure && (
            <Text style={styles.statText}>
              Cures: {item.consumable.statusCure}
            </Text>
          )}
        </View>
      )}
      
      <Text style={styles.itemValue}>Value: {item.value} gold</Text>
      
      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {item.type === 'consumable' ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleUse}>
            <Text style={styles.actionButtonText}>Use</Text>
          </TouchableOpacity>
        ) : item.slot ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleEquipToggle}>
            <Text style={styles.actionButtonText}>
              {isEquipped ? 'Unequip' : 'Equip'}
            </Text>
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDrop}>
          <Text style={styles.actionButtonText}>Drop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
          <Text style={styles.actionButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6b5a3e',
    zIndex: 1000,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemType: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 8,
  },
  itemDescription: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statText: {
    color: '#2ecc71',
    fontSize: 14,
    marginBottom: 2,
  },
  itemValue: {
    color: '#f1c40f',
    fontSize: 14,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#6b5a3e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ItemTooltip;