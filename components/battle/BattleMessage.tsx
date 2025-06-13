import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

interface BattleMessageProps {
  message: string;
}

const BattleMessage: React.FC<BattleMessageProps> = ({ message }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Reset opacity and start fade-in animation when message changes
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [message]);
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6b5a3e",
    minHeight: 60,
    justifyContent: "center",
  },
  message: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
  },
});

export default BattleMessage;