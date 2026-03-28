import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useGameState } from "@/context/GameContext";
import WorldMap from "@/components/map/WorldMap";
import { MapTile } from "@/types/map";
import { ArrowLeft } from "lucide-react-native";

export default function MapScreen() {
  const router = useRouter();
  const { gameState } = useGameState();
  const { player, currentWorld } = gameState;
  
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null);
  
  // Handle selecting a tile on the map
  const handleSelectTile = (tile: MapTile) => {
    setSelectedTile(tile);
  };
  
  // Handle fast travel to a town
  const handleFastTravel = () => {
    if (!selectedTile || !selectedTile.hasTown) return;
    
    // Update player position to the selected town
    // This would typically have more logic, like checking if the town is discovered
    // or if fast travel is allowed, etc.
    router.push("/town");
  };
  
  if (!player || !currentWorld) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
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
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>World Map</Text>
          
          <View style={styles.headerRight} />
        </View>
        
        {/* World Map */}
        <View style={styles.mapContainer}>
          <WorldMap onSelectTile={handleSelectTile} />
        </View>
        
        {/* Fast Travel Button (if a town is selected) */}
        {selectedTile && selectedTile.hasTown && (
          <View style={styles.fastTravelContainer}>
            <TouchableOpacity
              style={styles.fastTravelButton}
              onPress={handleFastTravel}
            >
              <Text style={styles.fastTravelText}>Fast Travel to Town</Text>
            </TouchableOpacity>
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#d4af37",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  headerRight: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
  },
  fastTravelContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#6b5a3e",
  },
  fastTravelButton: {
    backgroundColor: "#6b5a3e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4af37",
  },
  fastTravelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});