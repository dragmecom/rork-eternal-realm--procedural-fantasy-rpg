import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Monster } from "@/types/monster";
import { Player } from "@/types/game";

interface TurnOrderProps {
  player: Player;
  monsters: Monster[];
  currentTurn: "player" | "monster";
  playerStatus: {
    poisoned: boolean;
    poisonTurnsLeft: number;
    sleeping: boolean;
    sleepTurnsLeft: number;
    paralyzed: boolean;
    paralysisTurnsLeft: number;
    confused: boolean;
    confusionTurnsLeft: number;
  };
}

// Define Combatant type
type Combatant = {
  type: "player" | "monster";
  id: string;
  name: string;
  speed: number;
  index?: number;
  status: string | null;
};

const TurnOrder: React.FC<TurnOrderProps> = ({
  player,
  monsters,
  currentTurn,
  playerStatus
}) => {
  // Calculate turn order based on speed
  const calculateTurnOrder = (): Combatant[] => {
    // Check if player is defined and has stats
    if (!player || !player.stats) {
      console.error("Player or player stats is undefined in TurnOrder component");
      // Return just monsters if player is undefined
      return monsters.map((monster, index) => ({
        type: "monster" as const,
        id: monster.id,
        name: monster.name,
        speed: monster.stats.speed,
        index,
        status: null
      }));
    }
    
    // Create an array of all combatants with their speed
    const combatants: Combatant[] = [
      { 
        type: "player", 
        id: "player", 
        name: player.name || "Adventurer", 
        speed: player.stats.dexterity || 10, // Provide default if dexterity is undefined
        status: getPlayerStatusText(playerStatus)
      },
      ...monsters.map((monster, index) => ({
        type: "monster" as const,
        id: monster.id,
        name: monster.name,
        speed: monster.stats.speed,
        index,
        status: null
      }))
    ];
    
    // Sort by speed (descending)
    return combatants.sort((a, b) => b.speed - a.speed);
  };
  
  // Get player status text
  const getPlayerStatusText = (status: TurnOrderProps["playerStatus"]): string | null => {
    if (status.sleeping) return `Sleep (${status.sleepTurnsLeft})`;
    if (status.paralyzed) return `Paralyzed (${status.paralysisTurnsLeft})`;
    if (status.poisoned) return `Poisoned (${status.poisonTurnsLeft})`;
    if (status.confused) return `Confused (${status.confusionTurnsLeft})`;
    return null;
  };
  
  const turnOrder = calculateTurnOrder();
  
  // Find the index of the current monster in the turn order
  const getCurrentMonsterIndex = () => {
    if (currentTurn === "player") return -1;
    
    // Find the first live monster
    const liveMonster = monsters[0];
    if (!liveMonster) return -1;
    
    return turnOrder.findIndex(
      combatant => combatant.type === "monster" && combatant.id === liveMonster.id
    );
  };
  
  const currentMonsterIndex = getCurrentMonsterIndex();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turn Order:</Text>
      <View style={styles.turnOrderList}>
        {turnOrder.map((combatant, index) => (
          <View 
            key={index}
            style={[
              styles.combatantItem,
              (combatant.type === "player" && currentTurn === "player") || 
              (combatant.type === "monster" && currentTurn === "monster" && index === currentMonsterIndex) 
                ? styles.activeTurn 
                : null
            ]}
          >
            <Text style={styles.combatantName}>{combatant.name}</Text>
            <Text style={styles.combatantSpeed}>SPD: {combatant.speed}</Text>
            {combatant.status && (
              <Text style={styles.statusText}>{combatant.status}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(20, 20, 20, 0.7)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  title: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  turnOrderList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  combatantItem: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    borderRadius: 6,
    padding: 8,
    minWidth: 100,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  activeTurn: {
    backgroundColor: "rgba(107, 90, 62, 0.7)",
    borderColor: "#d4af37",
  },
  combatantName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  combatantSpeed: {
    color: "#bbb",
    fontSize: 12,
  },
  statusText: {
    color: "#e74c3c",
    fontSize: 10,
    marginTop: 2,
  },
});

export default TurnOrder;