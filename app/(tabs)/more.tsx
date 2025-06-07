import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function MoreScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>More Options</Text>

      {/* 🔹 SEND PARCELS with Beta Badge */}
      <TouchableOpacity
        onPress={() => navigation.navigate('SendParcelForm')}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <Ionicons name="cube-outline" size={24} color="#3366CC" />
          <Text style={styles.cardText}>Send Parcels</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>Beta</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 🆕 FUTURE FEATURE PLACEHOLDER */}
      <TouchableOpacity
        style={styles.disabledCard}
        disabled
      >
        <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color="#AAA" />
        <Text style={styles.disabledText}>Coming Soon...</Text>
      </TouchableOpacity>

      {/* Add more feature cards here later */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#E8F0FE',
    padding: 15,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  betaBadge: {
    marginLeft: 10,
    backgroundColor: '#3366CC',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betaText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledCard: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#AAA',
  },
});