import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Bus, Clock, MapPin, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS, globalStyles } from '../constants/theme';
import { searchBusSchedules, type BusSchedule } from '../services/busService';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight
} from 'react-native-reanimated';

export default function SearchResultsScreen() {
  const { from, to } = useLocalSearchParams<{ from: string; to: string }>();
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!from || !to) {
          setError('Missing route information. Please go back and try again.');
          return;
        }

        // Search for bus schedules using Firestore
        const results = await searchBusSchedules(from, to);
        
        if (results.length === 0) {
          // Try searching with common terminal variations
          const fromVariations = [from, `${from} Fort`, from.replace(' Fort', '')];
          const toVariations = [to, `${to} Fort`, to.replace(' Fort', '')];
          
          for (const fromVar of fromVariations) {
            for (const toVar of toVariations) {
              if (fromVar !== from || toVar !== to) {
                const altResults = await searchBusSchedules(fromVar, toVar);
                if (altResults.length > 0) {
                  setSchedules(altResults);
                  return;
                }
              }
            }
          }
          
          setError(`No bus schedules found from ${from} to ${to}. Please try different locations.`);
        } else {
          setSchedules(results);
        }
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to fetch bus schedules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [from, to]);

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const calculateJourneyTime = (departure: string, arrival: string) => {
    const [depHours, depMinutes] = departure.split(':').map(Number);
    const [arrHours, arrMinutes] = arrival.split(':').map(Number);
    
    let journeyMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    
    // Handle overnight journeys
    if (journeyMinutes < 0) {
      journeyMinutes += 24 * 60;
    }
    
    const hours = Math.floor(journeyMinutes / 60);
        const minutes = journeyMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const estimatePrice = (operatorType: string, departure: string, arrival: string) => {
    const basePrice = operatorType === 'SLTB' ? 300 : 400;
    const [depHours, depMinutes] = departure.split(':').map(Number);
    const [arrHours, arrMinutes] = arrival.split(':').map(Number);
    let journeyMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    if (journeyMinutes < 0) journeyMinutes += 24 * 60;
    
    return Math.round(basePrice + (journeyMinutes / 60) * 50);
  };

  const getBusTypeColor = (operatorType: string) => {
    switch (operatorType.toLowerCase()) {
      case 'sltb':
        return COLORS.primary[500];
      case 'private':
        return COLORS.secondary[500];
      default:
        return COLORS.neutral[700];
    }
  };

  const renderBusSchedule = ({ item, index }: { item: BusSchedule; index: number }) => {
    const journeyTime = calculateJourneyTime(item.departure_time_origin, item.arrival_time_destination);
    const estimatedPrice = estimatePrice(item.operator_type, item.departure_time_origin, item.arrival_time_destination);

    return (
      <Animated.View 
        entering={SlideInRight.delay(index * 100).springify()} 
        style={styles.scheduleCard}
      >
        <View style={styles.scheduleHeader}>
          <View style={styles.busNumberContainer}>
            <Bus size={16} color={COLORS.white} />
            <Text style={styles.busNumber}>{item.trip_id_raw}</Text>
          </View>
          <View 
            style={[
              styles.operatorTag, 
              { backgroundColor: getBusTypeColor(item.operator_type) }
            ]}
          >
            <Text style={styles.operatorText}>{item.operator_type}</Text>
          </View>
        </View>
        
        <View style={styles.scheduleDetails}>
          <View style={styles.timeSection}>
            <View style={styles.timePoint}>
              <Text style={styles.timeText}>{formatTime(item.departure_time_origin)}</Text>
              <Text style={styles.terminalText}>{item.origin_terminal}</Text>
            </View>
            
            <View style={styles.journeyInfo}>
              <View style={styles.journeyLine} />
              <View style={styles.journeyTimeContainer}>
                <Clock size={12} color={COLORS.neutral[500]} />
                <Text style={styles.journeyTimeText}>{journeyTime}</Text>
              </View>
            </View>
            
            <View style={styles.timePoint}>
              <Text style={styles.timeText}>{formatTime(item.arrival_time_destination)}</Text>
              <Text style={styles.terminalText}>{item.destination_terminal}</Text>
            </View>
          </View>
          
          {item.stops && item.stops.length > 0 && (
            <View style={styles.stopsSection}>
              <Text style={styles.stopsLabel}>Via: </Text>
              <Text style={styles.stopsText}>
                {item.stops.map(stop => stop.name).join(', ')}
              </Text>
            </View>
          )}
          
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Estimated Price:</Text>
            <Text style={styles.priceText}>LKR {estimatedPrice}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => {
            // In a real app, this would navigate to booking screen
            alert(`Booking ${item.trip_id_raw} from ${item.origin_terminal} to ${item.destination_terminal}`);
          }}
        >
          <Text style={styles.bookButtonText}>Book Ticket</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AlertTriangle size={48} color={COLORS.neutral[400]} />
      <Text style={styles.emptyTitle}>No Schedules Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any bus schedules from {from} to {to}.
      </Text>
      <TouchableOpacity 
        style={styles.tryAgainButton}
        onPress={() => router.back()}
      >
        <Text style={styles.tryAgainButtonText}>Try Different Route</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.neutral[700]} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search Results</Text>
          <Text style={styles.headerSubtitle}>
            {from} → {to}
          </Text>
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Finding the best schedules for you...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertTriangle size={32} color={COLORS.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Retry the search
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : schedules.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            Found {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
          </Text>
          
          <FlatList
            data={schedules}
            keyExtractor={(item, index) => `${item.trip_id_raw}-${item.departure_time_origin}-${index}`}
            renderItem={renderBusSchedule}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.xSmall,
    marginRight: SIZES.small,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.neutral[800],
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.large,
  },
  loadingText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: SIZES.medium,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.large,
  },
  errorText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.error[600],
    marginTop: SIZES.medium,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.small,
    marginTop: SIZES.medium,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.large,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.neutral[700],
    marginTop: SIZES.medium,
  },
  emptySubtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SIZES.small,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.small,
    marginTop: SIZES.large,
  },
  tryAgainButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: SIZES.medium,
  },
  resultsHeader: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.neutral[700],
    marginVertical: SIZES.medium,
  },
  listContainer: {
    paddingBottom: SIZES.large,
  },
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  busNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall,
    borderRadius: SIZES.xSmall,
  },
  busNumber: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    marginLeft: SIZES.xSmall,
  },
  operatorTag: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall,
    borderRadius: SIZES.xSmall,
  },
  operatorText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
  },
  scheduleDetails: {
    marginBottom: SIZES.medium,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  timePoint: {
    flex: 1,
  },
  timeText: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.neutral[800],
  },
  terminalText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  journeyInfo: {
    alignItems: 'center',
    marginHorizontal: SIZES.medium,
  },
  journeyLine: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.neutral[300],
  },
  journeyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xSmall,
  },
  journeyTimeText: {
    fontSize: SIZES.xSmall,
    fontFamily: FONT.regular,
    color: COLORS.neutral[500],
    marginLeft: 4,
  },
  stopsSection: {
    flexDirection: 'row',
    marginBottom: SIZES.small,
  },
  stopsLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.neutral[600],
  },
  stopsText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.neutral[500],
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
  },
  priceText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.secondary[500],
  },
  bookButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SIZES.small,
    borderRadius: SIZES.small,
    alignItems: 'center',
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
  },
});
