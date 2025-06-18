// app/features/send-parcel/components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { FONT, SIZES, BROWN } from '../utils/constants';

export const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Package size={28} color={BROWN.primary} style={styles.logoIcon} />
        <Text style={styles.logoText}>Send Parcel</Text>
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>Beta</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.m,
    paddingVertical: SIZES.m,
    backgroundColor: BROWN.card,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: SIZES.xs,
  },
  logoText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: BROWN.primary,
  },
  betaBadge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  betaText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});