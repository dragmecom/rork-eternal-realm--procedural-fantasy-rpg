import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Player } from "@/types/game";

interface PlayerStatsProps {
  player: Player;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerClass}>
            Level {player.level} {player.class}
          </Text>
        </View>
        
        <Text style={styles.currency}>{player.currency} Gold</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBar}>
          <Text style={styles.statLabel}>HP</Text>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.barFill, 
                styles.healthBar,
                { width: `${(player.stats.currentHealth / player.stats.maxHealth) * 100}%` }
              ]} 
            />
            <Text style={styles.barText}>
              {Math.floor(player.stats.currentHealth)} / {player.stats.maxHealth}
            </Text>
          </View>
        </View>
        
        <View style={styles.statBar}>
          <Text style={styles.statLabel}>MP</Text>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.barFill, 
                styles.manaBar,
                { width: `${(player.stats.currentMana / player.stats.maxMana) * 100}%` }
              ]} 
            />
            <Text style={styles.barText}>
              {Math.floor(player.stats.currentMana)} / {player.stats.maxMana}
            </Text>
          </View>
        </View>
        
        <View style={styles.statBar}>
          <Text style={styles.statLabel}>XP</Text>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.barFill, 
                styles.expBar,
                { width: `${(player.experience / player.experienceToNextLevel) * 100}%` }
              ]} 
            />
            <Text style={styles.barText}>
              {player.experience} / {player.experienceToNextLevel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  playerClass: {
    color: "#bbb",
    fontSize: 14,
  },
  currency: {
    color: "#f39c12",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsContainer: {
    gap: 8,
  },
  statBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  statLabel: {
    color: "#fff",
    fontSize: 14,
    width: 30,
    textAlign: "center",
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: "#333",
    borderRadius: 4,
    marginLeft: 8,
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  healthBar: {
    backgroundColor: "#e74c3c",
  },
  manaBar: {
    backgroundColor: "#3498db",
  },
  expBar: {
    backgroundColor: "#2ecc71",
  },
  barText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default PlayerStats;