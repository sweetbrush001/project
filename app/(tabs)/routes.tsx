import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/theme';
import { Map } from 'lucide-react-native';

export default function RoutesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Map size={80} color={COLORS.primary[300]} />
        <Text style={styles.title}>Routes</Text>
        <Text style={styles.subtitle}>
          Popular bus routes in Sri Lanka will be displayed here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.l,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: COLORS.neutral[800],
    marginTop: SIZES.m,
    marginBottom: SIZES.s,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
});