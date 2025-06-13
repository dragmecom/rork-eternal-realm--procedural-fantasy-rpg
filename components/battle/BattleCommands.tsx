import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { Monster, BattleAction } from "@/types/monster";
import { Player } from "@/types/game";
import { Item } from "@/types/item";

interface BattleCommandsProps {
  player: Player;
  monsters: Monster[];
  onAction: (action: BattleAction) => void;
  canRun: boolean;
}

type CommandType = "main" | "attack" | "spell" | "item" | "item_target" | "spell_target";

const BattleCommands: React.FC<BattleCommandsProps> = ({
  player,
  monsters,
  onAction,
  canRun
}) => {
  const [currentMenu, setCurrentMenu] = useState<CommandType>("main");
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Handle attack command
  const handleAttack = () => {
    if (monsters.length === 1) {
      // If there's only one monster, attack it directly
      onAction({ type: "attack", target: 0 });
    } else {
      // Show target selection
      setCurrentMenu("attack");
    }
  };
  
  // Handle spell command
  const handleSpell = () => {
    setCurrentMenu("spell");
  };
  
  // Handle item command
  const handleItem = () => {
    setCurrentMenu("item");
  };
  
  // Handle run command
  const handleRun = () => {
    onAction({ type: "run" });
  };
  
  // Handle selecting a target for attack
  const handleSelectAttackTarget = (index: number) => {
    onAction({ type: "attack", target: index });
    setCurrentMenu("main");
  };
  
  // Handle selecting a spell
  const handleSelectSpell = (spellId: string) => {
    setSelectedSpell(spellId);
    
    // Check if spell needs a target
    if (spellId === "fireball" || spellId === "lightning") {
      // Show target selection for offensive spells
      setCurrentMenu("spell_target");
    } else {
      // Healing spells target self
      onAction({ type: "spell", spellId, target: "self" });
      setCurrentMenu("main");
    }
  };
  
  // Handle selecting a target for spell
  const handleSelectSpellTarget = (target: number) => {
    if (selectedSpell) {
      onAction({ 
        type: "spell", 
        spellId: selectedSpell, 
        target
      });
      setSelectedSpell(null);
      setCurrentMenu("main");
    }
  };
  
  // Handle selecting an item
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    
    // Check if item can target others (like healing potions)
    if (item.consumable?.targetOthers) {
      setCurrentMenu("item_target");
    } else {
      // Use item on self
      onAction({ 
        type: "item", 
        itemId: item.id, 
        target: "self",
        item // Pass the full item for better handling
      });
      setCurrentMenu("main");
    }
  };
  
  // Handle selecting a target for item use
  const handleSelectItemTarget = (target: "self" | number) => {
    if (selectedItem) {
      onAction({ 
        type: "item", 
        itemId: selectedItem.id, 
        target,
        item: selectedItem // Pass the full item for better handling
      });
      setSelectedItem(null);
      setCurrentMenu("main");
    }
  };
  
  // Handle back button
  const handleBack = () => {
    setCurrentMenu("main");
    setSelectedSpell(null);
    setSelectedItem(null);
  };
  
  // Get consumable items from inventory
  const getConsumableItems = () => {
    return player.inventory.filter(item => 
      item.type === "consumable" || (item.consumable && 
        ((item.consumable?.health && item.consumable.health > 0) || 
         (item.consumable?.mana && item.consumable.mana > 0) ||
         item.consumable?.statusCure))
    );
  };
  
  // Render main command menu
  const renderMainMenu = () => (
    <View style={styles.commandsContainer}>
      <TouchableOpacity 
        style={styles.commandButton}
        onPress={handleAttack}
      >
        <Text style={styles.commandText}>Attack</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.commandButton,
          player.stats.currentMana <= 0 && styles.disabledButton
        ]}
        onPress={handleSpell}
        disabled={player.stats.currentMana <= 0}
      >
        <Text style={styles.commandText}>Spell</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.commandButton,
          getConsumableItems().length === 0 && styles.disabledButton
        ]}
        onPress={handleItem}
        disabled={getConsumableItems().length === 0}
      >
        <Text style={styles.commandText}>Item</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.commandButton,
          !canRun && styles.disabledButton
        ]}
        onPress={handleRun}
        disabled={!canRun}
      >
        <Text style={styles.commandText}>Run</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render attack target selection
  const renderAttackTargets = () => (
    <View style={styles.targetContainer}>
      <Text style={styles.targetTitle}>Select Target:</Text>
      
      <ScrollView style={styles.targetList}>
        {monsters.map((monster, index) => (
          <TouchableOpacity
            key={index}
            style={styles.targetButton}
            onPress={() => handleSelectAttackTarget(index)}
          >
            <Text style={styles.targetText}>
              {monster.name} (HP: {monster.stats.hp}/{monster.stats.maxHp})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render spell selection
  const renderSpellSelection = () => {
    // Mock spells for demonstration
    const availableSpells = [
      { id: "fireball", name: "Fireball", manaCost: 5, description: "Deals fire damage to a single target" },
      { id: "heal", name: "Heal", manaCost: 8, description: "Restores health to yourself" },
      { id: "lightning", name: "Lightning Bolt", manaCost: 10, description: "Deals lightning damage to a single target" }
    ];
    
    return (
      <View style={styles.spellContainer}>
        <Text style={styles.spellTitle}>Select Spell:</Text>
        
        <ScrollView style={styles.spellList}>
          {availableSpells.map((spell, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.spellButton,
                player.stats.currentMana < spell.manaCost && styles.disabledButton
              ]}
              onPress={() => handleSelectSpell(spell.id)}
              disabled={player.stats.currentMana < spell.manaCost}
            >
              <Text style={styles.spellText}>
                {spell.name} (MP: {spell.manaCost})
              </Text>
              <Text style={styles.spellDescription}>
                {spell.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render spell target selection
  const renderSpellTargets = () => (
    <View style={styles.targetContainer}>
      <Text style={styles.targetTitle}>Select Target for {selectedSpell === "fireball" ? "Fireball" : "Lightning Bolt"}:</Text>
      
      <ScrollView style={styles.targetList}>
        {monsters.map((monster, index) => (
          <TouchableOpacity
            key={index}
            style={styles.targetButton}
            onPress={() => handleSelectSpellTarget(index)}
          >
            <Text style={styles.targetText}>
              {monster.name} (HP: {monster.stats.hp}/{monster.stats.maxHp})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentMenu("spell")}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render item selection
  const renderItemSelection = () => {
    // Filter for usable items (potions, etc.)
    const usableItems = getConsumableItems();
    
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>Select Item:</Text>
        
        <ScrollView style={styles.itemList}>
          {usableItems.length > 0 ? (
            usableItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemButton}
                onPress={() => handleSelectItem(item)}
              >
                <Text style={styles.itemText}>
                  {item.name} {item.quantity ? `(x${item.quantity})` : ''}
                </Text>
                {item.consumable && (
                  <Text style={styles.itemEffectText}>
                    {item.consumable?.health ? `+${item.consumable.health} HP` : ''}
                    {item.consumable?.health && item.consumable?.mana ? ' | ' : ''}
                    {item.consumable?.mana ? `+${item.consumable.mana} MP` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noItemsText}>No usable items</Text>
          )}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render item target selection
  const renderItemTargetSelection = () => {
    if (!selectedItem) return null;

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>Use {selectedItem.name} on:</Text>
        
        <ScrollView style={styles.itemList}>
          {/* Self target option */}
          <TouchableOpacity
            style={styles.itemButton}
            onPress={() => handleSelectItemTarget("self")}
          >
            <Text style={styles.itemText}>
              {player.name} (You)
            </Text>
            <Text style={styles.itemStatText}>
              HP: {player.stats.currentHealth}/{player.stats.maxHealth}
              {player.stats.maxMana > 0 ? ` | MP: ${player.stats.currentMana}/${player.stats.maxMana}` : ''}
            </Text>
          </TouchableOpacity>
          
          {/* Party members would go here if we had them */}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render the appropriate menu based on current state
  switch (currentMenu) {
    case "attack":
      return renderAttackTargets();
    case "spell":
      return renderSpellSelection();
    case "spell_target":
      return renderSpellTargets();
    case "item":
      return renderItemSelection();
    case "item_target":
      return renderItemTargetSelection();
    default:
      return renderMainMenu();
  }
};

const styles = StyleSheet.create({
  commandsContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  commandButton: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    width: "48%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  commandText: {
    color: "#ddd",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  disabledButton: {
    backgroundColor: "rgba(50, 50, 50, 0.3)",
    borderColor: "#444",
  },
  targetContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  targetTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  targetList: {
    maxHeight: 150,
  },
  targetButton: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  targetText: {
    color: "#ddd",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "rgba(70, 70, 70, 0.7)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  backButtonText: {
    color: "#ddd",
    fontSize: 14,
  },
  spellContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  spellTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  spellList: {
    maxHeight: 150,
  },
  spellButton: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  spellText: {
    color: "#ddd",
    fontSize: 16,
  },
  spellDescription: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },
  itemContainer: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  itemTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  itemList: {
    maxHeight: 150,
  },
  itemButton: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  itemText: {
    color: "#ddd",
    fontSize: 16,
  },
  itemEffectText: {
    color: "#3498db",
    fontSize: 14,
    marginTop: 4,
  },
  itemStatText: {
    color: "#95a5a6",
    fontSize: 14,
    marginTop: 4,
  },
  noItemsText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
});

export default BattleCommands;