import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGameState } from "@/context/GameContext";
import { MapTile } from "@/types/map";
import { getBiomeColor } from "@/utils/mapUtils";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react-native";

const TILE_SIZE = 20; // Size of each tile in pixels
const PADDING = 20; // Padding around the map

interface WorldMapProps {
  onSelectTile?: (tile: MapTile) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ onSelectTile }) => {
  const { gameState } = useGameState();
  const { player, currentWorld, discoveredTiles, towns } = gameState;
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const windowDimensions = Dimensions.get("window");
  
  // Initialize map size and center on player
  useEffect(() => {
    if (currentWorld && player) {
      const worldSize = currentWorld.mapSize;
      setMapSize({
        width: worldSize * TILE_SIZE,
        height: worldSize * TILE_SIZE
      });
      
      // Center on player
      centerOnPlayer();
    }
  }, [currentWorld, player]);
  
  // Center the map on the player's position
  const centerOnPlayer = () => {
    if (!player || !currentWorld) return;
    
    const worldSize = currentWorld.mapSize;
    const centerX = (windowDimensions.width / 2) - (player.position.x * TILE_SIZE * scale) - (TILE_SIZE * scale / 2);
    const centerY = (windowDimensions.height / 2) - (player.position.y * TILE_SIZE * scale) - (TILE_SIZE * scale / 2);
    
    setOffset({ x: centerX, y: centerY });
  };
  
  // Show the entire map
  const showEntireMap = () => {
    if (!currentWorld) return;
    
    const worldSize = currentWorld.mapSize;
    const mapWidth = worldSize * TILE_SIZE;
    const mapHeight = worldSize * TILE_SIZE;
    
    // Calculate scale to fit the entire map
    const scaleX = (windowDimensions.width - PADDING * 2) / mapWidth;
    const scaleY = (windowDimensions.height - PADDING * 2) / mapHeight;
    const newScale = Math.min(scaleX, scaleY);
    
    // Center the map
    const centerX = (windowDimensions.width - (mapWidth * newScale)) / 2;
    const centerY = (windowDimensions.height - (mapHeight * newScale)) / 2;
    
    setScale(newScale);
    setOffset({ x: centerX, y: centerY });
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.2));
  };
  
  // Handle touch start for dragging
  const handleTouchStart = (e: any) => {
    setIsDragging(true);
    setStartDrag({
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY
    });
    setStartOffset({ ...offset });
  };
  
  // Handle touch move for dragging
  const handleTouchMove = (e: any) => {
    if (!isDragging) return;
    
    const dx = e.nativeEvent.pageX - startDrag.x;
    const dy = e.nativeEvent.pageY - startDrag.y;
    
    setOffset({
      x: startOffset.x + dx,
      y: startOffset.y + dy
    });
  };
  
  // Handle touch end for dragging
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Handle tile selection
  const handleTilePress = (tile: MapTile) => {
    setSelectedTile(tile);
    if (onSelectTile) {
      onSelectTile(tile);
    }
  };
  
  // Check if a town has been discovered
  const isTownDiscovered = (townId: string) => {
    const town = towns.find(t => t.id === townId);
    if (!town) return false;
    
    return town.lastVisited !== undefined && town.lastVisited > 0;
  };
  
  if (!currentWorld || !player) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleZoomIn}
        >
          <ZoomIn color="#fff" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleZoomOut}
        >
          <ZoomOut color="#fff" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={showEntireMap}
        >
          <Maximize color="#fff" size={24} />
        </TouchableOpacity>
      </View>
      
      {/* Map Container */}
      <View 
        style={styles.mapContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View
          style={[
            styles.map,
            {
              width: mapSize.width * scale,
              height: mapSize.height * scale,
              transform: [
                { translateX: offset.x },
                { translateY: offset.y }
              ]
            }
          ]}
        >
          {/* Render discovered tiles */}
          {discoveredTiles.map((tile, index) => (
            <TouchableOpacity
              key={`${tile.worldId}-${tile.x}-${tile.y}`}
              style={[
                styles.tile,
                {
                  backgroundColor: getBiomeColor(tile.biome),
                  left: tile.x * TILE_SIZE * scale,
                  top: tile.y * TILE_SIZE * scale,
                  width: TILE_SIZE * scale,
                  height: TILE_SIZE * scale,
                  borderWidth: selectedTile && selectedTile.x === tile.x && selectedTile.y === tile.y ? 2 : 0,
                }
              ]}
              onPress={() => handleTilePress(tile)}
            />
          ))}
          
          {/* Render discovered towns */}
          {towns.filter(town => isTownDiscovered(town.id)).map((town, index) => (
            <View
              key={town.id}
              style={[
                styles.town,
                {
                  left: (town.position.x * TILE_SIZE * scale) + (TILE_SIZE * scale / 2) - (8 * scale),
                  top: (town.position.y * TILE_SIZE * scale) + (TILE_SIZE * scale / 2) - (8 * scale),
                  width: 16 * scale,
                  height: 16 * scale,
                }
              ]}
            />
          ))}
          
          {/* Render player position */}
          <View
            style={[
              styles.player,
              {
                left: (player.position.x * TILE_SIZE * scale) + (TILE_SIZE * scale / 2) - (6 * scale),
                top: (player.position.y * TILE_SIZE * scale) + (TILE_SIZE * scale / 2) - (6 * scale),
                width: 12 * scale,
                height: 12 * scale,
              }
            ]}
          />
        </View>
      </View>
      
      {/* Selected Tile Info */}
      {selectedTile && (
        <View style={styles.tileInfo}>
          <LinearGradient
            colors={['rgba(30,30,30,0.9)', 'rgba(20,20,20,0.9)']}
            style={styles.tileInfoContent}
          >
            <Text style={styles.tileInfoTitle}>Tile Information</Text>
            
            <Text style={styles.tileInfoText}>
              <Text style={styles.tileInfoLabel}>Coordinates: </Text>
              {selectedTile.x}, {selectedTile.y}
            </Text>
            
            <Text style={styles.tileInfoText}>
              <Text style={styles.tileInfoLabel}>Biome: </Text>
              {selectedTile.biome.charAt(0).toUpperCase() + selectedTile.biome.slice(1)}
            </Text>
            
            <Text style={styles.tileInfoText}>
              <Text style={styles.tileInfoLabel}>Elevation: </Text>
              {selectedTile.elevation} ft
            </Text>
            
            <Text style={styles.tileInfoText}>
              <Text style={styles.tileInfoLabel}>Difficulty: </Text>
              {selectedTile.difficulty}/10
            </Text>
            
            {selectedTile.hasTown && isTownDiscovered(selectedTile.town?.id || '') && (
              <Text style={styles.tileInfoText}>
                <Text style={styles.tileInfoLabel}>Features: </Text>
                Town - {selectedTile.town?.name || 'Unknown'}
              </Text>
            )}
          </LinearGradient>
        </View>
      )}
      
      {/* World Info */}
      <View style={styles.worldInfo}>
        <LinearGradient
          colors={['rgba(30,30,30,0.9)', 'rgba(20,20,20,0.9)']}
          style={styles.worldInfoContent}
        >
          <Text style={styles.worldInfoTitle}>{currentWorld.name}</Text>
          
          <Text style={styles.worldInfoText}>
            <Text style={styles.worldInfoLabel}>Size: </Text>
            {currentWorld.mapSize}x{currentWorld.mapSize}
          </Text>
          
          <Text style={styles.worldInfoText}>
            <Text style={styles.worldInfoLabel}>Discovered: </Text>
            {discoveredTiles.length} / {currentWorld.mapSize * currentWorld.mapSize} tiles
          </Text>
          
          <Text style={styles.worldInfoText}>
            <Text style={styles.worldInfoLabel}>Towns: </Text>
            {towns.filter(town => isTownDiscovered(town.id)).length} discovered
          </Text>
          
          <Text style={styles.worldInfoText}>
            <Text style={styles.worldInfoLabel}>Seed: </Text>
            {currentWorld.seed}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ddd",
    fontSize: 16,
  },
  controls: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    position: "absolute",
    backgroundColor: "#222",
  },
  tile: {
    position: "absolute",
    borderColor: "#fff",
  },
  town: {
    position: "absolute",
    backgroundColor: "#d4af37",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
  },
  player: {
    position: "absolute",
    backgroundColor: "#e74c3c",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 5,
  },
  tileInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  tileInfoContent: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    borderRadius: 8,
  },
  tileInfoTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  tileInfoText: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 4,
  },
  tileInfoLabel: {
    color: "#d4af37",
    fontWeight: "bold",
  },
  worldInfo: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  worldInfoContent: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    borderRadius: 8,
  },
  worldInfoTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  worldInfoText: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 4,
  },
  worldInfoLabel: {
    color: "#d4af37",
    fontWeight: "bold",
  },
});

export default WorldMap;