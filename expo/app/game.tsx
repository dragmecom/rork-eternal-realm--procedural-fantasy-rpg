import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Map, User, Package, ScrollText, Home } from 'lucide-react-native';
import { useGameState } from '@/context/GameContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GameMapTile } from '@/types/game';
import { generateMonsterEncounter } from '@/utils/monsterGenerator';
import { initializeBattle } from '@/utils/combatSystem';
import { BattleState, BattleAction } from '@/types/monster';
import BattleScreen from '@/components/battle/BattleScreen';
import GameControls from '@/components/game/GameControls';
import { Town } from '@/types/town';
import { getBiomeImage } from '@/utils/mapUtils';
import { BiomeType, WeatherType } from '@/types/map';

export default function GameScreen() {
  const router = useRouter();
  const { gameState, visitTown, updatePlayerPosition } = useGameState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTile, setCurrentTile] = useState<GameMapTile | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [currentTown, setCurrentTown] = useState<Town | null>(null);
  const [neighboringTiles, setNeighboringTiles] = useState<{
    north: GameMapTile | null;
    east: GameMapTile | null;
    south: GameMapTile | null;
    west: GameMapTile | null;
  }>({
    north: null,
    east: null,
    south: null,
    west: null
  });

  useEffect(() => {
    // Check if game state is initialized
    if (gameState.player && gameState.currentWorld) {
      setIsLoading(false);
      loadCurrentTile();
    } else {
      setError("Game not initialized. Please start a new game.");
      setIsLoading(false);
    }
  }, [gameState]);

  // Load the current tile based on player position
  const loadCurrentTile = () => {
    if (!gameState.player || !gameState.currentWorld) {
      return;
    }

    const { x, y } = gameState.player.position;
    
    // Find the current tile in discovered tiles
    const tile = gameState.discoveredTiles.find(
      t => t.x === x && t.y === y && t.worldId === gameState.currentWorld?.id
    );

    if (tile) {
      setCurrentTile(tile);
      
      // Check if the tile has a town
      if (tile.hasTown) {
        // Find the town at this position
        const town = gameState.towns.find(
          t => t.position.x === x && t.position.y === y && t.worldId === gameState.currentWorld?.id
        );
        
        if (town) {
          setCurrentTown(town);
        } else {
          setCurrentTown(null);
        }
      } else {
        setCurrentTown(null);
        // Only check for monster encounters if not in a town
        checkForMonsterEncounter(tile);
      }

      // Load neighboring tiles
      loadNeighboringTiles(x, y);
    } else {
      console.error("Current tile not found in discovered tiles");
    }
  };

  // Load neighboring tiles for direction descriptions
  const loadNeighboringTiles = (x: number, y: number) => {
    if (!gameState.currentWorld) return;

    const neighbors = {
      north: gameState.discoveredTiles.find(
        t => t.x === x && t.y === y - 1 && t.worldId === gameState.currentWorld?.id
      ) || null,
      east: gameState.discoveredTiles.find(
        t => t.x === x + 1 && t.y === y && t.worldId === gameState.currentWorld?.id
      ) || null,
      south: gameState.discoveredTiles.find(
        t => t.x === x && t.y === y + 1 && t.worldId === gameState.currentWorld?.id
      ) || null,
      west: gameState.discoveredTiles.find(
        t => t.x === x - 1 && t.y === y && t.worldId === gameState.currentWorld?.id
      ) || null
    };

    setNeighboringTiles(neighbors);
  };

  // Check for monster encounter on the current tile
  const checkForMonsterEncounter = (tile: GameMapTile) => {
    if (!gameState.player || !gameState.currentWorld) {
      return;
    }

    // Skip monster encounters if the tile has a town (safe zone)
    if (tile.hasTown) {
      return;
    }

    // Generate a seed for this encounter check
    const encounterSeed = `${gameState.currentWorld.seed}-${tile.x}-${tile.y}-${Date.now()}`;
    
    // Check if an encounter is triggered
    const encounter = generateMonsterEncounter(
      tile, // Now compatible with GameMapTile
      gameState.currentWorld.seed,
      gameState.player.level
    );

    if (encounter.triggered) {
      console.log("Monster encounter triggered!");
      
      // Initialize battle state
      const battle = initializeBattle(
        encounter.monsters,
        gameState.player,
        encounter.canRun,
        encounter.ambush
      );
      
      setBattleState(battle);
    }
  };

  // Handle player action in battle
  const handleBattleAction = (action: BattleAction) => {
    // This would process the action and update battle state
    // For now, we'll just end the battle
    console.log("Battle action:", action);
    
    // In a real implementation, you would process the action and update the battle state
    // For example:
    // const { updatedBattleState, updatedPlayer } = processPlayerAction(action, battleState, player, seed);
    // setBattleState(updatedBattleState);
    // updatePlayer(updatedPlayer);
  };

  // End the battle
  const handleBattleEnd = () => {
    setBattleState(null);
  };

  // Check if movement to a water tile is allowed
  const canMoveToWaterTile = (tile: GameMapTile | null) => {
    if (!tile) return false;
    
    const isWaterTile = tile.biome === 'ocean' || tile.biome === 'river' || tile.biome === 'lake';
    
    // If it's not a water tile, movement is allowed
    if (!isWaterTile) return true;
    
    // If player has boat_flag, movement is allowed
    if (gameState.player?.boat_flag) return true;
    
    // Check if player is already on a water tile
    if (currentTile && (currentTile.biome === 'ocean' || currentTile.biome === 'river' || currentTile.biome === 'lake')) {
      // Don't allow moving deeper into water
      return false;
    }
    
    // Allow moving one tile into water
    return true;
  };

  // Handle player movement
  const handleMove = (direction: 'north' | 'east' | 'south' | 'west') => {
    if (!gameState.player || !gameState.currentWorld) {
      return;
    }
    
    let dx = 0;
    let dy = 0;
    
    switch (direction) {
      case 'north': dy = -1; break;
      case 'east': dx = 1; break;
      case 'south': dy = 1; break;
      case 'west': dx = -1; break;
    }
    
    const newX = gameState.player.position.x + dx;
    const newY = gameState.player.position.y + dy;
    
    // Get the target tile
    const targetTile = neighboringTiles[direction];
    
    // Check if movement is allowed
    if (!canMoveToWaterTile(targetTile)) {
      console.log("Cannot move to water tile without a boat");
      return;
    }
    
    // Update player position
    updatePlayerPosition(newX, newY);
    
    // Load the new tile
    setTimeout(loadCurrentTile, 100);
  };

  // Handle entering town
  const handleEnterTown = () => {
    if (currentTown) {
      visitTown(currentTown.id);
      router.push("/town");
    }
  };

  // Get image for current tile
  const getTileImage = () => {
    if (!currentTile) return undefined;
    
    return getBiomeImage(currentTile.biome as BiomeType, currentTile.weather as WeatherType || "clear");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (error || !gameState.player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Unknown error occurred"}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.errorButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If in battle, show battle screen
  if (battleState) {
    return (
      <BattleScreen
        battleState={battleState}
        player={gameState.player}
        onAction={handleBattleAction}
        onClose={handleBattleEnd}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000', '#111']}
        style={styles.gradient}
      >
        {/* Game content */}
        <View style={styles.gameContent}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationText}>
              {gameState.currentWorld?.name} - {gameState.player.position.x}, {gameState.player.position.y}
            </Text>
          </View>
          
          <ScrollView style={styles.mainContent}>
            {/* Scene Image */}
            {getTileImage() && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: getTileImage() }}
                  style={styles.sceneImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            {/* Scene Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {currentTile?.description || "You stand in an unknown land."}
              </Text>
              
              {currentTown && (
                <Text style={styles.townText}>
                  You are in the vicinity of {currentTown.name}. The town offers safety from monsters.
                </Text>
              )}
            </View>
            
            {/* Game Controls */}
            <GameControls 
              onMove={handleMove} 
              neighboringTiles={neighboringTiles as any} // Type cast to satisfy TS
              currentTile={currentTile as any} // Type cast to satisfy TS
              currentTown={currentTown}
              onEnterTown={handleEnterTown}
              canMoveToWaterTile={canMoveToWaterTile}
            />
          </ScrollView>
        </View>

        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push("/map")}
          >
            <Map color="#d4af37" size={24} />
            <Text style={styles.navText}>Map</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push("/character")}
          >
            <User color="#d4af37" size={24} />
            <Text style={styles.navText}>Character</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push("/inventory")}
          >
            <Package color="#d4af37" size={24} />
            <Text style={styles.navText}>Inventory</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push("/quests")}
          >
            <ScrollText color="#d4af37" size={24} />
            <Text style={styles.navText}>Quests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.replace("/")}
          >
            <Home color="#d4af37" size={24} />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#d4af37',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  errorButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gameContent: {
    flex: 1,
    padding: 16,
  },
  locationHeader: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#6b5a3e',
    marginBottom: 12,
  },
  locationText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  sceneImage: {
    width: '100%',
    height: '100%',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  descriptionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  townText: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#6b5a3e',
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    color: '#d4af37',
    fontSize: 12,
    marginTop: 4,
  },
});