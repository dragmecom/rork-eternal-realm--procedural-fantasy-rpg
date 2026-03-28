import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TownBuildingProps {
  name: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const TownBuilding: React.FC<TownBuildingProps> = ({ name, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  iconContainer: {
    marginBottom: 12,
  },
  name: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TownBuilding;