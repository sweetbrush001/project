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
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Package, Scale, Type, Phone, User, CreditCard } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS } from '../../constants/theme';
import LocationPicker from '../../components/LocationPicker';
import SearchButton from '../../components/SearchButton';
import LocationSwapButton from '../../components/LocationSwapButton';
import { getPopularLocations, getAllLocations } from '../../services/busService';

type ParcelType = 'document' | 'package' | 'fragile' | 'food' | 'electronics' | 'clothing' | 'medicine' | 'other';

export default function SendParcelScreen() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [parcelName, setParcelName] = useState('');
  const [parcelWeight, setParcelWeight] = useState('');
  const [receiverContact, setReceiverContact] = useState('');
  const [senderNic, setSenderNic] = useState('');
  const [receiverNic, setReceiverNic] = useState('');
  const [parcelType, setParcelType] = useState<ParcelType>('package');
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    from?: string;
    to?: string;
    name?: string;
    weight?: string;
    receiverContact?: string;
    senderNic?: string;
    receiverNic?: string;
  }>({});

  const parcelTypes: ParcelType[] = [
    'document',
    'package',
    'fragile',
    'food',
    'electronics',
    'clothing',
    'medicine',
    'other'
  ];

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

  const handleSearchPress = () => {
    const newErrors: typeof error = {};
    if (!fromLocation) newErrors.from = 'Please select pickup location';
    if (!toLocation) newErrors.to = 'Please select delivery location';
    if (fromLocation === toLocation) newErrors.to = 'Pickup and delivery cannot be the same';
    if (!parcelName.trim()) newErrors.name = 'Please enter parcel name';
    if (!parcelWeight.trim()) newErrors.weight = 'Please enter parcel weight';
    if (!receiverContact.trim()) newErrors.receiverContact = 'Please enter receiver contact';
    if (!senderNic.trim()) newErrors.senderNic = 'Please enter your NIC number';
    if (!receiverNic.trim()) newErrors.receiverNic = 'Please enter receiver NIC number';

    // Validate contact number format (basic validation)
    if (receiverContact.trim() && !/^\d{10}$/.test(receiverContact)) {
      newErrors.receiverContact = 'Please enter a valid 10-digit phone number';
    }

    // Validate NIC format (basic validation for Sri Lankan NIC)
    if (senderNic.trim() && !/^(\d{9}[Vv]|\d{12})$/.test(senderNic)) {
      newErrors.senderNic = 'Please enter a valid NIC number';
    }

    if (receiverNic.trim() && !/^(\d{9}[Vv]|\d{12})$/.test(receiverNic)) {
      newErrors.receiverNic = 'Please enter a valid NIC number';
    }

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
        params: {
          from: fromLocation,
          to: toLocation,
          name: parcelName,
          weight: parcelWeight,
          type: parcelType,
          receiverContact: receiverContact,
          senderNic: senderNic,
          receiverNic: receiverNic
        },
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
              <Text style={styles.logoText}>Send Parcel</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>Beta</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Send a Parcel</Text>
            <Text style={styles.subtitle}>Send Parcels Using Local Buses</Text>
            <Text></Text>

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



              //************************************ */

              {/* Parcel Details Section */}
              <View style={styles.parcelDetailsContainer}>
                <Text style={styles.sectionTitle}>Parcel Details</Text>

                {/* Parcel Name */}
                <View style={styles.inputContainer}>
                  <Package size={20} color={BROWN.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Parcel name (e.g., Birthday Gift)"
                    value={parcelName}
                    onChangeText={setParcelName}
                    placeholderTextColor={BROWN.textSecondary}
                  />
                </View>
                {error.name && <Text style={styles.errorText}>{error.name}</Text>}

                {/* Parcel Weight */}
                <View style={styles.inputContainer}>
                  <Scale size={20} color={BROWN.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Weight (kg)"
                    value={parcelWeight}
                    onChangeText={setParcelWeight}
                    keyboardType="numeric"
                    placeholderTextColor={BROWN.textSecondary}
                  />
                </View>
                {error.weight && <Text style={styles.errorText}>{error.weight}</Text>}

                {/* Parcel Type */}
                <View style={styles.typeContainer}>
                  <Type size={20} color={BROWN.primary} style={styles.inputIcon} />
                  <Text style={styles.typeLabel}>Type:</Text>
                  <View style={styles.typeOptions}>
                    {parcelTypes.map((type) => (
                      <Text
                        key={type}
                        style={[
                          styles.typeOption,
                          parcelType === type && styles.typeOptionSelected,
                        ]}
                        onPress={() => setParcelType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {/* Contact Information Section */}
              <View style={styles.contactDetailsContainer}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                {/* Receiver Contact */}
                <View style={styles.inputContainer}>
                  <Phone size={20} color={BROWN.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Receiver Contact Number (07XXXXXXXX)"
                    value={receiverContact}
                    onChangeText={setReceiverContact}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={BROWN.textSecondary}
                  />
                </View>
                {error.receiverContact && <Text style={styles.errorText}>{error.receiverContact}</Text>}

                {/* Sender NIC */}
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color={BROWN.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your NIC Number"
                    value={senderNic}
                    onChangeText={setSenderNic}
                    placeholderTextColor={BROWN.textSecondary}
                  />
                </View>
                {error.senderNic && <Text style={styles.errorText}>{error.senderNic}</Text>}

                {/* Receiver NIC */}
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color={BROWN.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Receiver NIC Number"
                    value={receiverNic}
                    onChangeText={setReceiverNic}
                    placeholderTextColor={BROWN.textSecondary}
                  />
                </View>
                {error.receiverNic && <Text style={styles.errorText}>{error.receiverNic}</Text>}
              </View>

              <SearchButton
                onPress={handleSearchPress}
                isLoading={loading}
                disabled={!fromLocation || !toLocation || !parcelName || !parcelWeight || !receiverContact || !senderNic || !receiverNic}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BROWN = {
  background: '#ffff',
  card: '#F4E2D8',
  primary: '#A47148',
  textPrimary: '#3E2C1C',
  textSecondary: '#6F4E37',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BROWN.background,
    marginTop: 30,
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
  // New styles for parcel details
  parcelDetailsContainer: {
    marginTop: SIZES.l,
    borderTopWidth: 1,
    borderTopColor: '#E8D5C0',
    paddingTop: SIZES.m,
  },
  contactDetailsContainer: {
    marginTop: SIZES.l,
    borderTopWidth: 1,
    borderTopColor: '#E8D5C0',
    paddingTop: SIZES.m,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: BROWN.textPrimary,
    marginBottom: SIZES.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: SIZES.s,
    paddingHorizontal: SIZES.m,
    paddingVertical: SIZES.s,
    marginBottom: SIZES.s,
    ...SHADOWS.xxs,
  },
  inputIcon: {
    marginRight: SIZES.s,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: BROWN.textPrimary,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.m,
  },
  typeLabel: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: BROWN.textPrimary,
    marginLeft: SIZES.s,
    marginRight: SIZES.m,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: SIZES.xs,
  },
  typeOption: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: BROWN.textPrimary,
    backgroundColor: '#E8D5C0',
    paddingHorizontal: SIZES.m,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
  },
  typeOptionSelected: {
    backgroundColor: BROWN.primary,
    color: '#FFF',
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#D32F2F',
    marginBottom: SIZES.s,
    marginLeft: SIZES.xs,
  },
});