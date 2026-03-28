import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Monster, BattleState, BattleAction } from "@/types/monster";
import { Player } from "@/types/game";
import BattleCommands from "./BattleCommands";
import BattleMessage from "./BattleMessage";
import MonsterDisplay from "./MonsterDisplay";
import TurnOrder from "./TurnOrder";
import { processPlayerAction, processMonsterAction } from "@/utils/combatSystem";

interface BattleScreenProps {
  battleState: BattleState;
  player: Player;
  onAction: (action: BattleAction) => void;
  onClose: () => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({
  battleState: initialBattleState,
  player: initialPlayer,
  onAction,
  onClose
}) => {
  const [battleState, setBattleState] = useState<BattleState>(initialBattleState);
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showCommands, setShowCommands] = useState<boolean>(true);
  const [animating, setAnimating] = useState<boolean>(false);
  const [initialMessageShown, setInitialMessageShown] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Initialize battle log
  useEffect(() => {
    if (initialBattleState.battleLog.length > 0) {
      setBattleLog(initialBattleState.battleLog);
      
      // Set a timer to hide the initial message
      setTimeout(() => {
        setInitialMessageShown(true);
      }, 2000);
    }
  }, []);
  
  // Update battle log when new messages are added
  useEffect(() => {
    if (battleState.battleLog.length > battleLog.length) {
      setBattleLog(battleState.battleLog);
      
      // Scroll to bottom of battle log
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [battleState.battleLog]);
  
  // Handle battle result
  useEffect(() => {
    if (battleState.battleResult !== "ongoing") {
      setShowCommands(false);
      
      // If battle is over, show result message
      if (battleState.battleResult === "victory") {
        setBattleLog(prev => [...prev, "You are victorious!"]);
      } else if (battleState.battleResult === "defeat") {
        setBattleLog(prev => [...prev, "You have been defeated..."]);
      } else if (battleState.battleResult === "escape") {
        setBattleLog(prev => [...prev, "You escaped successfully!"]);
      }
    } else {
      setShowCommands(battleState.playerTurn && !battleState.playerStatus.sleeping && !battleState.playerStatus.paralyzed);
    }
  }, [battleState.battleResult, battleState.playerTurn, battleState.playerStatus]);
  
  // Process monster turn
  useEffect(() => {
    if (!battleState.playerTurn && battleState.battleResult === "ongoing") {
      // Add a delay for monster actions
      const monsterActionTimer = setTimeout(() => {
        // Process monster actions
        const { updatedBattleState, updatedPlayer } = processMonsterAction(
          battleState,
          player,
          initialBattleState.monsters[0]?.id || "monster"
        );
        
        setBattleState(updatedBattleState);
        setPlayer(updatedPlayer);
      }, 1500);
      
      return () => clearTimeout(monsterActionTimer);
    }
  }, [battleState.playerTurn, battleState.battleResult]);
  
  // Handle player action
  const handleAction = (action: BattleAction) => {
    setAnimating(true);
    setShowCommands(false);
    
    // Process player action
    const { updatedBattleState, updatedPlayer } = processPlayerAction(
      action,
      battleState,
      player,
      initialBattleState.monsters[0]?.id || "player-action"
    );
    
    // Update state after a short delay for animation
    setTimeout(() => {
      setBattleState(updatedBattleState);
      setPlayer(updatedPlayer);
      setAnimating(false);
    }, 1000);
  };
  
  // Handle continue after battle
  const handleContinue = () => {
    // Update the player state in the parent component
    onClose();
  };
  
  // Filter out dead monsters for targeting
  const getLiveMonsters = () => {
    return battleState.monsters.filter(monster => monster.stats.hp > 0);
  };
  
  // Update turn order to remove dead monsters
  const getUpdatedTurnOrder = () => {
    const liveMonsters = getLiveMonsters();
    const liveMonsterIds = liveMonsters.map(monster => monster.id);
    
    return battleState.turnOrder.filter(combatant => 
      combatant.type === 'player' || 
      (combatant.type === 'monster' && liveMonsterIds.includes(combatant.id))
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(20,20,20,0.9)']}
          style={styles.overlay}
        >
          {/* Battle Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Battle!</Text>
          </View>
          
          {/* Player Stats */}
          <View style={styles.playerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>HP</Text>
              <View style={styles.healthBar}>
                <View 
                  style={[
                    styles.healthFill, 
                    { 
                      width: `${(player.stats.currentHealth / player.stats.maxHealth) * 100}%`,
                      backgroundColor: player.stats.currentHealth < player.stats.maxHealth * 0.3 ? "#e74c3c" : "#2ecc71"
                    }
                  ]} 
                />
              </View>
              <Text style={styles.statValue}>{player.stats.currentHealth}/{player.stats.maxHealth}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MP</Text>
              <View style={styles.manaBar}>
                <View 
                  style={[
                    styles.manaFill, 
                    { width: `${(player.stats.currentMana / player.stats.maxMana) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.statValue}>{player.stats.currentMana}/{player.stats.maxMana}</Text>
            </View>
            
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Lvl {player.level}</Text>
              <Text style={styles.classText}>{player.class}</Text>
            </View>
          </View>
          
          {/* Turn Order Display */}
          <TurnOrder 
            player={player}
            monsters={getLiveMonsters()}
            currentTurn={battleState.playerTurn ? "player" : "monster"}
            playerStatus={battleState.playerStatus}
          />
          
          {/* Monster Display */}
          <MonsterDisplay 
            monsters={getLiveMonsters()} 
            selectedTarget={battleState.selectedTarget}
            animating={animating}
          />
          
          {/* Battle Log */}
          <View style={styles.battleLogContainer}>
            {!initialMessageShown ? (
              <View style={styles.initialMessage}>
                <Text style={styles.initialMessageText}>{battleLog[0]}</Text>
              </View>
            ) : (
              <ScrollView 
                ref={scrollViewRef}
                style={styles.battleLog}
                contentContainerStyle={styles.battleLogContent}
              >
                {battleLog.map((message, index) => (
                  <Text key={index} style={styles.battleLogMessage}>
                    {message}
                  </Text>
                ))}
              </ScrollView>
            )}
          </View>
          
          {/* Battle Commands or Results */}
          {battleState.battleResult !== "ongoing" ? (
            <View style={styles.resultsContainer}>
              {battleState.battleResult === "victory" && battleState.rewards && (
                <View style={styles.rewardsContainer}>
                  <Text style={styles.rewardsTitle}>Rewards:</Text>
                  <Text style={styles.rewardText}>Experience: {battleState.rewards.experience}</Text>
                  <Text style={styles.rewardText}>Gold: {battleState.rewards.gold}</Text>
                  
                  {battleState.rewards.items.length > 0 && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsTitle}>Items:</Text>
                      {battleState.rewards.items.map((item, index) => (
                        <Text key={index} style={styles.itemText}>
                          {item.name} x{item.quantity}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : showCommands ? (
            <BattleCommands 
              player={player}
              monsters={getLiveMonsters()}
              onAction={handleAction}
              canRun={battleState.canRun}
            />
          ) : (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                {battleState.playerTurn ? 
                  (battleState.playerStatus.sleeping ? "You are sleeping..." : 
                   battleState.playerStatus.paralyzed ? "You are paralyzed..." : 
                   "Choose your action...") : 
                  "Enemy is acting..."}
              </Text>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    padding: 16,
    minHeight: '100%',
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    color: "#d4af37",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  playerStats: {
    flexDirection: "row",
    backgroundColor: "rgba(20, 20, 20, 0.9)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  statItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    color: "#ddd",
    fontSize: 12,
    textAlign: "right",
  },
  healthBar: {
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    overflow: "hidden",
  },
  healthFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
  },
  manaBar: {
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    overflow: "hidden",
  },
  manaFill: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  levelContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  levelText: {
    color: "#d4af37",
    fontSize: 14,
    fontWeight: "bold",
  },
  classText: {
    color: "#bbb",
    fontSize: 12,
  },
  battleLogContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    height: 120,
  },
  initialMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initialMessageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  battleLog: {
    flex: 1,
  },
  battleLogContent: {
    paddingHorizontal: 8,
  },
  battleLogMessage: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 4,
  },
  resultsContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    maxHeight: 300,
  },
  rewardsContainer: {
    marginBottom: 16,
  },
  rewardsTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  rewardText: {
    color: "#ddd",
    fontSize: 16,
    marginBottom: 4,
  },
  itemsContainer: {
    marginTop: 8,
  },
  itemsTitle: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemText: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 2,
  },
  continueButton: {
    backgroundColor: "#6b5a3e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4af37",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  waitingContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  waitingText: {
    color: "#ddd",
    fontSize: 16,
  },
});

export default BattleScreen;