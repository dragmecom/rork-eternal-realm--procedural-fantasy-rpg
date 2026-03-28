import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Equipment } from "@/types/game";
import { Item } from "@/types/item";
import { getItemRarityColor } from "@/utils/itemUtils";

interface EquipmentSlotsProps {
  equipment: Equipment;
  onSelectItem: (item: Item) => void;
}

const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({ equipment, onSelectItem }) => {
  // Define equipment slots with their display names
  const slots = [
    { key: "head", name: "Head" },
    { key: "body", name: "Body" },
    { key: "hands", name: "Hands" },
    { key: "feet", name: "Feet" },
    { key: "mainHand", name: "Main Hand" },
    { key: "offHand", name: "Off Hand" },
    { key: "necklace", name: "Necklace" },
    { key: "ring1", name: "Ring 1" },
    { key: "ring2", name: "Ring 2" }
  ];

  return (
    <View style={styles.container}>
      {slots.map(slot => {
        const item = equipment[slot.key as keyof Equipment];
        const isEmpty = !item;
        
        return (
          <TouchableOpacity
            key={slot.key}
            style={[
              styles.slot,
              isEmpty ? styles.emptySlot : styles.filledSlot,
              !isEmpty && { borderColor: getItemRarityColor(item.rarity) }
            ]}
            onPress={() => !isEmpty && onSelectItem(item)}
            disabled={isEmpty}
          >
            {isEmpty ? (
              <Text style={styles.slotName}>{slot.name}</Text>
            ) : (
              <View style={styles.itemContainer}>
                <Text 
                  style={[styles.itemName, { color: getItemRarityColor(item.rarity) }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "rgba(20, 20, 20, 0.7)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  slot: {
    width: "31%",
    height: 60,
    marginBottom: 10,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderWidth: 2,
  },
  emptySlot: {
    backgroundColor: "rgba(40, 40, 40, 0.5)",
    borderColor: "#444",
  },
  filledSlot: {
    backgroundColor: "rgba(30, 30, 30, 0.8)",
  },
  slotName: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },
  itemContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: {
    fontSize: 12,
    textAlign: "center",
  }
});

export default EquipmentSlots;