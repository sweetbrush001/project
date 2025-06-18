import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>More Options</Text>


      <TouchableOpacity
        onPress={() => router.push('/moreOptionSection/sendParcels/send-parcels-2')}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <Ionicons name="cube-outline" size={24} color="#3366CC" />
          <Text style={styles.cardText}>Send Parcels   </Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>Beta</Text>
          </View>
        </View>
      </TouchableOpacity>



      {/* 🆕 FUTURE FEATURE PLACEHOLDER */}
      <TouchableOpacity style={styles.disabledCard} disabled>
        <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color="#AAA" />
        <Text style={styles.disabledText}>Coming Soon...</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#F4E2D8',
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
