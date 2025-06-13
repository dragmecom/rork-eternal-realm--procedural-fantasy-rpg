import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Home } from 'lucide-react-native';
import { MapTile } from '@/types/map';
import { Town } from '@/types/town';

interface GameControlsProps {
  onMove: (direction: 'north' | 'east' | 'south' | 'west') => void;
  neighboringTiles: {
    north: MapTile | null;
    east: MapTile | null;
    south: MapTile | null;
    west: MapTile | null;
  };
  currentTile: MapTile | null;
  currentTown: Town | null;
  onEnterTown: () => void;
  canMoveToWaterTile: (tile: MapTile | null) => boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onMove,
  neighboringTiles,
  currentTile,
  currentTown,
  onEnterTown,
  canMoveToWaterTile
}) => {
  // Check if a direction is disabled (water tile without boat)
  const isDirectionDisabled = (direction: 'north' | 'east' | 'south' | 'west') => {
    const tile = neighboringTiles[direction];
    return !canMoveToWaterTile(tile);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Actions</Text>
      
      {/* Direction Buttons */}
      <View style={styles.directionsContainer}>
        {/* North */}
        <TouchableOpacity
          style={[
            styles.directionButton,
            isDirectionDisabled('north') && styles.disabledButton
          ]}
          onPress={() => onMove('north')}
          disabled={isDirectionDisabled('north')}
        >
          <ArrowUp color={isDirectionDisabled('north') ? '#666' : '#fff'} size={20} />
          <Text 
            style={[
              styles.directionText,
              isDirectionDisabled('north') && styles.disabledText
            ]}
            numberOfLines={2}
          >
            {neighboringTiles.north?.options.find(o => o.direction === 'north')?.text || "Go North"}
          </Text>
        </TouchableOpacity>
        
        {/* East */}
        <TouchableOpacity
          style={[
            styles.directionButton,
            isDirectionDisabled('east') && styles.disabledButton
          ]}
          onPress={() => onMove('east')}
          disabled={isDirectionDisabled('east')}
        >
          <ArrowRight color={isDirectionDisabled('east') ? '#666' : '#fff'} size={20} />
          <Text 
            style={[
              styles.directionText,
              isDirectionDisabled('east') && styles.disabledText
            ]}
            numberOfLines={2}
          >
            {neighboringTiles.east?.options.find(o => o.direction === 'east')?.text || "Go East"}
          </Text>
        </TouchableOpacity>
        
        {/* South */}
        <TouchableOpacity
          style={[
            styles.directionButton,
            isDirectionDisabled('south') && styles.disabledButton
          ]}
          onPress={() => onMove('south')}
          disabled={isDirectionDisabled('south')}
        >
          <ArrowDown color={isDirectionDisabled('south') ? '#666' : '#fff'} size={20} />
          <Text 
            style={[
              styles.directionText,
              isDirectionDisabled('south') && styles.disabledText
            ]}
            numberOfLines={2}
          >
            {neighboringTiles.south?.options.find(o => o.direction === 'south')?.text || "Go South"}
          </Text>
        </TouchableOpacity>
        
        {/* West */}
        <TouchableOpacity
          style={[
            styles.directionButton,
            isDirectionDisabled('west') && styles.disabledButton
          ]}
          onPress={() => onMove('west')}
          disabled={isDirectionDisabled('west')}
        >
          <ArrowLeft color={isDirectionDisabled('west') ? '#666' : '#fff'} size={20} />
          <Text 
            style={[
              styles.directionText,
              isDirectionDisabled('west') && styles.disabledText
            ]}
            numberOfLines={2}
          >
            {neighboringTiles.west?.options.find(o => o.direction === 'west')?.text || "Go West"}
          </Text>
        </TouchableOpacity>
        
        {/* Enter Town Button (only if on a town tile) */}
        {currentTown && (
          <TouchableOpacity
            style={styles.enterTownButton}
            onPress={onEnterTown}
          >
            <Home color="#fff" size={20} />
            <Text style={styles.enterTownText}>
              Enter {currentTown.name}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  directionsContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  disabledButton: {
    backgroundColor: 'rgba(40, 40, 40, 0.3)',
    borderColor: '#444',
  },
  directionText: {
    color: '#fff',
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
  },
  disabledText: {
    color: '#666',
  },
  enterTownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 90, 62, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  enterTownText: {
    color: '#fff',
    marginLeft: 12,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GameControls;