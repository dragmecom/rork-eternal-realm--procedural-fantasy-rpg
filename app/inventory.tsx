import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useGameState } from "@/context/GameContext";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import EquipmentSlots from "@/components/inventory/EquipmentSlots";
import ItemTooltip from "@/components/inventory/ItemTooltip";
import { Item } from "@/types/item";

export default function InventoryScreen() {
  const router = useRouter();
  const { gameState, equipItem, unequipItem, dropItem } = useGameState();
  const { player } = gameState;
  
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle selecting an item
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setShowTooltip(true);
  };
  
  // Handle equipping an item
  const handleEquipItem = (item: Item) => {
    if (equipItem) {
      equipItem(item.id);
      setShowTooltip(false);
      setSelectedItem(null);
    }
  };
  
  // Handle unequipping an item
  const handleUnequipItem = (item: Item) => {
    if (unequipItem) {
      unequipItem(item.id);
      setShowTooltip(false);
      setSelectedItem(null);
    }
  };
  
  // Handle dropping an item
  const handleDropItem = (item: Item) => {
    if (dropItem) {
      dropItem(item.id);
      setShowTooltip(false);
      setSelectedItem(null);
    }
  };
  
  // Close the tooltip
  const handleCloseTooltip = () => {
    setShowTooltip(false);
    setSelectedItem(null);
  };
  
  if (!player) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(20,20,20,0.9)']}
        style={styles.overlay}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#d4af37" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Inventory</Text>
          <View style={styles.spacer} />
        </View>
        
        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerClass}>{player.class} - Level {player.level}</Text>
          <Text style={styles.currencyText}>{player.currency} Gold</Text>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <EquipmentSlots 
              equipment={player.equipment}
              onSelectItem={handleSelectItem}
            />
          </View>
          
          {/* Inventory */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Inventory ({player.inventory.length}/{player.inventoryCapacity})
            </Text>
            <InventoryGrid 
              items={player.inventory}
              onSelectItem={handleSelectItem}
            />
          </View>
        </ScrollView>
        
        {/* Item Tooltip */}
        {showTooltip && selectedItem && (
          <View style={styles.tooltipContainer}>
            <ItemTooltip
              item={selectedItem}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
              onDrop={handleDropItem}
              onClose={handleCloseTooltip}
              isEquipped={selectedItem.equipped}
            />
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  loadingText: {
    color: "#ddd",
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#6b5a3e",
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    color: "#d4af37",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  spacer: {
    width: 40,
  },
  playerInfo: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#6b5a3e",
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playerClass: {
    color: "#bbb",
    fontSize: 16,
    marginBottom: 8,
  },
  currencyText: {
    color: "#d4af37",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  tooltipContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -110 }],
    zIndex: 100,
  }
});