import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useGameState } from "@/context/GameContext";
import { getSavedGames, loadGame, deleteSavedGame, SaveMetadata } from "@/utils/saveGameUtils";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Trash2 } from "lucide-react-native";

export default function LoadGameScreen() {
  const router = useRouter();
  const { loadGameState } = useGameState();
  const [savedGames, setSavedGames] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load saved games on mount
  useEffect(() => {
    const fetchSavedGames = async () => {
      try {
        setLoading(true);
        const games = await getSavedGames();
        // Sort by timestamp, newest first
        games.sort((a, b) => b.timestamp - a.timestamp);
        setSavedGames(games);
      } catch (err) {
        setError("Failed to load saved games");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedGames();
  }, []);
  
  // Handle loading a game
  const handleLoadGame = async (saveId: string) => {
    try {
      setLoading(true);
      const gameState = await loadGame(saveId);
      await loadGameState(gameState);
      router.replace("/game");
    } catch (err) {
      setError("Failed to load game");
      console.error(err);
      setLoading(false);
    }
  };
  
  // Handle deleting a game
  const handleDeleteGame = (saveId: string) => {
    Alert.alert(
      "Delete Save",
      "Are you sure you want to delete this saved game? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedGame(saveId);
              setSavedGames(savedGames.filter(game => game.id !== saveId));
            } catch (err) {
              setError("Failed to delete saved game");
              console.error(err);
            }
          }
        }
      ]
    );
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop" }}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(20,20,20,0.9)']}
          style={styles.overlay}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Load Game</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading saved games...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.backToMenuButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backToMenuText}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
          ) : savedGames.length === 0 ? (
            <View style={styles.noSavesContainer}>
              <Text style={styles.noSavesText}>No saved games found</Text>
              <TouchableOpacity 
                style={styles.backToMenuButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backToMenuText}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={savedGames}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.saveItem}
                  onPress={() => handleLoadGame(item.id)}
                >
                  <View style={styles.saveInfo}>
                    <Text style={styles.saveName}>{item.playerName}</Text>
                    <Text style={styles.saveDetails}>
                      Level {item.playerLevel} • {item.worldName}
                    </Text>
                    <Text style={styles.saveDate}>{formatDate(item.timestamp)}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteGame(item.id)}
                  >
                    <Trash2 color="#e74c3c" size={20} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#6b5a3e",
  },
  headerTitle: {
    color: "#d4af37",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ddd",
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  noSavesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noSavesText: {
    color: "#ddd",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  backToMenuButton: {
    backgroundColor: "#6b5a3e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d4af37",
  },
  backToMenuText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  saveItem: {
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveInfo: {
    flex: 1,
  },
  saveName: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  saveDetails: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 4,
  },
  saveDate: {
    color: "#999",
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
});