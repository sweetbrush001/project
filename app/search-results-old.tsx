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
import { ArrowLeft, Bus, Clock, DollarSign, TriangleAlert as AlertTriangle } from 'lucide-react-native';
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

  const renderBusRoute = ({ item, index }: { item: BusSchedule; index: number }) => {
    const getBusTypeColor = (operatorType: string) => {
      switch (operatorType.toLowerCase()) {
        case 'sltb':
          return COLORS.primary[500];
        case 'private':
          return COLORS.secondary[500];
        default:
          return COLORS.gray[500];
      }
    };

    const formatTime = (time: string) => {
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    const calculateJourneyTime = () => {
      const [depHours, depMinutes] = item.departure_time_origin.split(':').map(Number);
      const [arrHours, arrMinutes] = item.arrival_time_destination.split(':').map(Number);
      
      let journeyMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
      
      // Handle overnight journeys
      if (journeyMinutes < 0) {
        journeyMinutes += 24 * 60;
      }
      
      const hours = Math.floor(journeyMinutes / 60);
      const minutes = journeyMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    };

    // Estimate price based on operator type and journey time
    const estimatePrice = () => {
      const basePrice = item.operator_type === 'SLTB' ? 300 : 400;
      const [depHours, depMinutes] = item.departure_time_origin.split(':').map(Number);
      const [arrHours, arrMinutes] = item.arrival_time_destination.split(':').map(Number);
      let journeyMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
      if (journeyMinutes < 0) journeyMinutes += 24 * 60;
      
      return Math.round(basePrice + (journeyMinutes / 60) * 50);
    };

    return (
      <Animated.View 
        entering={SlideInRight.delay(index * 100).springify()} 
        style={styles.routeCard}
      >
        <View style={styles.routeHeader}>
          <View style={styles.routeNumberContainer}>
            <Text style={styles.routeNumber}>{item.routeNumber}</Text>
          </View>
          <View 
            style={[
              styles.busTypeTag, 
              { backgroundColor: getBusTypeColor(item.busType) }
            ]}
          >
            <Text style={styles.busTypeText}>{item.busType}</Text>
          </View>
        </View>
        
        <View style={styles.routeDetails}>
          <View style={styles.routeTimings}>
            <Clock size={16} color={COLORS.neutral[600]} style={styles.icon} />
            <Text style={styles.timingText}>
              {item.departureTime} - {item.arrivalTime}
            </Text>
          </View>
          
          <View style={styles.pricingContainer}>
            <DollarSign size={16} color={COLORS.secondary[500]} style={styles.icon} />
            <Text style={styles.priceText}>
              LKR {item.price}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => {
            // In a real app, this would navigate to booking screen
            alert(`Booking ${item.routeNumber} from ${item.from} to ${item.to}`);
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
      <Text style={styles.emptyTitle}>No Routes Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any bus routes from {from} to {to}.
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
        <Text style={styles.headerTitle}>Search Results</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Route Info */}
      <View style={styles.routeInfoContainer}>
        <View style={styles.routeInfoContent}>
          <Text style={styles.routeInfoText}>
            <Text style={styles.routeInfoHighlight}>{from}</Text> to{' '}
            <Text style={styles.routeInfoHighlight}>{to}</Text>
          </Text>
          <Text style={styles.routeInfoDate}>Today</Text>
        </View>
      </View>
      
      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Finding the best routes for you...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertTriangle size={32} color={COLORS.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.tryAgainButton}
            onPress={() => router.back()}
          >
            <Text style={styles.tryAgainButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routes}
          renderItem={renderBusRoute}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.m,
    paddingVertical: SIZES.m,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.xs,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.neutral[800],
  },
  placeholder: {
    width: 24,
  },
  routeInfoContainer: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SIZES.m,
    paddingHorizontal: SIZES.l,
  },
  routeInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeInfoText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.white,
  },
  routeInfoHighlight: {
    fontFamily: FONT.bold,
  },
  routeInfoDate: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  listContainer: {
    padding: SIZES.m,
    paddingBottom: SIZES.xxxl,
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.m,
    padding: SIZES.m,
    marginBottom: SIZES.m,
    ...SHADOWS.medium,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.m,
  },
  routeNumberContainer: {
    backgroundColor: COLORS.primary[50],
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.s,
    borderRadius: SIZES.xs,
  },
  routeNumber: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.primary[700],
  },
  busTypeTag: {
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.s,
    borderRadius: SIZES.xs,
  },
  busTypeText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.white,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.m,
  },
  routeTimings: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SIZES.xs,
  },
  timingText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.secondary[700],
  },
  bookButton: {
    backgroundColor: COLORS.primary[500],
    borderRadius: SIZES.s,
    paddingVertical: SIZES.m,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  bookButtonText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.l,
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.neutral[700],
    marginTop: SIZES.m,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.l,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.error[700],
    marginTop: SIZES.s,
    marginBottom: SIZES.m,
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary[500],
    borderRadius: SIZES.s,
    paddingVertical: SIZES.m,
    paddingHorizontal: SIZES.l,
    marginTop: SIZES.m,
    ...SHADOWS.small,
  },
  tryAgainButtonText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.white,
  },
  emptyContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.neutral[800],
    marginTop: SIZES.m,
    marginBottom: SIZES.s,
  },
  emptySubtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
    marginBottom: SIZES.l,
  },
});