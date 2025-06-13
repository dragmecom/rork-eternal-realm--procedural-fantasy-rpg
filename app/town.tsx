import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameState } from '@/context/GameContext';
import { Town } from '@/types/game';
import { ArrowLeft, Home, Utensils, Bed, ShoppingBag, Scroll, Shield, Sword, Wand, Heart, Zap } from 'lucide-react-native';
import TownBuilding from '@/components/town/TownBuilding';
import { createSeededRandom } from '@/utils/seedGenerator';
import { Item } from '@/types/item';
import { generateShopItems } from '@/utils/itemGenerator';
import ShopGrid from '@/components/shop/ShopGrid';
import ItemTooltip from '@/components/inventory/ItemTooltip';

export default function TownScreen() {
  const router = useRouter();
  const { gameState, updatePlayerCurrency, restorePlayerHealth, addItemToInventory } = useGameState();
  const [currentTown, setCurrentTown] = useState<Town | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [innCost, setInnCost] = useState(0);
  const [availableQuests, setAvailableQuests] = useState<any[]>([]);
  const [availableRecruits, setAvailableRecruits] = useState<any[]>([]);
  const [restMessage, setRestMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quests' | 'recruits'>('quests');
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null);
  
  useEffect(() => {
    if (gameState.lastVisitedTown) {
      const town = gameState.towns.find(t => t.id === gameState.lastVisitedTown);
      if (town) {
        setCurrentTown(town);
        
        // Calculate inn cost based on player level
        const baseCost = 5;
        const levelMultiplier = gameState.player?.level || 1;
        setInnCost(baseCost * levelMultiplier);
        
        // Generate quests and recruits
        if (town.seed) {
          generateQuests(town);
          generateRecruits(town);
          generateShop(town);
        }
      }
    }
  }, [gameState.lastVisitedTown, gameState.towns, gameState.player?.level]);
  
  // Generate quests based on town and player level
  const generateQuests = (town: Town) => {
    if (!gameState.player || !gameState.currentWorld) return;
    
    const random = createSeededRandom(`${town.seed || town.id}-quests-${Date.now()}`);
    const playerLevel = gameState.player.level;
    const townDepth = town.depth || 0;
    
    // Determine number of quests (1-3)
    const numQuests = random.randomInt(1, 3);
    const quests = [];
    
    for (let i = 0; i < numQuests; i++) {
      // Determine quest type (for now, just monster hunting)
      const questType = "hunt";
      
      // Determine monster type based on biome
      const biomeTypes = ["forest", "plains", "mountains", "desert", "swamp"];
      const biome = town.biome || random.randomItem(biomeTypes);
      
      // Determine monster level (player level +/- 2)
      const monsterLevel = Math.max(1, playerLevel + random.randomInt(-2, 2));
      
      // Determine quantity (1-5 based on level)
      const quantity = random.randomInt(1, Math.min(5, monsterLevel + 2));
      
      // Determine reward (based on monster level and quantity)
      const baseReward = 10 * monsterLevel;
      const quantityMultiplier = 1 + (quantity * 0.5);
      const reward = Math.floor(baseReward * quantityMultiplier);
      
      // Generate monster name
      const monsterTypes = ["wolf", "bear", "spider", "goblin", "bandit", "troll", "slime"];
      const monsterType = random.randomItem(monsterTypes);
      
      // Create quest object
      quests.push({
        id: `quest-${town.id}-${i}-${Date.now()}`,
        type: questType,
        title: `Hunt ${quantity} ${monsterType}${quantity > 1 ? 's' : ''}`,
        description: `Eliminate ${quantity} ${monsterType}${quantity > 1 ? 's' : ''} that have been terrorizing the area.`,
        targetMonster: monsterType,
        targetQuantity: quantity,
        currentProgress: 0,
        reward: reward,
        experience: reward * 2,
        level: monsterLevel,
        location: {
          x: town.position.x + random.randomInt(-5, 5),
          y: town.position.y + random.randomInt(-5, 5),
          worldId: town.worldId
        }
      });
    }
    
    setAvailableQuests(quests);
  };
  
  // Generate potential recruits
  const generateRecruits = (town: Town) => {
    if (!gameState.player) return;
    
    const random = createSeededRandom(`${town.seed || town.id}-recruits-${Date.now()}`);
    const playerLevel = gameState.player.level;
    
    // Determine number of recruits (1-3)
    const numRecruits = random.randomInt(1, 3);
    const recruits = [];
    
    const classes = ["Warrior", "Mage", "Rogue", "Cleric", "Ranger"];
    
    for (let i = 0; i < numRecruits; i++) {
      // Determine recruit level (player level -1 to +0)
      const recruitLevel = Math.max(1, playerLevel + random.randomInt(-1, 0));
      
      // Determine class
      const recruitClass = random.randomItem(classes);
      
      // Determine hire cost
      const baseCost = 50 * recruitLevel;
      const hireCost = baseCost + random.randomInt(-10, 10);
      
      // Generate name
      const names = ["Alaric", "Brenna", "Cedric", "Daria", "Elric", "Freya", "Gareth", "Hilda", "Ivar", "Jora"];
      const name = random.randomItem(names);
      
      // Create recruit object
      recruits.push({
        id: `recruit-${town.id}-${i}-${Date.now()}`,
        name,
        class: recruitClass,
        level: recruitLevel,
        hireCost,
        stats: {
          strength: 5 + recruitLevel + (recruitClass === "Warrior" ? 3 : 0),
          dexterity: 5 + recruitLevel + (recruitClass === "Rogue" || recruitClass === "Ranger" ? 3 : 0),
          vitality: 5 + recruitLevel + (recruitClass === "Warrior" || recruitClass === "Cleric" ? 2 : 0),
          energy: 5 + recruitLevel + (recruitClass === "Mage" || recruitClass === "Cleric" ? 3 : 0),
          maxHealth: 50 + (recruitLevel * 10) + (recruitClass === "Warrior" ? 20 : 0),
          currentHealth: 50 + (recruitLevel * 10) + (recruitClass === "Warrior" ? 20 : 0),
          maxMana: 20 + (recruitLevel * 5) + (recruitClass === "Mage" ? 20 : 0),
          currentMana: 20 + (recruitLevel * 5) + (recruitClass === "Mage" ? 20 : 0)
        }
      });
    }
    
    setAvailableRecruits(recruits);
  };
  
  // Generate shop items
  const generateShop = (town: Town) => {
    if (!gameState.player) return;
    
    const random = createSeededRandom(`${town.seed || town.id}-shop-${Date.now()}`);
    const playerLevel = gameState.player.level;
    
    // Generate shop items based on player level and town depth
    const items = generateShopItems(random, playerLevel, town.depth || 0);
    setShopItems(items);
  };
  
  // Handle resting at the inn
  const handleRest = () => {
    if (!gameState.player || gameState.player.currency < innCost) {
      return;
    }
    
    // Deduct cost
    updatePlayerCurrency(-innCost);
    
    // Restore health and mana for player and party members
    restorePlayerHealth();
    
    // Show rest message
    setRestMessage(`You had a restful sleep at the inn. All party members' health and mana have been fully restored.`);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setRestMessage(null);
    }, 3000);
  };
  
  // Handle accepting a quest
  const handleAcceptQuest = (quest: any) => {
    // This would add the quest to active quests
    // For now, we'll just show a message
    alert(`You accepted the quest: ${quest.title}`);
  };
  
  // Handle hiring a recruit
  const handleHireRecruit = (recruit: any) => {
    if (!gameState.player || gameState.player.currency < recruit.hireCost) {
      alert("You don't have enough gold to hire this recruit.");
      return;
    }
    
    // Deduct cost
    updatePlayerCurrency(-recruit.hireCost);
    
    // Add recruit to party (this would be handled in the GameContext)
    // For now, we'll just show a message
    alert(`You hired ${recruit.name} the ${recruit.class} for ${recruit.hireCost} gold.`);
  };
  
  // Handle buying an item
  const handleBuyItem = (item: Item) => {
    if (!gameState.player || gameState.player.currency < item.value) {
      alert("You don't have enough gold to buy this item.");
      return;
    }
    
    // Try to add to inventory
    const added = addItemToInventory(item);
    
    if (added) {
      // Deduct cost
      updatePlayerCurrency(-item.value);
      alert(`You purchased ${item.name} for ${item.value} gold.`);
    } else {
      alert("Your inventory is full. Make some space before buying new items.");
    }
    
    // Close tooltip
    setSelectedItem(null);
    setTooltipPosition(null);
  };
  
  // Handle item selection in shop
  const handleSelectShopItem = (item: Item, position: {x: number, y: number}) => {
    setSelectedItem(item);
    setTooltipPosition(position);
  };
  
  // Get class icon
  const getClassIcon = (className: string) => {
    switch (className) {
      case 'Warrior':
        return <Sword color="#d4af37" size={24} />;
      case 'Mage':
        return <Wand color="#d4af37" size={24} />;
      case 'Rogue':
        return <Sword color="#d4af37" size={24} />;
      case 'Cleric':
        return <Heart color="#d4af37" size={24} />;
      case 'Ranger':
        return <Shield color="#d4af37" size={24} />;
      default:
        return <Shield color="#d4af37" size={24} />;
    }
  };
  
  // Render building content
  const renderBuildingContent = () => {
    switch (selectedBuilding) {
      case "inn":
        return (
          <View style={styles.buildingContent}>
            <Text style={styles.buildingTitle}>Inn</Text>
            <Text style={styles.buildingDescription}>
              Rest and recover your health and mana. The innkeeper offers comfortable beds and hot meals.
            </Text>
            
            <View style={styles.restInfo}>
              <Text style={styles.restCost}>Cost: {innCost} gold</Text>
              <Text style={styles.restBenefit}>Fully restores health and mana for all party members</Text>
            </View>
            
            {restMessage && (
              <View style={styles.restMessageContainer}>
                <Text style={styles.restMessageText}>{restMessage}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[
                styles.restButton,
                (!gameState.player || gameState.player.currency < innCost) && styles.disabledButton
              ]}
              onPress={handleRest}
              disabled={!gameState.player || gameState.player.currency < innCost}
            >
              <Text style={styles.restButtonText}>Rest</Text>
            </TouchableOpacity>
          </View>
        );
        
      case "tavern":
        return (
          <View style={styles.buildingContent}>
            <Text style={styles.buildingTitle}>Tavern</Text>
            <Text style={styles.buildingDescription}>
              The local tavern is bustling with activity. Here you can find quests and potential recruits.
            </Text>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'quests' && styles.activeTabButton]}
                onPress={() => setActiveTab('quests')}
              >
                <Text style={styles.tabButtonText}>Quests</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'recruits' && styles.activeTabButton]}
                onPress={() => setActiveTab('recruits')}
              >
                <Text style={styles.tabButtonText}>Recruits</Text>
              </TouchableOpacity>
            </View>
            
            {activeTab === 'quests' ? (
              <ScrollView style={styles.questList}>
                {availableQuests.length > 0 ? (
                  availableQuests.map((quest, index) => (
                    <View key={index} style={styles.questItem}>
                      <View style={styles.questHeader}>
                        <Text style={styles.questTitle}>{quest.title}</Text>
                        <Text style={styles.questLevel}>Level {quest.level}</Text>
                      </View>
                      <Text style={styles.questDescription}>{quest.description}</Text>
                      <View style={styles.questRewards}>
                        <Text style={styles.questReward}>Reward: {quest.reward} gold</Text>
                        <Text style={styles.questReward}>XP: {quest.experience}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAcceptQuest(quest)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noQuestsText}>No quests available at the moment.</Text>
                )}
              </ScrollView>
            ) : (
              <ScrollView style={styles.recruitList}>
                {availableRecruits.length > 0 ? (
                  availableRecruits.map((recruit, index) => (
                    <View key={index} style={styles.recruitItem}>
                      <View style={styles.recruitHeader}>
                        <View style={styles.recruitNameContainer}>
                          {getClassIcon(recruit.class)}
                          <Text style={styles.recruitName}>{recruit.name}</Text>
                        </View>
                        <Text style={styles.recruitLevel}>Level {recruit.level} {recruit.class}</Text>
                      </View>
                      
                      <View style={styles.recruitStats}>
                        <View style={styles.statRow}>
                          <View style={styles.statItem}>
                            <Sword color="#d4af37" size={16} />
                            <Text style={styles.statText}>STR: {recruit.stats.strength}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Zap color="#d4af37" size={16} />
                            <Text style={styles.statText}>DEX: {recruit.stats.dexterity}</Text>
                          </View>
                        </View>
                        <View style={styles.statRow}>
                          <View style={styles.statItem}>
                            <Heart color="#d4af37" size={16} />
                            <Text style={styles.statText}>VIT: {recruit.stats.vitality}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Wand color="#d4af37" size={16} />
                            <Text style={styles.statText}>ENE: {recruit.stats.energy}</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.recruitCostContainer}>
                        <Text style={styles.recruitCost}>Hire Cost: {recruit.hireCost} gold</Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={[
                          styles.hireButton,
                          (!gameState.player || gameState.player.currency < recruit.hireCost) && styles.disabledButton
                        ]}
                        onPress={() => handleHireRecruit(recruit)}
                        disabled={!gameState.player || gameState.player.currency < recruit.hireCost}
                      >
                        <Text style={styles.hireButtonText}>Hire</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRecruitText}>No recruits available at the moment.</Text>
                )}
              </ScrollView>
            )}
          </View>
        );
        
      case "shop":
        return (
          <View style={styles.buildingContent}>
            <Text style={styles.buildingTitle}>Shop</Text>
            <Text style={styles.buildingDescription}>
              The local shop offers various goods and supplies for adventurers.
            </Text>
            
            <ShopGrid 
              items={shopItems} 
              onSelectItem={handleSelectShopItem}
            />
            
            {selectedItem && tooltipPosition && (
              <View style={[styles.shopTooltip, { top: tooltipPosition.y, left: tooltipPosition.x }]}>
                <Text style={styles.tooltipTitle}>{selectedItem.name}</Text>
                <Text style={styles.tooltipDescription}>{selectedItem.description}</Text>
                
                {selectedItem.bonuses && Object.keys(selectedItem.bonuses).length > 0 && (
                  <View style={styles.tooltipStats}>
                    {Object.entries(selectedItem.bonuses).map(([stat, value]) => (
                      <Text key={stat} style={styles.tooltipStat}>
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{value}
                      </Text>
                    ))}
                  </View>
                )}
                
                <Text style={styles.tooltipPrice}>Price: {selectedItem.value} gold</Text>
                
                <View style={styles.tooltipButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.buyButton,
                      (!gameState.player || gameState.player.currency < selectedItem.value) && styles.disabledButton
                    ]}
                    onPress={() => handleBuyItem(selectedItem)}
                    disabled={!gameState.player || gameState.player.currency < selectedItem.value}
                  >
                    <Text style={styles.buyButtonText}>Buy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => {
                      setSelectedItem(null);
                      setTooltipPosition(null);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
        
      default:
        return (
          <View style={styles.townOverview}>
            <Text style={styles.townName}>{currentTown?.name || "Unknown Town"}</Text>
            <Text style={styles.townDescription}>
              {currentTown?.description || "A small settlement on the frontier."}
            </Text>
            
            <Text style={styles.selectBuildingText}>Select a building to enter</Text>
          </View>
        );
    }
  };
  
  if (!currentTown) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Town not found. Please return to the game.</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => router.replace("/game")}
        >
          <Text style={styles.errorButtonText}>Return to Game</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000', '#111']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (selectedBuilding) {
                setSelectedBuilding(null);
              } else {
                router.replace("/game");
              }
            }}
          >
            <ArrowLeft color="#d4af37" size={24} />
            <Text style={styles.backButtonText}>
              {selectedBuilding ? "Town" : "Map"}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {selectedBuilding ? 
              (selectedBuilding.charAt(0).toUpperCase() + selectedBuilding.slice(1)) : 
              currentTown.name}
          </Text>
          
          <View style={styles.currencyContainer}>
            <Text style={styles.currencyText}>
              {gameState.player?.currency || 0} Gold
            </Text>
          </View>
        </View>
        
        {/* Main Content */}
        <View style={styles.content}>
          {selectedBuilding ? (
            renderBuildingContent()
          ) : (
            <View style={styles.buildingsContainer}>
              <TownBuilding 
                name="Inn"
                icon={<Bed color="#d4af37" size={32} />}
                onPress={() => setSelectedBuilding("inn")}
              />
              
              <TownBuilding 
                name="Tavern"
                icon={<Utensils color="#d4af37" size={32} />}
                onPress={() => setSelectedBuilding("tavern")}
              />
              
              <TownBuilding 
                name="Shop"
                icon={<ShoppingBag color="#d4af37" size={32} />}
                onPress={() => setSelectedBuilding("shop")}
              />
              
              <TownBuilding 
                name="Town Hall"
                icon={<Home color="#d4af37" size={32} />}
                onPress={() => setSelectedBuilding("townhall")}
              />
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#6b5a3e',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#d4af37',
    marginLeft: 4,
    fontSize: 16,
  },
  headerTitle: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  currencyContainer: {
    backgroundColor: 'rgba(107, 90, 62, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  currencyText: {
    color: '#d4af37',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  townOverview: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  townName: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  townDescription: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 16,
  },
  selectBuildingText: {
    color: '#bbb',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buildingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buildingContent: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  buildingTitle: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  buildingDescription: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  restInfo: {
    backgroundColor: 'rgba(107, 90, 62, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  restCost: {
    color: '#d4af37',
    fontSize: 16,
    marginBottom: 4,
  },
  restBenefit: {
    color: '#ddd',
    fontSize: 14,
  },
  restButton: {
    backgroundColor: '#6b5a3e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  restButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(107, 90, 62, 0.3)',
    borderColor: '#6b5a3e',
  },
  restMessageContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  restMessageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#444',
  },
  activeTabButton: {
    borderBottomColor: '#d4af37',
  },
  tabButtonText: {
    color: '#ddd',
    fontSize: 16,
  },
  questList: {
    maxHeight: 400,
  },
  questItem: {
    backgroundColor: 'rgba(107, 90, 62, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questLevel: {
    color: '#bbb',
    fontSize: 14,
  },
  questDescription: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  questRewards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questReward: {
    color: '#d4af37',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#6b5a3e',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noQuestsText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  comingSoonText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  // Recruit styles
  recruitList: {
    maxHeight: 400,
  },
  recruitItem: {
    backgroundColor: 'rgba(107, 90, 62, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6b5a3e',
  },
  recruitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recruitNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recruitName: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recruitLevel: {
    color: '#bbb',
    fontSize: 14,
  },
  recruitStats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statText: {
    color: '#ddd',
    fontSize: 14,
    marginLeft: 8,
  },
  recruitCostContainer: {
    marginBottom: 12,
  },
  recruitCost: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hireButton: {
    backgroundColor: '#6b5a3e',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  hireButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noRecruitText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // Shop tooltip styles
  shopTooltip: {
    position: 'absolute',
    width: 250,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d4af37',
    zIndex: 1000,
  },
  tooltipTitle: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tooltipDescription: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  tooltipStats: {
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tooltipStat: {
    color: '#2ecc71',
    fontSize: 14,
    marginBottom: 2,
  },
  tooltipPrice: {
    color: '#f1c40f',
    fontSize: 14,
    marginBottom: 12,
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyButton: {
    backgroundColor: '#6b5a3e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4af37',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555',
    flex: 1,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ddd',
    fontSize: 12,
    fontWeight: 'bold',
  },
});