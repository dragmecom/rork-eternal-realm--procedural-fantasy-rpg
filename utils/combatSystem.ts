import { Monster, BattleState, BattleAction, TurnOrder } from "@/types/monster";
import { Player } from "@/types/game";
import { createSeededRandom } from "./seedGenerator";
import { ConsumableEffect, Item } from "@/types/item";

/**
 * Initialize a battle state
 */
export function initializeBattle(
  monsters: Monster[],
  player: Player,
  canRun: boolean,
  ambush: boolean
): BattleState {
  // Ensure monsters have proper stats
  const validatedMonsters = monsters.map(monster => {
    // Make sure monster has all required properties
    return {
      ...monster,
      stats: {
        ...monster.stats, // Spread existing stats first
        hp: monster.stats?.hp || 10,
        maxHp: monster.stats?.maxHp || 10,
        attack: monster.stats?.attack || 5,
        defense: monster.stats?.defense || 3,
        speed: monster.stats?.speed || 5,
        magicResist: monster.stats?.magicResist || 0
      },
      abilities: monster.abilities || [{
        name: "Attack",
        description: "A basic attack",
        damage: monster.stats?.attack || 5,
        type: "physical",
        useChance: 1.0
      }],
      drops: monster.drops || [],
      imageUrl: monster.imageUrl || "https://images.unsplash.com/photo-1560942485-b2a11cc13456?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    };
  });
  
  // Calculate turn order
  const turnOrder = calculateTurnOrder(player, validatedMonsters);
  
  // Create battle state
  const battleState: BattleState = {
    inBattle: true,
    monsters: validatedMonsters,
    playerTurn: !ambush, // If ambush, monsters go first
    currentRound: 1,
    battleLog: [],
    playerStatus: {
      poisoned: false,
      poisonTurnsLeft: 0,
      sleeping: false,
      sleepTurnsLeft: 0,
      paralyzed: false,
      paralysisTurnsLeft: 0,
      confused: false,
      confusionTurnsLeft: 0
    },
    selectedAction: null,
    selectedTarget: null,
    battleResult: "ongoing",
    rewards: null,
    canRun,
    turnOrder
  };
  
  // Add initial message
  if (ambush) {
    battleState.battleLog.push("You've been ambushed! The enemies attack first!");
  } else {
    battleState.battleLog.push("Battle started! You have the initiative!");
  }
  
  return battleState;
}

/**
 * Calculate turn order based on speed/dexterity
 */
export function calculateTurnOrder(
  player: Player,
  monsters: Monster[]
): TurnOrder[] {
  // Make sure player and player.stats exist
  if (!player || !player.stats) {
    console.error("Player or player.stats is undefined in calculateTurnOrder");
    // Return a default turn order with just monsters
    return [
      ...monsters.map((monster, index) => ({
        type: 'monster' as const,
        id: monster.id,
        name: monster.name || "Unknown Monster",
        speed: monster.stats?.speed || 5,
        index,
        status: null as string | null
      }))
    ];
  }

  // Create turn order array
  const turnOrder: TurnOrder[] = [
    {
      type: 'player' as const,
      id: 'player', 
      name: player.name || "Hero", 
      speed: player.stats.dexterity || 10, // Use dexterity as speed, with fallback
      status: null as string | null
    },
    ...monsters.map((monster, index) => ({
      type: 'monster' as const,
      id: monster.id,
      name: monster.name || "Unknown Monster",
      speed: monster.stats?.speed || 5,
      index,
      status: null as string | null
    }))
  ];
  
  // Sort by speed (higher goes first)
  turnOrder.sort((a, b) => b.speed - a.speed);
  
  return turnOrder;
}

/**
 * Process a player action in battle
 */
export function processPlayerAction(
  action: BattleAction,
  battleState: BattleState,
  player: Player,
  seed: string
): { updatedBattleState: BattleState; updatedPlayer: Player } {
  const random = createSeededRandom(seed + Date.now());
  const updatedBattleState = { ...battleState };
  const updatedPlayer = { ...player };
  
  // Get live monsters (hp > 0)
  const liveMonsters = updatedBattleState.monsters.filter(monster => monster.stats.hp > 0);
  
  switch (action.type) {
    case "attack":
      // Handle basic attack
      if (action.target !== undefined) {
        // Map the target index to the actual live monster index
        const targetIndex = action.target;
        
        // Make sure we have a valid target
        if (targetIndex >= 0 && targetIndex < liveMonsters.length) {
          const target = liveMonsters[targetIndex];
          
          // Calculate damage
          const baseDamage = player.stats.attack || 5;
          const critChance = ((player.stats.dexterity || 10) / 100);
          const isCrit = random.randomBool(critChance);
          const damageMultiplier = isCrit ? 1.5 : 1.0;
          
          // Apply defense reduction
          const defenseReduction = (target.stats.defense || 3) / ((target.stats.defense || 3) + 50);
          const finalDamage = Math.max(1, Math.floor(baseDamage * damageMultiplier * (1 - defenseReduction)));
          
          // Apply damage
          target.stats.hp = Math.max(0, target.stats.hp - finalDamage);
          
          // Add message
          updatedBattleState.battleLog.push(
            isCrit 
              ? `Critical hit! You deal ${finalDamage} damage to ${target.name}!` 
              : `You attack ${target.name} for ${finalDamage} damage!`
          );
          
          // Check if monster is defeated
          if (target.stats.hp <= 0) {
            updatedBattleState.battleLog.push(`${target.name} is defeated!`);
            
            // Update the monsters array to mark this monster as defeated
            const monsterIndex = updatedBattleState.monsters.findIndex(m => m.id === target.id);
            if (monsterIndex !== -1) {
              updatedBattleState.monsters[monsterIndex].stats.hp = 0;
            }
            
            // Check if all monsters are defeated
            const allDefeated = updatedBattleState.monsters.every(m => m.stats.hp <= 0);
            if (allDefeated) {
              updatedBattleState.battleResult = "victory";
              updatedBattleState.battleLog.push("Victory! You've defeated all enemies!");
              
              // Calculate rewards
              updatedBattleState.rewards = calculateBattleRewards(
                updatedBattleState.monsters,
                player.level,
                seed
              );
            }
          }
        } else {
          // Invalid target
          updatedBattleState.battleLog.push("Invalid target!");
        }
      }
      break;
      
    case "spell":
      // Handle spell usage
      if (action.spell) {
        const spell = action.spell;
        let manaCost = 0;
        let spellName = "";
        let damage = 0;
        
        // Set spell properties based on spell
        switch (spell) {
          case "fireball":
            manaCost = 5;
            spellName = "Fireball";
            damage = 15;
            break;
          case "lightning":
            manaCost = 10;
            spellName = "Lightning Bolt";
            damage = 25;
            break;
          case "heal":
            manaCost = 8;
            spellName = "Heal";
            // Healing amount
            const healAmount = 20;
            
            // Apply healing
            updatedPlayer.stats.currentHealth = Math.min(
              updatedPlayer.stats.maxHealth,
              updatedPlayer.stats.currentHealth + healAmount
            );
            
            // Deduct mana
            updatedPlayer.stats.currentMana = Math.max(0, updatedPlayer.stats.currentMana - manaCost);
            
            // Add message
            updatedBattleState.battleLog.push(`You cast ${spellName} and recover ${healAmount} HP!`);
            break;
        }
        
        // Handle offensive spells
        if (spell === "fireball" || spell === "lightning") {
          if (typeof action.target === "number") {
            // Map the target index to the actual live monster index
            const targetIndex = action.target;
            
            // Make sure we have a valid target
            if (targetIndex >= 0 && targetIndex < liveMonsters.length) {
              const target = liveMonsters[targetIndex];
              
              // Deduct mana
              updatedPlayer.stats.currentMana = Math.max(0, updatedPlayer.stats.currentMana - manaCost);
              
              // Calculate damage
              const critChance = ((player.stats.energy || 10) / 100);
              const isCrit = random.randomBool(critChance);
              const damageMultiplier = isCrit ? 1.5 : 1.0;
              
              // Apply magic resistance reduction
              const magicResist = target.stats.magicResist || 0;
              const resistReduction = magicResist / (magicResist + 100);
              const finalDamage = Math.max(1, Math.floor(damage * damageMultiplier * (1 - resistReduction)));
              
              // Apply damage
              target.stats.hp = Math.max(0, target.stats.hp - finalDamage);
              
              // Add message
              updatedBattleState.battleLog.push(
                isCrit 
                  ? `Critical spell! You cast ${spellName} for ${finalDamage} damage to ${target.name}!` 
                  : `You cast ${spellName} for ${finalDamage} damage to ${target.name}!`
              );
              
              // Check if monster is defeated
              if (target.stats.hp <= 0) {
                updatedBattleState.battleLog.push(`${target.name} is defeated!`);
                
                // Update the monsters array to mark this monster as defeated
                const monsterIndex = updatedBattleState.monsters.findIndex(m => m.id === target.id);
                if (monsterIndex !== -1) {
                  updatedBattleState.monsters[monsterIndex].stats.hp = 0;
                }
                
                // Check if all monsters are defeated
                const allDefeated = updatedBattleState.monsters.every(m => m.stats.hp <= 0);
                if (allDefeated) {
                  updatedBattleState.battleResult = "victory";
                  updatedBattleState.battleLog.push("Victory! You've defeated all enemies!");
                  
                  // Calculate rewards
                  updatedBattleState.rewards = calculateBattleRewards(
                    updatedBattleState.monsters,
                    player.level,
                    seed
                  );
                }
              }
            } else {
              // Invalid target
              updatedBattleState.battleLog.push("Invalid target!");
            }
          }
        }
      }
      break;
      
    case "item":
      // Handle item usage
      if (action.item) {
        const item = action.item;
        
        // Apply item effects
        if (item.consumable && typeof item.consumable === 'object') {
          const consumable = item.consumable as ConsumableEffect;
          
          // Heal health if applicable
          if (consumable.health && consumable.health > 0) {
            const healAmount = consumable.health;
            updatedPlayer.stats.currentHealth = Math.min(
              updatedPlayer.stats.maxHealth,
              updatedPlayer.stats.currentHealth + healAmount
            );
            updatedBattleState.battleLog.push(`You used ${item.name} and recovered ${healAmount} HP!`);
          }
          
          // Restore mana if applicable
          if (consumable.mana && consumable.mana > 0) {
            const manaAmount = consumable.mana;
            updatedPlayer.stats.currentMana = Math.min(
              updatedPlayer.stats.maxMana,
              updatedPlayer.stats.currentMana + manaAmount
            );
            updatedBattleState.battleLog.push(`You used ${item.name} and recovered ${manaAmount} MP!`);
          }
          
          // Cure status effects if applicable
          if (consumable.statusCure) {
            // Fix: Use proper string comparison for status cure
            const statusCure = consumable.statusCure;
            
            if (statusCure === "all" || statusCure === "poison") {
              updatedBattleState.playerStatus.poisoned = false;
              updatedBattleState.playerStatus.poisonTurnsLeft = 0;
            }
            if (statusCure === "all" || statusCure === "sleep") {
              updatedBattleState.playerStatus.sleeping = false;
              updatedBattleState.playerStatus.sleepTurnsLeft = 0;
            }
            if (statusCure === "all" || statusCure === "paralysis") {
              updatedBattleState.playerStatus.paralyzed = false;
              updatedBattleState.playerStatus.paralysisTurnsLeft = 0;
            }
            if (statusCure === "all" || statusCure === "confusion") {
              updatedBattleState.playerStatus.confused = false;
              updatedBattleState.playerStatus.confusionTurnsLeft = 0;
            }
            
            updatedBattleState.battleLog.push(`You used ${item.name} and cured your status ailments!`);
          }
          
          // Reduce item quantity
          const itemIndex = updatedPlayer.inventory.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            const updatedInventory = [...updatedPlayer.inventory];
            if (updatedInventory[itemIndex].quantity > 1) {
              updatedInventory[itemIndex] = {
                ...updatedInventory[itemIndex],
                quantity: updatedInventory[itemIndex].quantity - 1
              };
            } else {
              updatedInventory.splice(itemIndex, 1);
            }
            updatedPlayer.inventory = updatedInventory;
          }
        }
      } else {
        updatedBattleState.battleLog.push("Item usage failed.");
      }
      break;
      
    case "run":
      // Handle run attempt
      if (updatedBattleState.canRun) {
        // Calculate run chance based on player dexterity vs monster speed
        const averageMonsterSpeed = liveMonsters.reduce(
          (sum, monster) => sum + (monster.stats.speed || 5), 
          0
        ) / liveMonsters.length;
        
        const playerDexterity = player.stats.dexterity || 10;
        const runChance = 0.5 + ((playerDexterity - averageMonsterSpeed) * 0.05);
        const runSuccess = random.randomBool(Math.min(0.9, Math.max(0.1, runChance)));
        
        if (runSuccess) {
          updatedBattleState.battleResult = "escape";
          updatedBattleState.battleLog.push("You successfully escaped from battle!");
        } else {
          updatedBattleState.battleLog.push("You failed to escape!");
          // Skip player's turn
          updatedBattleState.playerTurn = false;
        }
      } else {
        updatedBattleState.battleLog.push("You cannot escape from this battle!");
      }
      break;
      
    default:
      // Unknown action
      updatedBattleState.battleLog.push("Invalid action.");
      break;
  }
  
  // If battle is still ongoing and player's turn is over, switch to monster turn
  if (updatedBattleState.battleResult === "ongoing" && updatedBattleState.playerTurn) {
    updatedBattleState.playerTurn = false;
  }
  
  // Update turn order to remove dead monsters
  updatedBattleState.turnOrder = updatedBattleState.turnOrder.filter(combatant => 
    combatant.type === 'player' || 
    (combatant.type === 'monster' && 
     updatedBattleState.monsters.some(m => m.id === combatant.id && m.stats.hp > 0))
  );
  
  // Update selected target if it's no longer valid
  if (updatedBattleState.selectedTarget !== null) {
    const liveMonsters = updatedBattleState.monsters.filter(m => m.stats.hp > 0);
    if (updatedBattleState.selectedTarget >= liveMonsters.length) {
      updatedBattleState.selectedTarget = liveMonsters.length > 0 ? 0 : null;
    }
  }
  
  return { updatedBattleState, updatedPlayer };
}

