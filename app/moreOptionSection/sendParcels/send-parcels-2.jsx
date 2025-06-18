// app/features/send-parcel/SendParcelScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Header } from './components/Header';
import { COLORS, SIZES, FONT } from './utils/constants';

const SendParcelScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Send a Parcel</Text>
          <Text style={styles.subtitle}>Parcel delivery via local buses</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingBottom: SIZES.xl,
  },
  content: {
    flex: 1,
    padding: SIZES.m,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: SIZES.s,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginVertical: SIZES.xs,
  },
});

export default SendParcelScreen;