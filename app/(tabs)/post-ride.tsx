import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useRidesStore } from '@/stores/ridesStore';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { TEL_AVIV_CITIES, TAXI_OPTIONS, PAYMENT_OPTIONS, EVENT_TYPES, City } from '@/constants/cities';
import { Location as LocationType } from '@/types/database';

type Step = 'type' | 'locations' | 'datetime' | 'details' | 'review';

export default function PostRideScreen() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const createRide = useRidesStore(state => state.createRide);
  const router = useRouter();

  // Form state
  const [step, setStep] = useState<Step>('type');
  const [isEvent, setIsEvent] = useState(false);
  const [eventType, setEventType] = useState('');
  const [eventName, setEventName] = useState('');
  const [startCity, setStartCity] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [taxiPreference, setTaxiPreference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showCityPicker, setShowCityPicker] = useState<'start' | 'destination' | null>(null);
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    if (profile?.location?.cityId) {
      const city = TEL_AVIV_CITIES.find(c => c.id === profile.location.cityId);
      if (city) setStartCity(city);
    } else {
      setStartCity(TEL_AVIV_CITIES[0]);
    }
  }, [profile]);

  const filteredCities = citySearch
    ? TEL_AVIV_CITIES.filter(city =>
        city.name.toLowerCase().includes(citySearch.toLowerCase())
      )
    : TEL_AVIV_CITIES;

  const handleNext = () => {
    if (step === 'type') {
      if (isEvent && !eventType) {
        Alert.alert('Select Event Type', 'Please choose what kind of event this is');
        return;
      }
      setStep('locations');
    } else if (step === 'locations') {
      if (!startCity || !destination) {
        Alert.alert('Select Locations', 'Please choose both start and destination');
        return;
      }
      setStep('datetime');
    } else if (step === 'datetime') {
      setStep('details');
    } else if (step === 'details') {
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'locations') setStep('type');
    else if (step === 'datetime') setStep('locations');
    else if (step === 'details') setStep('datetime');
    else if (step === 'review') setStep('details');
  };

  const handlePost = async () => {
    if (!user || !startCity || !destination) return;

    setLoading(true);

    const startLocation: LocationType = {
      latitude: startCity.latitude,
      longitude: startCity.longitude,
      city: startCity.name,
      cityId: startCity.id,
      address: startCity.name,
    };

    const destinationLocation: LocationType = {
      latitude: destination.latitude,
      longitude: destination.longitude,
      city: destination.name,
      cityId: destination.id,
      address: destination.name,
    };

    const dateStr = date.toISOString().split('T')[0];
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

    const { error } = await createRide({
      user_id: user.id,
      start_location: startLocation,
      destination: destinationLocation,
      date: dateStr,
      time: timeStr,
      status: 'active',
      taxi_preference: taxiPreference || null,
      payment_method: paymentMethod || null,
      max_passengers: 3,
      description: description || null,
      event_type: isEvent ? eventType : null,
      event_name: isEvent && eventName ? eventName : null,
      is_event: isEvent,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Posted!', 'Your ride is now live', [
        {
          text: 'OK',
          onPress: () => {
            setStep('type');
            setIsEvent(false);
            setEventType('');
            setEventName('');
            setDestination(null);
            setDescription('');
            setTaxiPreference('');
            setPaymentMethod('');
            router.push('/(tabs)');
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, step !== 'type' && styles.progressStepComplete]} />
        <View style={[styles.progressStep, ['datetime', 'details', 'review'].includes(step) && styles.progressStepComplete]} />
        <View style={[styles.progressStep, ['details', 'review'].includes(step) && styles.progressStepComplete]} />
        <View style={[styles.progressStep, step === 'review' && styles.progressStepComplete]} />
      </View>

      {/* Step 1: Type */}
      {step === 'type' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>What are you sharing?</Text>
          
          <TouchableOpacity
            style={[styles.typeCard, !isEvent && styles.typeCardSelected]}
            onPress={() => setIsEvent(false)}
          >
            <Ionicons name="car" size={32} color={!isEvent ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeTitle, !isEvent && styles.typeTitleSelected]}>Regular Ride</Text>
            <Text style={styles.typeSubtitle}>Going somewhere? Share the ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeCard, isEvent && styles.typeCardSelected]}
            onPress={() => setIsEvent(true)}
          >
            <Ionicons name="star" size={32} color={isEvent ? colors.yellow : colors.textSecondary} />
            <Text style={[styles.typeTitle, isEvent && styles.typeTitleSelected]}>Event</Text>
            <Text style={styles.typeSubtitle}>Concert, game, party, etc.</Text>
          </TouchableOpacity>

          {isEvent && (
            <View style={styles.eventTypes}>
              {EVENT_TYPES.slice(0, 6).map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.eventChip, eventType === type.id && styles.eventChipSelected]}
                  onPress={() => setEventType(type.id)}
                >
                  <Text style={styles.eventEmoji}>{type.emoji}</Text>
                  <Text style={styles.eventLabel}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isEvent && eventType && (
            <TextInput
              style={styles.eventNameInput}
              value={eventName}
              onChangeText={setEventName}
              placeholder="Event name (e.g., 'Coldplay Concert')"
              placeholderTextColor={colors.textMuted}
            />
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Locations */}
      {step === 'locations' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Where are you going?</Text>

          <View style={styles.locationSection}>
            <Text style={styles.label}>From</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowCityPicker('start')}
            >
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.locationText}>
                {startCity?.name || 'Select start'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.label}>To</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowCityPicker('destination')}
            >
              <Ionicons name="flag" size={20} color={colors.yellow} />
              <Text style={styles.locationText}>
                {destination?.name || 'Select destination'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Date & Time */}
      {step === 'datetime' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>When?</Text>

          <View style={styles.dateTimeSection}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeSection}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 4: Details */}
      {step === 'details' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Details</Text>

          <View style={styles.optionsSection}>
            <Text style={styles.label}>Taxi</Text>
            <View style={styles.optionsGrid}>
              {TAXI_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionChip, taxiPreference === option && styles.optionChipSelected]}
                  onPress={() => setTaxiPreference(option)}
                >
                  <Text style={[styles.optionText, taxiPreference === option && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionsSection}>
            <Text style={styles.label}>Payment</Text>
            <View style={styles.optionsGrid}>
              {PAYMENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionChip, paymentMethod === option && styles.optionChipSelected]}
                  onPress={() => setPaymentMethod(option)}
                >
                  <Text style={[styles.optionText, paymentMethod === option && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Review</Text>
              <Ionicons name="checkmark" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 5: Review */}
      {step === 'review' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Review & Post</Text>

          <View style={styles.reviewCard}>
            {isEvent && eventName && (
              <Text style={styles.reviewEventName}>{eventName}</Text>
            )}
            <View style={styles.reviewRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.reviewText}>{startCity?.name}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Ionicons name="arrow-forward" size={16} color={colors.yellow} />
              <Text style={styles.reviewText}>{destination?.name}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.reviewText}>
                {date.toLocaleDateString()} at {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {taxiPreference && (
              <View style={styles.reviewRow}>
                <Ionicons name="car" size={16} color={colors.textSecondary} />
                <Text style={styles.reviewText}>{taxiPreference}</Text>
              </View>
            )}
            {paymentMethod && (
              <View style={styles.reviewRow}>
                <Ionicons name="card" size={16} color={colors.textSecondary} />
                <Text style={styles.reviewText}>{paymentMethod}</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.postButton, loading && styles.postButtonDisabled]} 
              onPress={handlePost}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.background} />
              <Text style={styles.postButtonText}>{loading ? 'Posting...' : 'Post Ride'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showCityPicker === 'start' ? 'Select Start' : 'Select Destination'}
            </Text>
            <TouchableOpacity onPress={() => setShowCityPicker(null)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            value={citySearch}
            onChangeText={setCitySearch}
            placeholder="Search locations..."
            placeholderTextColor={colors.textMuted}
            autoFocus
          />

          <ScrollView style={styles.cityList}>
            {filteredCities.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={styles.cityItem}
                onPress={() => {
                  if (showCityPicker === 'start') {
                    setStartCity(city);
                  } else {
                    setDestination(city);
                  }
                  setShowCityPicker(null);
                  setCitySearch('');
                }}
              >
                <Ionicons 
                  name={city.type === 'venue' ? 'business' : 'location'} 
                  size={20} 
                  color={colors.primary} 
                />
                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{city.name}</Text>
                  <Text style={styles.cityType}>{city.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl * 2,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressStepComplete: {
    backgroundColor: colors.primary,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxxl,
  },
  stepTitle: {
    fontSize: fontSize.xxxl + 4,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  typeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: colors.primary,
  },
  typeTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  typeTitleSelected: {
    color: colors.text,
  },
  typeSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  eventTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 2,
    borderColor: colors.border,
  },
  eventChipSelected: {
    borderColor: colors.yellow,
    backgroundColor: colors.yellow + '20',
  },
  eventEmoji: {
    fontSize: fontSize.md,
  },
  eventLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '600',
  },
  eventNameInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
  },
  locationSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  locationText: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  dateTimeSection: {
    marginBottom: spacing.lg,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  dateTimeText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  optionsSection: {
    marginBottom: spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  optionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  reviewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  reviewEventName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.yellow,
    marginBottom: spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
  },
  nextButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.background,
  },
  postButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xxxl + spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  searchInput: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.xxl,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  cityList: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  cityType: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
