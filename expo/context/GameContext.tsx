import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Player, PartyMember, Equipment, GameMapTile } from '@/types/game';
import { Item } from '@/types/item';
import { generateWorld } from '@/utils/worldGenerator';
import { generateTown } from '@/utils/townGenerator';
import { generateStarterItems } from '@/utils/itemGenerator';
import { saveGame } from '@/utils/saveGameUtils';
import { generateMapChunk, generateWorldTowns, generatePathsBetweenTowns } from '@/utils/mapGenerator';
import { BiomeType } from '@/types/map';

interface GameContextType {
  gameState: GameState;
  initializeGame: (seed: string) => Promise<void>;
  updatePlayerPosition: (x: number, y: number) => void;
  discoverTile: (tile: GameMapTile) => void;
  updatePlayerStats: (stats: Player['stats'], statPoints: number) => void;
  respawnPlayer: () => void;
  visitTown: (townId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  dropItem: (itemId: string) => void;
  addItemToInventory: (item: Item) => boolean;
  removeItemFromInventory: (itemId: string) => void;
  updatePlayerCurrency: (amount: number) => void;
  restorePlayerHealth: () => void;
  addPartyMember: (member: PartyMember) => boolean;
  removePartyMember: (memberId: string) => void;
}

const initialGameState: GameState = {
  player: null,
  currentWorld: null,
  discoveredTiles: [],
  towns: [],
  activeQuests: [],
  completedQuests: [],
  lastVisitedTown: null,
  lastSaveTimestamp: Date.now(),
  partyMembers: [],
};

const GameContext = createContext<GameContextType | null>(null);

export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize game state
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('gameState');
        if (savedState) {
          setGameState(JSON.parse(savedState));
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing game state:', error);
        setIsInitialized(true);
      }
    };

    initializeGameState();
  }, []);

  // Initialize a new game
  const initializeGame = useCallback(async (seed: string) => {
    try {
      console.log('Initializing game with seed:', seed);

      // Generate world
      const world = generateWorld(seed);
      console.log('World generated:', world);
      
      // Generate initial map chunk around starting position
      const startX = Math.floor(world.mapSize / 2);
      const startY = Math.floor(world.mapSize / 2);
      const viewDistance = 5;
      
      console.log('Generating initial map chunk...');
      const initialMapChunk = await generateMapChunk(
        seed,
        startX - viewDistance,
        startY - viewDistance,
        startX + viewDistance,
        startY + viewDistance,
        world
      );
      console.log('Initial map chunk generated:', initialMapChunk.length, 'tiles');

      // Generate towns
      console.log('Generating towns...');
      const towns = generateWorldTowns(world);
      console.log('Towns generated:', towns.length, 'towns');
      
      // Mark town tiles
      for (const town of towns) {
        const townTile = initialMapChunk.find(
          tile => tile.x === town.position.x && tile.y === town.position.y
        );
        
        if (townTile) {
          townTile.hasTown = true;
          townTile.town = town;
        }
      }
      
      // Generate paths between towns
      console.log('Generating paths between towns...');
      const tilesWithPaths = generatePathsBetweenTowns(world, towns, initialMapChunk);
      console.log('Paths generated');

      // Find starting town for player spawn
      const startingTown = towns.find(town => town.depth === 0) || towns[0];
      
      // Create initial player
      console.log('Creating initial player...');
      const initialPlayer: Player = {
        name: "Hero",
        class: "Adventurer",
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        statPoints: 0,
        stats: {
          strength: 10,
          dexterity: 10,
          vitality: 10,
          energy: 10,
          maxHealth: 100,
          currentHealth: 100,
          maxMana: 50,
          currentMana: 50,
          attack: 5,
          defense: 5,
          fireResist: 0,
          coldResist: 0,
          lightningResist: 0,
          poisonResist: 0,
          magicFind: 0,
          magicResist: 0
        },
        position: { x: startingTown.position.x, y: startingTown.position.y },
        inventory: generateStarterItems(seed),
        inventoryCapacity: 20,
        equipment: {
          head: null,
          body: null,
          hands: null,
          feet: null,
          mainHand: null,
          offHand: null,
          necklace: null,
          ring1: null,
          ring2: null
        },
        currency: 100,
        boat_flag: false
      };
      console.log('Initial player created');

      // Convert map tiles to game map tiles
      const gameMapTiles: GameMapTile[] = initialMapChunk.map(tile => ({
        x: tile.x,
        y: tile.y,
        biome: tile.biome as BiomeType,
        elevation: tile.elevation,
        humidity: tile.humidity,
        temperature: tile.temperature,
        explored: true,
        hasTown: tile.hasTown,
        town: tile.town,
        description: tile.description,
        worldId: world.id,
        weather: tile.weather as any, // Type cast to satisfy TS
        type: tile.type || "normal", // Provide default value for required property
        moisture: tile.moisture,
        difficulty: tile.difficulty || 1, // Provide default value for required property
        discovered: tile.discovered || false, // Provide default value for required property
        options: tile.options || [] // Provide default value for required property
      }));

      // Set initial game state
      const newGameState: GameState = {
        player: initialPlayer,
        currentWorld: world,
        discoveredTiles: gameMapTiles,
        towns: towns,
        activeQuests: [],
        completedQuests: [],
        lastVisitedTown: startingTown.id,
        lastSaveTimestamp: Date.now(),
        partyMembers: []
      };

      console.log('Setting new game state...');
      setGameState(newGameState);
      console.log('Saving game state...');
      await saveGame(newGameState);
      console.log('Game initialized successfully');

    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw new Error('Failed to initialize game');
    }
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!isInitialized) return;

    try {
      await saveGame(gameState);
      setGameState(prev => ({
        ...prev,
        lastSaveTimestamp: Date.now()
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [gameState, isInitialized]);

  // Equipment management
  const equipItem = useCallback((itemId: string) => {
    if (!isInitialized) return;

    setGameState(prev => {
      if (!prev.player) return prev;

      const itemIndex = prev.player.inventory.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;

      const item = prev.player.inventory[itemIndex];
      if (!item.slot) return prev;

      const slotKey = item.slot as keyof Equipment;
      const currentEquipped = prev.player.equipment[slotKey];
      
      const newInventory = [...prev.player.inventory];
      const newEquipment = { ...prev.player.equipment };

      // Remove the item from inventory
      newInventory.splice(itemIndex, 1);

      // If there's already an item equipped in that slot, add it to inventory
      if (currentEquipped) {
        newInventory.push({ ...currentEquipped, equipped: false });
      }

      // Equip the new item
      newEquipment[slotKey] = { ...item, equipped: true };

      // Update player stats based on item bonuses
      const newStats = { ...prev.player.stats };
      
      // Remove bonuses from previously equipped item
      if (currentEquipped?.bonuses) {
        Object.entries(currentEquipped.bonuses).forEach(([stat, value]) => {
          if (stat in newStats) {
            const statKey = stat as keyof typeof newStats;
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              newStats[statKey] = (newStats[statKey] as number) - numValue;
            }
          }
        });
      }
      
      // Add bonuses from newly equipped item
      if (item.bonuses) {
        Object.entries(item.bonuses).forEach(([stat, value]) => {
          if (stat in newStats) {
            const statKey = stat as keyof typeof newStats;
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              newStats[statKey] = (newStats[statKey] as number) + numValue;
            }
          }
        });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory,
          equipment: newEquipment,
          stats: newStats
        }
      };
    });

    // Save the game after equipping
    autoSave();
  }, [autoSave, isInitialized]);

  const unequipItem = useCallback((itemId: string) => {
    if (!isInitialized) return;

    setGameState(prev => {
      if (!prev.player) return prev;

      // Find which slot the item is equipped in
      let slotKey: keyof Equipment | null = null;
      
      for (const [key, item] of Object.entries(prev.player.equipment)) {
        if (item?.id === itemId) {
          slotKey = key as keyof Equipment;
          break;
        }
      }

      if (!slotKey || !prev.player.equipment[slotKey]) return prev;

      const item = prev.player.equipment[slotKey];

      // Check if inventory has space
      if (prev.player.inventory.length >= prev.player.inventoryCapacity) {
        return prev;
      }

      // Add the item to inventory and remove from equipment
      const newInventory = [...prev.player.inventory, { ...item, equipped: false }];
      const newEquipment = { ...prev.player.equipment };
      newEquipment[slotKey] = null;

      // Update player stats by removing item bonuses
      const newStats = { ...prev.player.stats };
      
      if (item?.bonuses) {
        Object.entries(item.bonuses).forEach(([stat, value]) => {
          if (stat in newStats) {
            const statKey = stat as keyof typeof newStats;
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              newStats[statKey] = (newStats[statKey] as number) - numValue;
            }
          }
        });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory,
          equipment: newEquipment,
          stats: newStats
        }
      };
    });

    // Save the game after unequipping
    autoSave();
  }, [autoSave, isInitialized]);

  const dropItem = useCallback((itemId: string) => {
    if (!isInitialized) return;

    setGameState(prev => {
      if (!prev.player) return prev;

      // Remove the item from inventory
      const newInventory = prev.player.inventory.filter(item => item.id === itemId ? false : true);

      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory
        }
      };
    });

    // Save the game after dropping
    autoSave();
  }, [autoSave, isInitialized]);

  const addItemToInventory = useCallback((item: Item): boolean => {
    if (!isInitialized) return false;

    let success = false;
    
    setGameState(prev => {
      if (!prev.player) return prev;

      // Check if inventory has space
      if (prev.player.inventory.length >= prev.player.inventoryCapacity) {
        success = false;
        return prev;
      }

      // Add the item to inventory
      const newInventory = [...prev.player.inventory, item];

      success = true;
      
      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory
        }
      };
    });

    // Save the game if item was added
    if (success) {
      autoSave();
    }

    return success;
  }, [autoSave, isInitialized]);

  const removeItemFromInventory = useCallback((itemId: string) => {
    if (!isInitialized) return;

    setGameState(prev => {
      if (!prev.player) return prev;

      // Remove the item from inventory
      const newInventory = prev.player.inventory.filter(item => item.id === itemId ? false : true);

      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory
        }
      };
    });

    // Save the game after removing
    autoSave();
  }, [autoSave, isInitialized]);

  const updatePlayerCurrency = useCallback((amount: number) => {
    if (!isInitialized) return;

    setGameState(prev => ({
      ...prev,
      player: prev.player ? {
        ...prev.player,
        currency: Math.max(0, prev.player.currency + amount)
      } : null
    }));

    // Save the game after updating currency
    autoSave();
  }, [autoSave, isInitialized]);

  const updatePlayerPosition = useCallback((x: number, y: number) => {
    if (!isInitialized) return;

    setGameState(prev => ({
      ...prev,
      player: prev.player ? {
        ...prev.player,
        position: { x, y }
      } : null
    }));

    // Save the game after updating position
    autoSave();
  }, [autoSave, isInitialized]);

  const discoverTile = useCallback((tile: GameMapTile) => {
    if (!isInitialized) return;

    setGameState(prev => ({
      ...prev,
      discoveredTiles: [...prev.discoveredTiles, tile]
    }));

    // Save the game after discovering a tile
    autoSave();
  }, [autoSave, isInitialized]);

  const updatePlayerStats = useCallback((stats: Player['stats'], statPoints: number) => {
    if (!isInitialized) return;

    setGameState(prev => ({
      ...prev,
      player: prev.player ? {
        ...prev.player,
        stats,
        statPoints
      } : null
    }));

    // Save the game after updating stats
    autoSave();
  }, [autoSave, isInitialized]);

  const respawnPlayer = useCallback(() => {
    if (!isInitialized) return;

    setGameState(prev => {
      if (!prev.player) return prev;

      // Find the last visited town
      const lastTown = prev.towns.find(town => 
        town.id === prev.lastVisitedTown
      );

      // If no last visited town, use the first town (starting town)
      const respawnTown = lastTown || prev.towns[0];

      if (!respawnTown) return prev;

      // Reset player experience to 0
      const newExperience = 0;
      
      // Set health and mana to 40% of max
      const newStats = {
        ...prev.player.stats,
        currentHealth: Math.floor(prev.player.stats.maxHealth * 0.4),
        currentMana: Math.floor(prev.player.stats.maxMana * 0.4)
      };

      // Move player to the town position
      return {
        ...prev,
        player: {
          ...prev.player,
          position: respawnTown.position,
          stats: newStats,
          experience: newExperience
        }
      };
    });

    // Save the game after respawning
    autoSave();
  }, [autoSave, isInitialized]);

  const visitTown = useCallback((townId: string) => {
    if (!isInitialized) return;

    setGameState(prev => ({
      ...prev,
      lastVisitedTown: townId,
      towns: prev.towns.map(town => 
        town.id === townId 
          ? { ...town, lastVisited: Date.now() }
          : town
      )
    }));

    // Save the game after visiting a town
    autoSave();
  }, [autoSave, isInitialized]);

  // Restore player and party members' health and mana
  const restorePlayerHealth = useCallback(() => {
    if (!isInitialized) return;

    setGameState(prev => {
      if (!prev.player) return prev;

      // Restore player health and mana
      const newPlayerStats = {
        ...prev.player.stats,
        currentHealth: prev.player.stats.maxHealth,
        currentMana: prev.player.stats.maxMana
      };

      // Restore party members' health and mana
      const newPartyMembers = prev.partyMembers?.map(member => ({
        ...member,
        stats: {
          ...member.stats,
          currentHealth: member.stats.maxHealth,
          currentMana: member.stats.maxMana
        }
      })) || [];

      return {
        ...prev,
        player: {
          ...prev.player,
          stats: newPlayerStats
        },
        partyMembers: newPartyMembers
      };
    });

    // Save the game after restoring health
    autoSave();
  }, [autoSave, isInitialized]);

  // Add a party member
  const addPartyMember = useCallback((member: PartyMember): boolean => {
    if (!isInitialized) return false;

    let success = false;
    
    setGameState(prev => {
      // Check if party is full (max 3 members)
      if (prev.partyMembers && prev.partyMembers.length >= 3) {
        success = false;
        return prev;
      }

      // Add the member to party
      const newPartyMembers = [...(prev.partyMembers || []), member];

      success = true;
      
      return {
        ...prev,
        partyMembers: newPartyMembers
      };
    });

    // Save the game if member was added
    if (success) {
      autoSave();
    }

    return success;
  }, [autoSave, isInitialized]);

  // Remove a party member
  const removePartyMember = useCallback((memberId: string) => {
    if (!isInitialized) return;

    setGameState(prev => {
      // Remove the member from party
      const newPartyMembers = prev.partyMembers?.filter(member => member.id !== memberId) || [];

      return {
        ...prev,
        partyMembers: newPartyMembers
      };
    });

    // Save the game after removing
    autoSave();
  }, [autoSave, isInitialized]);

  // Don't render children until initialization is complete
  if (!isInitialized) {
    return null;
  }

  const value = {
    gameState,
    initializeGame,
    updatePlayerPosition,
    discoverTile,
    updatePlayerStats,
    respawnPlayer,
    visitTown,
    equipItem,
    unequipItem,
    dropItem,
    addItemToInventory,
    removeItemFromInventory,
    updatePlayerCurrency,
    restorePlayerHealth,
    addPartyMember,
    removePartyMember,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};