/**
 * Process monster actions in battle
 */
export function processMonsterAction(
  battleState: BattleState,
  player: Player,
  seed: string
): { updatedBattleState: BattleState; updatedPlayer: Player } {
  const random = createSeededRandom(seed + Date.now());
  const updatedBattleState = { ...battleState };
  const updatedPlayer = { ...player };
  
  // Skip if it's player's turn
  if (updatedBattleState.playerTurn) {
    return { updatedBattleState, updatedPlayer };
  }
  
  // Get live monsters (hp > 0)
  const liveMonsters = updatedBattleState.monsters.filter(monster => monster.stats.hp > 0);
  
  // Process each live monster's action
  for (let i = 0; i < liveMonsters.length; i++) {
    const monster = liveMonsters[i];
    
    // Choose an ability to use
    let ability = monster.abilities[0]; // Default to first ability
    
    if (monster.abilities.length > 1) {
      // Filter abilities by use chance
      const availableAbilities = monster.abilities.filter(a => 
        random.randomBool(a.useChance || 1.0)
      );
      
      if (availableAbilities.length > 0) {
        // Choose a random ability from available ones
        ability = availableAbilities[random.randomInt(0, availableAbilities.length - 1)];
      }
    }
    
    // Calculate damage
    const baseDamage = ability.damage || monster.stats.attack || 5;
    const critChance = 0.05; // 5% base crit chance
    const isCrit = random.randomBool(critChance);
    const damageMultiplier = isCrit ? 1.5 : 1.0;
    
    // Apply defense reduction
    const playerDefense = updatedPlayer.stats.defense || 5;
    const defenseReduction = playerDefense / (playerDefense + 50);
    const finalDamage = Math.max(1, Math.floor(baseDamage * damageMultiplier * (1 - defenseReduction)));
    
    // Apply damage to player
    updatedPlayer.stats.currentHealth = Math.max(0, updatedPlayer.stats.currentHealth - finalDamage);
    
    // Add message
    updatedBattleState.battleLog.push(
      isCrit 
        ? `Critical hit! ${monster.name} uses ${ability.name} for ${finalDamage} damage!` 
        : `${monster.name} uses ${ability.name} for ${finalDamage} damage!`
    );
    
    // Check if player is defeated
    if (updatedPlayer.stats.currentHealth <= 0) {
      updatedBattleState.battleResult = "defeat";
      updatedBattleState.battleLog.push("You have been defeated!");
      break; // Stop processing monster actions
    }
  }
  
  // If battle is still ongoing, switch back to player's turn
  if (updatedBattleState.battleResult === "ongoing") {
    updatedBattleState.playerTurn = true;
    updatedBattleState.currentRound++;
    updatedBattleState.battleLog.push(`Round ${updatedBattleState.currentRound} begins!`);
  }
  
  return { updatedBattleState, updatedPlayer };
}

