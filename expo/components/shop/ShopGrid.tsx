import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Item } from '@/types/item';
import { getItemRarityColor, getItemTypeIcon } from '@/utils/itemUtils';

interface ShopGridProps {
  items: Item[];
  onSelectItem: (item: Item, position: {x: number, y: number}) => void;
}

const ShopGrid: React.FC<ShopGridProps> = ({ items, onSelectItem }) => {
  // Function to handle item press
  const handleItemPress = (item: Item, event: any) => {
    // Get the position of the touch
    const { pageX, pageY } = event.nativeEvent;
    
    // Calculate tooltip position
    // We want to show the tooltip to the right of the item if possible
    // If not, show it to the left
    const tooltipPosition = {
      x: pageX,
      y: pageY
    };
    
    onSelectItem(item, tooltipPosition);
  };
  
  // Get grid size for an item
  const getItemSize = (item: Item) => {
    // Default size is 1x1
    const size = item.size || { width: 1, height: 1 };
    
    return {
      width: size.width * 70 + (size.width - 1) * 10, // 70px per cell + 10px gap
      height: size.height * 70 + (size.height - 1) * 10
    };
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Available Items</Text>
      
      <View style={styles.gridContainer}>
        {items.map((item, index) => {
          const itemSize = getItemSize(item);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.itemContainer,
                { 
                  width: itemSize.width,
                  height: itemSize.height,
                  borderColor: getItemRarityColor(item.rarity)
                }
              ]}
              onPress={(event) => handleItemPress(item, event)}
            >
              <View style={styles.itemContent}>
                {getItemTypeIcon(item.type)}
                <Text 
                  style={[
                    styles.itemName,
                    { color: getItemRarityColor(item.rarity) }
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>{item.value} gold</Text>
                {item.quantity && item.quantity > 1 && (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    paddingBottom: 20,
  },
  itemContainer: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    overflow: 'hidden',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  itemName: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 9,
    color: '#f1c40f',
    textAlign: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ShopGrid;