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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Bus, Clock, MapPin, TriangleAlert as AlertTriangle, Star } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS } from '../constants/theme';
import { searchBusSchedules, type BusSchedule } from '../services/busService';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  Layout
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

  const retrySearch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!from || !to) {
        setError('Missing route information. Please go back and try again.');
        return;
      }
      const results = await searchBusSchedules(from, to);
      if (results.length === 0) {
        const fromVariations = [from, `${from} Fort`, from.replace(' Fort', '')];
        const toVariations = [to, `${to} Fort`, to.replace(' Fort', '')];
        let found = false;
        for (const fromVar of fromVariations) {
          for (const toVar of toVariations) {
            if (fromVar !== from || toVar !== to) {
              const altResults = await searchBusSchedules(fromVar, toVar);
              if (altResults.length > 0) {
                setSchedules(altResults);
                found = true;
                break;
              }
            }
          }
          if (found) break;
        }
        if (!found) {
          setError(`No bus schedules found from ${from} to ${to}. Please try different locations.`);
        }
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

  const renderBusSchedule = ({ item, index }: { item: BusSchedule; index: number }) => {
    const journeyTime = calculateJourneyTime(item.departure_time_origin, item.arrival_time_destination);
    const estimatedPrice = estimatePrice(item.operator_type, item.departure_time_origin, item.arrival_time_destination);

    return (
      <Animated.View 
        entering={SlideInRight.delay(index * 100).springify()} 
        layout={Layout.springify()}
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
              <MapPin size={14} color={COLORS.neutral[600]} />
              <Text style={styles.stopsLabel}>Via: </Text>
              <Text style={styles.stopsText}>
                {item.stops.map(stop => stop.name).join(', ')}
              </Text>
            </View>
          )}
          
          <View style={styles.priceSection}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Estimated Price</Text>
              <Text style={styles.priceText}>LKR {estimatedPrice}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={14} color={COLORS.accent[500]} fill={COLORS.accent[500]} />
              <Text style={styles.ratingText}>4.2</Text>
            </View>
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
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <AlertTriangle size={48} color={COLORS.neutral[400]} />
      <Text style={styles.emptyTitle}>No Schedules Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any bus schedules from {from} to {to}. Try different locations or check your spelling.
      </Text>
      <TouchableOpacity 
        style={styles.tryAgainButton}
        onPress={() => router.back()}
      >
        <Text style={styles.tryAgainButtonText}>Try Different Route</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Enhanced Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.neutral[700]} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bus Schedules</Text>
          <Text style={styles.headerSubtitle}>
            {from} → {to}
          </Text>
        </View>
      </Animated.View>

      {/* Results */}
      {loading ? (
        <Animated.View entering={FadeIn} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Finding the best schedules for you...</Text>
        </Animated.View>
      ) : error ? (
        <Animated.View entering={FadeIn} style={styles.errorContainer}>
          <AlertTriangle size={48} color={COLORS.error[500]} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retrySearch}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : schedules.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.resultsContainer}>
          <Animated.Text entering={FadeIn.delay(200)} style={styles.resultsHeader}>
            Found {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
          </Animated.Text>
          
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
    paddingHorizontal: SIZES.m,
    paddingVertical: SIZES.s,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.xs,
    marginRight: SIZES.s,
    borderRadius: SIZES.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: COLORS.neutral[800],
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.l,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: SIZES.m,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.l,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: COLORS.error[500],
    textAlign: 'center',
    marginTop: SIZES.m,
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: SIZES.s,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SIZES.l,
    paddingVertical: SIZES.s,
    borderRadius: SIZES.s,
    marginTop: SIZES.m,
    ...SHADOWS.small,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.l,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: FONT.bold,
    color: COLORS.neutral[700],
    marginTop: SIZES.m,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SIZES.s,
    lineHeight: 24,
    paddingHorizontal: SIZES.m,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SIZES.l,
    paddingVertical: SIZES.s,
    borderRadius: SIZES.s,
    marginTop: SIZES.l,
    ...SHADOWS.small,
  },
  tryAgainButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.medium,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: SIZES.m,
  },
  resultsHeader: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.neutral[700],
    marginVertical: SIZES.m,
  },
  listContainer: {
    paddingBottom: SIZES.l,
  },
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.m,
    padding: SIZES.m,
    marginBottom: SIZES.m,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.m,
  },
  busNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SIZES.s,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.s,
    ...SHADOWS.small,
  },
  busNumber: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.bold,
    marginLeft: SIZES.xs,
  },
  operatorTag: {
    paddingHorizontal: SIZES.s,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    ...SHADOWS.small,
  },
  operatorText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONT.medium,
  },
  scheduleDetails: {
    marginBottom: SIZES.m,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.s,
  },
  timePoint: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: COLORS.neutral[800],
  },
  terminalText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  journeyInfo: {
    alignItems: 'center',
    marginHorizontal: SIZES.m,
  },
  journeyLine: {
    width: 3,
    height: 30,
    backgroundColor: COLORS.primary[300],
    borderRadius: 2,
  },
  journeyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  journeyTimeText: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: COLORS.neutral[600],
    marginLeft: 4,
  },
  stopsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.s,
    backgroundColor: COLORS.neutral[50],
    padding: SIZES.s,
    borderRadius: SIZES.xs,
  },
  stopsLabel: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.neutral[600],
    marginLeft: 4,
    marginRight: 4,
  },
  stopsText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.neutral[500],
    flex: 1,
    lineHeight: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    padding: SIZES.s,
    borderRadius: SIZES.s,
    marginTop: SIZES.s,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.neutral[600],
  },
  priceText: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: COLORS.secondary[600],
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.s,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.neutral[700],
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SIZES.s,
    paddingHorizontal: SIZES.l,
    borderRadius: SIZES.s,
    alignItems: 'center',
    marginTop: SIZES.m,
    ...SHADOWS.small,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.medium,
  },
});
