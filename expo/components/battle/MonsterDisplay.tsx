import React from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { Monster } from "@/types/monster";

interface MonsterDisplayProps {
  monsters: Monster[];
  selectedTarget: number | null;
  animating: boolean;
}

const MonsterDisplay: React.FC<MonsterDisplayProps> = ({
  monsters,
  selectedTarget,
  animating
}) => {
  // Render a single monster
  const renderMonster = (monster: Monster, index: number) => {
    const isSelected = selectedTarget === index;
    const isDefeated = monster.stats.hp <= 0;
    
    return (
      <View 
        key={monster.id}
        style={[
          styles.monsterContainer,
          isSelected && styles.selectedMonster,
          isDefeated && styles.defeatedMonster
        ]}
      >
        <Image
          source={{ uri: monster.imageUrl }}
          style={styles.monsterImage}
          resizeMode="cover"
        />
        
        <View style={styles.monsterInfo}>
          <Text style={styles.monsterName}>{monster.name}</Text>
          <Text style={styles.monsterLevel}>Level {monster.level}</Text>
          
          <View style={styles.healthContainer}>
            <Text style={styles.healthText}>HP:</Text>
            <View style={styles.healthBar}>
              <View 
                style={[
                  styles.healthFill, 
                  { 
                    width: `${(monster.stats.hp / monster.stats.maxHp) * 100}%`,
                    backgroundColor: monster.stats.hp < monster.stats.maxHp * 0.3 ? "#e74c3c" : "#2ecc71"
                  }
                ]} 
              />
            </View>
            <Text style={styles.healthValue}>{monster.stats.hp}/{monster.stats.maxHp}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {monsters.length === 0 ? (
        <Text style={styles.noMonstersText}>No monsters present</Text>
      ) : (
        monsters.map((monster, index) => renderMonster(monster, index))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  monsterContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  selectedMonster: {
    borderColor: "#d4af37",
    borderWidth: 2,
    backgroundColor: "rgba(40, 40, 40, 0.7)",
  },
  defeatedMonster: {
    opacity: 0.5,
  },
  monsterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  monsterInfo: {
    flex: 1,
    justifyContent: "center",
  },
  monsterName: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  monsterLevel: {
    color: "#bbb",
    fontSize: 12,
    marginBottom: 4,
  },
  healthContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthText: {
    color: "#ddd",
    fontSize: 12,
    marginRight: 4,
  },
  healthBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 4,
  },
  healthFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
  },
  healthValue: {
    color: "#ddd",
    fontSize: 12,
  },
  noMonstersText: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
});

export default MonsterDisplay;