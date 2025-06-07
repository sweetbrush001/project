import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Package } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS } from '../../constants/theme';
import LocationPicker from '../../components/LocationPicker';
import SearchButton from '../../components/SearchButton';
import LocationSwapButton from '../../components/LocationSwapButton';
import { getPopularLocations, getAllLocations } from '../../services/busService';

export default function SendParcelScreen() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ from?: string; to?: string }>({});

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const allLocations = await getAllLocations();
        setLocations(allLocations);
      } catch {
        try {
          const popularLocations = await getPopularLocations();
          setLocations(popularLocations);
        } catch {
          Alert.alert('Error', 'Failed to load locations. Try again later.');
        }
      }
    };
    loadLocations();
  }, []);

  const handleLocationSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    setError({});
  };

  const handleSearchPress = () => {
    const newErrors: { from?: string; to?: string } = {};
    if (!fromLocation) newErrors.from = 'Please select pickup location';
    if (!toLocation) newErrors.to = 'Please select delivery location';
    if (fromLocation === toLocation) newErrors.to = 'Pickup and delivery cannot be the same';

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/parcel-confirmation',
        params: { from: fromLocation, to: toLocation },
      });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FDF6E3" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Package size={28} color={styles.logoText.color} style={styles.logoIcon} />
              <Text style={styles.logoText}>Send Parcel   </Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>Beta</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Send a Parcel</Text>
            <Text style={styles.subtitle}>Send Parcels Using Local Buses </Text>
            <Text ></Text>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.locationContainer}>
                <View style={styles.locationPickerWrapper}>
                  <LocationPicker
                    label="Pickup From"
                    value={fromLocation}
                    locations={locations}
                    onChange={setFromLocation}
                    placeholder="Select pickup point"
                    error={error.from}
                  />
                </View>



                <View style={styles.locationPickerWrapper}>
                  <LocationPicker
                    label="Deliver To"
                    value={toLocation}
                    locations={locations}
                    onChange={setToLocation}
                    placeholder="Select delivery point"
                    error={error.to}
                  />
                </View>
              </View>

              <SearchButton
                onPress={handleSearchPress}
                isLoading={loading}
                disabled={!fromLocation || !toLocation}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BROWN = {
  background: '#ffff',   // soft warm background
  card: '#F4E2D8',         // light tan for cards
  primary: '#A47148',      // brownish-orange
  textPrimary: '#3E2C1C',  // dark brown
  textSecondary: '#6F4E37', // medium brown
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BROWN.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: SIZES.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingHorizontal: SIZES.m,
    paddingVertical: SIZES.m,
    backgroundColor: BROWN.card,
    ...SHADOWS.small,
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
  content: {
    flex: 1,
    padding: SIZES.m,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: BROWN.textPrimary,
    marginTop: SIZES.s,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: BROWN.textSecondary,
    marginVertical: SIZES.xs,
  },
  formContainer: {
    backgroundColor: BROWN.card,
    borderRadius: SIZES.m,
    padding: SIZES.m,
    ...SHADOWS.small,
    marginBottom: SIZES.l,
  },
  locationContainer: {
    position: 'relative',
  },
  locationPickerWrapper: {
    zIndex: 1000,
  },
  swapButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -20,
    zIndex: 1001,
  },
});