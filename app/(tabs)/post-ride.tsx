import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useRidesStore } from '@/stores/ridesStore';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { Location as LocationType } from '@/types/database';

export default function PostRideScreen() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const createRide = useRidesStore(state => state.createRide);
  const router = useRouter();

  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [destination, setDestination] = useState<LocationType | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [taxiPreference, setTaxiPreference] = useState<string>('');
  const [selectingLocation, setSelectingLocation] = useState<'start' | 'destination' | null>(null);
  const [loading, setLoading] = useState(false);

  const taxiOptions = [
    'GetTaxi / Gett',
    'Have driver number',
    'Will decide together',
    'Other',
  ];

  useEffect(() => {
    // Set default start location to user's profile location
    if (profile?.location) {
      setStartLocation(profile.location);
    } else {
      getCurrentLocation();
    }

    // Set default date and time
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  }, [profile]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

      setStartLocation({
        latitude,
        longitude,
        address: `${address.street || ''}, ${address.city || ''}, ${address.country || ''}`,
        city: address.city || undefined,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleMapPress = async (coordinate: { latitude: number; longitude: number }) => {
    try {
      const [address] = await Location.reverseGeocodeAsync(coordinate);
      const location: LocationType = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: `${address.street || ''}, ${address.city || ''}, ${address.country || ''}`,
        city: address.city || undefined,
      };

      if (selectingLocation === 'start') {
        setStartLocation(location);
      } else if (selectingLocation === 'destination') {
        setDestination(location);
      }
      
      setSelectingLocation(null);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handlePostRide = async () => {
    if (!user || !startLocation || !destination || !date || !time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { data, error } = await createRide({
      user_id: user.id,
      start_location: startLocation,
      destination: destination,
      date: date,
      time: time,
      status: 'active',
      taxi_preference: taxiPreference || null,
      max_passengers: 3,
      description: description || null,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Ride posted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setDestination(null);
            setDescription('');
            setTaxiPreference('');
            router.push('/(tabs)');
          },
        },
      ]);
    }
  };

  const mapRegion = startLocation
    ? {
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : undefined;

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Post a Ride</Text>
          <Text style={styles.subtitle}>Share your trip and split the cost</Text>
        </View>

        <View style={styles.content}>
          {/* Start Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Start Location *</Text>
            {startLocation ? (
              <View style={styles.locationDisplay}>
                <Text style={styles.locationText}>{startLocation.city}</Text>
                <Text style={styles.locationSubtext} numberOfLines={2}>
                  {startLocation.address}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationSubtext}>No location set</Text>
            )}
            <TouchableOpacity
              style={commonStyles.secondaryButton}
              onPress={() => setSelectingLocation('start')}
              disabled={loading}
            >
              <Text style={commonStyles.secondaryButtonText}>
                {selectingLocation === 'start' ? 'Tap on Map' : 'Change Location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Destination */}
          <View style={styles.section}>
            <Text style={styles.label}>Destination *</Text>
            {destination ? (
              <View style={styles.locationDisplay}>
                <Text style={styles.locationText}>{destination.city}</Text>
                <Text style={styles.locationSubtext} numberOfLines={2}>
                  {destination.address}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationSubtext}>Tap map to select destination</Text>
            )}
            <TouchableOpacity
              style={commonStyles.secondaryButton}
              onPress={() => setSelectingLocation('destination')}
              disabled={loading}
            >
              <Text style={commonStyles.secondaryButtonText}>
                {selectingLocation === 'destination' ? 'Tap on Map' : 'Set Destination'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          {mapRegion && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={mapRegion}
                onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
              >
                {startLocation && (
                  <Marker
                    coordinate={{
                      latitude: startLocation.latitude,
                      longitude: startLocation.longitude,
                    }}
                    title="Start"
                    pinColor={colors.primary}
                  />
                )}
                {destination && (
                  <Marker
                    coordinate={{
                      latitude: destination.latitude,
                      longitude: destination.longitude,
                    }}
                    title="Destination"
                    pinColor={colors.yellow}
                  />
                )}
              </MapView>
            </View>
          )}

          {/* Date & Time */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                editable={!loading}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
                editable={!loading}
              />
            </View>
          </View>

          {/* Taxi Preference */}
          <View style={styles.section}>
            <Text style={styles.label}>How will you get a taxi?</Text>
            <View style={styles.optionsGrid}>
              {taxiOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    taxiPreference === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => setTaxiPreference(option)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      taxiPreference === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any additional details about your ride..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.postButton]}
            onPress={handlePostRide}
            disabled={loading || !startLocation || !destination}
          >
            <Text style={commonStyles.buttonText}>
              {loading ? 'Posting...' : 'Post Ride'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.xxxl * 2,
  },
  header: {
    padding: spacing.xxl,
    paddingTop: spacing.xxxl * 2,
  },
  title: {
    fontSize: fontSize.xxxl + 8,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  locationDisplay: {
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  locationSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mapContainer: {
    height: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
    gap: spacing.sm,
  },
  input: {
    marginTop: 0,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonSelected: {
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
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  postButton: {
    marginTop: spacing.lg,
  },
});

