import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Bus,
  Info
} from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS, globalStyles } from '../../constants/theme';
import LocationPicker from '../../components/LocationPicker';
import SearchButton from '../../components/SearchButton';
import LocationSwapButton from '../../components/LocationSwapButton';
import RecentSearchCard from '../../components/RecentSearchCard';
import { getPopularLocations, getAllLocations } from '../../services/busService';

// Example recent searches
const recentSearches = [
  { from: 'Colombo', to: 'Kandy', date: 'Yesterday' },
  { from: 'Galle', to: 'Colombo', date: '3 days ago' },
  { from: 'Colombo', to: 'Jaffna', date: 'Last week' },
];

export default function HomeScreen() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{from?: string; to?: string}>({});

  useEffect(() => {
    // Load all locations including intermediate stops
    const loadLocations = async () => {
      try {
        console.log('Loading comprehensive location list...');
        const allLocations = await getAllLocations();
        console.log(`✅ Loaded ${allLocations.length} locations including intermediate stops`);
        console.log('📍 Sample locations:', allLocations.slice(0, 10));
        setLocations(allLocations);
      } catch (err) {
        console.error('❌ Failed to load locations:', err);
        // Fallback to popular locations if enhanced search fails
        try {
          console.log('🔄 Falling back to popular locations...');
          const popularLocations = await getPopularLocations();
          console.log(`✅ Loaded ${popularLocations.length} popular locations as fallback`);
          setLocations(popularLocations);
        } catch (fallbackErr) {
          console.error('❌ Fallback also failed:', fallbackErr);
          Alert.alert(
            'Error',
            'Failed to load locations. Please try again later.'
          );
        }
      }
    };

    loadLocations();
  }, []);

  const handleLocationSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    // Clear any errors when swapping
    setError({});
  };

  const handleSearchPress = () => {
    // Validate inputs
    const newErrors: {from?: string; to?: string} = {};
    
    if (!fromLocation) {
      newErrors.from = 'Please select a starting point';
    }
    
    if (!toLocation) {
      newErrors.to = 'Please select a destination';
    }
    
    if (fromLocation && toLocation && fromLocation === toLocation) {
      newErrors.to = 'Destination must be different from starting point';
    }
    
    // If there are errors, show them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    
    // Clear any previous errors
    setError({});
    
    // Show loading state
    setLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      
      // Navigate to search results screen with parameters
      router.push({
        pathname: '/search-results',
        params: { from: fromLocation, to: toLocation }
      });
    }, 800); // Simulate network delay
  };

  const handleRecentSearchPress = (from: string, to: string) => {
    setFromLocation(from);
    setToLocation(to);
    setError({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Bus size={28} color={COLORS.primary[500]} style={styles.logoIcon} />
              <Text style={styles.logoText}>SriLanka Bus</Text>
            </View>
          </View>
          
          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Find Your Bus</Text>
            <Text style={styles.subtitle}>Select your route to discover available buses</Text>
            
            {/* Search Form */}
            <View style={styles.formContainer}>
              <View style={styles.locationContainer}>
                <View style={styles.locationPickerWrapper}>
                  <LocationPicker
                    label="From"
                    value={fromLocation}
                    locations={locations}
                    onChange={setFromLocation}
                    placeholder="Select starting point"
                    error={error.from}
                  />
                </View>
                
                <LocationSwapButton
                  onPress={handleLocationSwap}
                  style={styles.swapButton}
                />
                
                <View style={styles.locationPickerWrapper}>
                  <LocationPicker
                    label="To"
                    value={toLocation}
                    locations={locations}
                    onChange={setToLocation}
                    placeholder="Select destination"
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
            
            {/* Recent Searches Section */}
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <RecentSearchCard
                    key={`recent-${index}`}
                    from={search.from}
                    to={search.to}
                    date={search.date}
                    onPress={() => handleRecentSearchPress(search.from, search.to)}
                  />
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Info size={24} color={COLORS.neutral[400]} />
                  <Text style={styles.emptyStateText}>
                    Your recent searches will appear here
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.white,
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
    color: COLORS.primary[500],
  },
  content: {
    flex: 1,
    padding: SIZES.m,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: COLORS.neutral[800],
    marginTop: SIZES.s,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[600],
    marginTop: SIZES.xs,
    marginBottom: SIZES.l,
  },
  formContainer: {
    backgroundColor: COLORS.white,
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
  recentSearchesContainer: {
    marginTop: SIZES.m,
  },
  sectionTitle: {
    fontFamily: FONT.medium,
    fontSize: 18,
    color: COLORS.neutral[700],
    marginBottom: SIZES.m,
  },
  emptyStateContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: SIZES.s,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SIZES.s,
  },
});