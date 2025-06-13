import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameState } from "@/context/GameContext";
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";

export default function CharacterScreen() {
  const router = useRouter();
  const { gameState, updatePlayerStats } = useGameState();
  const { player } = gameState;

  if (!player) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Player data not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStatIncrease = (stat: string) => {
    if (player.statPoints > 0) {
      const newStats = { ...player.stats };
      
      switch (stat) {
        case "strength":
          newStats.strength += 1;
          break;
        case "dexterity":
          newStats.dexterity += 1;
          break;
        case "vitality":
          newStats.vitality += 1;
          // Increase max health when vitality increases
          newStats.maxHealth += 5;
          break;
        case "energy":
          newStats.energy += 1;
          // Increase max mana when energy increases
          newStats.maxMana += 5;
          break;
      }
      
      updatePlayerStats(newStats, player.statPoints - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Character</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{player.name}</Text>
          <Text style={styles.characterClass}>{player.class}</Text>
          <Text style={styles.characterLevel}>Level {player.level}</Text>
          
          <View style={styles.experienceBar}>
            <View 
              style={[
                styles.experienceFill, 
                { width: `${(player.experience / player.experienceToNextLevel) * 100}%` }
              ]} 
            />
            <Text style={styles.experienceText}>
              {player.experience} / {player.experienceToNextLevel} XP
            </Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Attributes</Text>
          {player.statPoints > 0 && (
            <Text style={styles.statPointsAvailable}>
              Points available: {player.statPoints}
            </Text>
          )}
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Strength</Text>
            <Text style={styles.statValue}>{player.stats.strength}</Text>
            {player.statPoints > 0 && (
              <TouchableOpacity 
                style={styles.statButton}
                onPress={() => handleStatIncrease("strength")}
              >
                <Text style={styles.statButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Dexterity</Text>
            <Text style={styles.statValue}>{player.stats.dexterity}</Text>
            {player.statPoints > 0 && (
              <TouchableOpacity 
                style={styles.statButton}
                onPress={() => handleStatIncrease("dexterity")}
              >
                <Text style={styles.statButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Vitality</Text>
            <Text style={styles.statValue}>{player.stats.vitality}</Text>
            {player.statPoints > 0 && (
              <TouchableOpacity 
                style={styles.statButton}
                onPress={() => handleStatIncrease("vitality")}
              >
                <Text style={styles.statButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Energy</Text>
            <Text style={styles.statValue}>{player.stats.energy}</Text>
            {player.statPoints > 0 && (
              <TouchableOpacity 
                style={styles.statButton}
                onPress={() => handleStatIncrease("energy")}
              >
                <Text style={styles.statButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Derived Stats</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Health</Text>
            <Text style={styles.statValue}>
              {player.stats.currentHealth} / {player.stats.maxHealth}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Mana</Text>
            <Text style={styles.statValue}>
              {player.stats.currentMana} / {player.stats.maxMana}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Attack</Text>
            <Text style={styles.statValue}>{player.stats.attack}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Defense</Text>
            <Text style={styles.statValue}>{player.stats.defense}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Magic Find</Text>
            <Text style={styles.statValue}>{player.stats.magicFind}%</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Resistances</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Fire</Text>
            <Text style={styles.statValue}>{player.stats.fireResist}%</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Cold</Text>
            <Text style={styles.statValue}>{player.stats.coldResist}%</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Lightning</Text>
            <Text style={styles.statValue}>{player.stats.lightningResist}%</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statName}>Poison</Text>
            <Text style={styles.statValue}>{player.stats.poisonResist}%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 16,
  },
  scrollView: {
    flex: 1,
  },
  characterInfo: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  characterName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  characterClass: {
    color: "#ccc",
    fontSize: 18,
    marginTop: 4,
  },
  characterLevel: {
    color: "#f39c12",
    fontSize: 16,
    marginTop: 8,
  },
  experienceBar: {
    width: "100%",
    height: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    marginTop: 16,
    overflow: "hidden",
    position: "relative",
  },
  experienceFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 10,
  },
  experienceText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: 12,
    lineHeight: 20,
  },
  statsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    color: "#e74c3c",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statPointsAvailable: {
    color: "#2ecc71",
    fontSize: 14,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statName: {
    color: "#bbb",
    fontSize: 16,
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  statButton: {
    backgroundColor: "#3498db",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 18,
    textAlign: "center",
    margin: 20,
  },
  backButton: {
    color: "#3498db",
    fontSize: 16,
    textAlign: "center",
  },
});