/**
 * Calculate rewards for defeating monsters
 */
export function calculateBattleRewards(
  monsters: Monster[],
  playerLevel: number,
  seed: string
): { experience: number; gold: number; items: any[] } {
  const random = createSeededRandom(seed);
  
  // Calculate experience
  let totalExp = 0;
  monsters.forEach(monster => {
    // Base exp is monster level * 10
    let baseExp = (monster.level || 1) * 10;
    
    // Adjust based on level difference
    const levelDiff = (monster.level || 1) - playerLevel;
    let levelMultiplier = 1.0;
    
    if (levelDiff >= 3) {
      levelMultiplier = 1.5; // Much higher level monster
    } else if (levelDiff >= 1) {
      levelMultiplier = 1.2; // Higher level monster
    } else if (levelDiff <= -3) {
      levelMultiplier = 0.5; // Much lower level monster
    } else if (levelDiff <= -1) {
      levelMultiplier = 0.8; // Lower level monster
    }
    
    totalExp += Math.floor(baseExp * levelMultiplier);
  });
  
  // Calculate gold
  let totalGold = 0;
  monsters.forEach(monster => {
    // Base gold is monster level * 5
    const baseGold = (monster.level || 1) * 5;
    
    // Add random variance
    const variance = random.randomFloat(-0.2, 0.2); // +/- 20%
    totalGold += Math.floor(baseGold * (1 + variance));
  });
  
  // Calculate item drops
  const items: any[] = [];
  monsters.forEach(monster => {
    if (!monster.drops || monster.drops.length === 0) return;
    
    monster.drops.forEach(drop => {
      if (random.randomBool(drop.chance)) {
        // Determine quantity
        const quantity = random.randomInt(drop.minQuantity, drop.maxQuantity);
        
        // Add to drops
        items.push({
          id: drop.itemId,
          name: "Item", // This would be replaced with actual item name
          quantity
        });
      }
    });
  });
  
  return { experience: totalExp, gold: totalGold, items };
}