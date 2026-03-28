import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { MapTile } from "@/types/game";
import { Position } from "@/types/game";
import { getBiomeColor } from "@/utils/mapUtils";

interface GameMapProps {
  tiles: MapTile[];
  playerPosition: Position;
}

const GameMap: React.FC<GameMapProps> = ({ tiles, playerPosition }) => {
  const tileSize = 20;
  const viewportSize = 10; // Number of tiles visible in each direction
  
  // Calculate the visible area around the player
  const minX = playerPosition.x - viewportSize;
  const maxX = playerPosition.x + viewportSize;
  const minY = playerPosition.y - viewportSize;
  const maxY = playerPosition.y + viewportSize;
  
  // Filter tiles to only show those in the visible area
  const visibleTiles = tiles.filter(
    tile => tile.x >= minX && tile.x <= maxX && tile.y >= minY && tile.y <= maxY
  );
  
  // Create a grid to render
  const grid: (MapTile | null)[][] = [];
  
  // Initialize the grid with null values
  for (let y = minY; y <= maxY; y++) {
    grid[y - minY] = [];
    for (let x = minX; x <= maxX; x++) {
      grid[y - minY][x - minX] = null;
    }
  }
  
  // Fill the grid with visible tiles
  visibleTiles.forEach(tile => {
    const gridX = tile.x - minX;
    const gridY = tile.y - minY;
    grid[gridY][gridX] = tile;
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((tile, colIndex) => {
              const isPlayer = 
                playerPosition.x === colIndex + minX && 
                playerPosition.y === rowIndex + minY;
              
              return (
                <View
                  key={`tile-${rowIndex}-${colIndex}`}
                  style={[
                    styles.tile,
                    { 
                      width: tileSize, 
                      height: tileSize,
                      backgroundColor: tile ? getBiomeColor(tile.biome) : "#000",
                      opacity: tile?.discovered ? 1 : 0.5,
                    },
                  ]}
                >
                  {isPlayer && (
                    <View style={styles.player} />
                  )}
                  
                  {tile?.hasTown && (
                    <View style={styles.town} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#f00" }]} />
          <Text style={styles.legendText}>Player</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#ff0" }]} />
          <Text style={styles.legendText}>Town</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#0a0", opacity: 0.5 }]} />
          <Text style={styles.legendText}>Unexplored</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  mapContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "#111",
    padding: 10,
  },
  row: {
    flexDirection: "row",
  },
  tile: {
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  player: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f00",
  },
  town: {
    width: 10,
    height: 10,
    backgroundColor: "#ff0",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 5,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default GameMap;