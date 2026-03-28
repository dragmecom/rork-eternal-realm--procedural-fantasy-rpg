import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
import { Item } from "@/types/item";
import { getItemRarityColor, getItemTypeIcon } from "@/utils/itemUtils";

interface InventoryGridProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ items, onSelectItem }) => {
  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        { borderColor: getItemRarityColor(item.rarity) }
      ]}
      onPress={() => onSelectItem(item)}
    >
      <View style={styles.itemContent}>
        {getItemTypeIcon(item.type)}
        <Text 
          style={[
            styles.itemName,
            { color: getItemRarityColor(item.rarity) }
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {item.quantity && item.quantity > 1 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>
        )}
        {item.equipped && (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedText}>E</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your inventory is empty</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={4}
          contentContainerStyle={styles.gridContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingVertical: 8,
  },
  itemContainer: {
    width: 70,
    height: 70,
    margin: 5,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "rgba(20, 20, 20, 0.7)",
    overflow: "hidden",
  },
  itemContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  itemName: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  quantityBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  equippedBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0, 150, 0, 0.7)",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  equippedText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  }
});

export default InventoryGrid;