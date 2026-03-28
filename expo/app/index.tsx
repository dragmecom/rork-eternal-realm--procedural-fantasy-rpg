import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ImageBackground, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useGameState } from "@/context/GameContext";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const { initializeGame } = useGameState();
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a random seed
  const generateRandomSeed = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 16;
    let result = "";
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setSeed(result);
  };
  
  // Start a new game
  const handleStartGame = async () => {
    if (!seed.trim()) {
      setError("Please enter a seed or generate a random one");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Starting game initialization with seed:', seed);
      await initializeGame(seed);
      console.log('Game initialized successfully, navigating to game screen');
      router.replace("/game");
    } catch (err) {
      console.error("Failed to start game:", err);
      setError("Failed to start game. Please try again.");
      setLoading(false);
    }
  };
  
  // Load a saved game
  const handleLoadGame = () => {
    router.push("/load-game");
  };
  
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop" }}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(20,20,20,0.8)']}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Text Adventure RPG</Text>
            <Text style={styles.subtitle}>Explore, Discover, Survive</Text>
            
            <View style={styles.seedContainer}>
              <Text style={styles.seedLabel}>World Seed:</Text>
              <TextInput
                style={styles.seedInput}
                value={seed}
                onChangeText={setSeed}
                placeholder="Enter seed..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.randomButton}
                onPress={generateRandomSeed}
              >
                <Text style={styles.randomButtonText}>Random</Text>
              </TouchableOpacity>
            </View>
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleStartGame}
              disabled={loading}
            >
              <Text style={styles.startButtonText}>
                {loading ? "Starting Adventure..." : "Start Adventure"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loadButton}
              onPress={handleLoadGame}
              disabled={loading}
            >
              <Text style={styles.loadButtonText}>Load Game</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    color: "#d4af37",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Copperplate' : 'normal',
  },
  subtitle: {
    color: "#bbb",
    fontSize: 18,
    marginBottom: 40,
    textAlign: "center",
  },
  seedContainer: {
    width: "100%",
    marginBottom: 24,
  },
  seedLabel: {
    color: "#ddd",
    fontSize: 16,
    marginBottom: 8,
  },
  seedInput: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    borderWidth: 1,
    borderColor: "#6b5a3e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 8,
    width: "100%",
  },
  randomButton: {
    backgroundColor: "#444",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  randomButtonText: {
    color: "#ddd",
    fontSize: 14,
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 16,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#6b5a3e",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d4af37",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#6b5a3e",
  },
  loadButtonText: {
    color: "#ddd",
    fontSize: 18,
  },
  versionText: {
    color: "#777",
    fontSize: 12,
  },
});