import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '@/types/game';

export async function saveGame(gameState: GameState): Promise<void> {
  try {
    console.log('Saving game state...');
    const serializedState = JSON.stringify(gameState);
    await AsyncStorage.setItem('gameState', serializedState);
    console.log('Game state saved successfully');
  } catch (error) {
    console.error('Failed to save game:', error);
    throw new Error('Failed to save game');
  }
}

export async function loadGame(): Promise<GameState | null> {
  try {
    console.log('Loading game state...');
    const serializedState = await AsyncStorage.getItem('gameState');
    if (serializedState) {
      console.log('Game state loaded successfully');
      return JSON.parse(serializedState);
    }
    console.log('No saved game state found');
    return null;
  } catch (error) {
    console.error('Failed to load game:', error);
    throw new Error('Failed to load game');
  }
}

export async function deleteSavedGame(): Promise<void> {
  try {
    console.log('Deleting saved game...');
    await AsyncStorage.removeItem('gameState');
    console.log('Saved game deleted successfully');
  } catch (error) {
    console.error('Failed to delete saved game:', error);
    throw new Error('Failed to delete saved game');
  }
}