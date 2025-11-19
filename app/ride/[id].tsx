import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Ride } from '@/types/database';
import { colors } from '@/constants/colors';
import { spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatDate, formatTime } from '@/lib/format';
import { calculateMeetingPoint, formatDistance, calculateDistance } from '@/lib/midpoint';
import { EVENT_TYPES } from '@/constants/cities';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRide();
    }
  }, [id]);

  const loadRide = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRide(data);
    } catch (error) {
      console.error('Error loading ride:', error);
      Alert.alert('Error', 'Failed to load ride');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (ride) {
      router.push(`/chat/${ride.id}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Ride not found</Text>
      </View>
    );
  }

  const isOwner = user?.id === ride.user_id;
  const eventType = ride.event_type ? EVENT_TYPES.find(t => t.id === ride.event_type) : null;
  
  // Calculate meeting point
  const meetingPoint = profile?.location 
    ? calculateMeetingPoint(ride.start_location, profile.location)
    : null;
  
  const distanceToStart = profile?.location
    ? calculateDistance(profile.location, ride.start_location)
    : null;

  const distanceToMeeting = meetingPoint && profile?.location
    ? calculateDistance(profile.location, meetingPoint)
    : null;

  const mapRegion = meetingPoint ? {
    latitude: (ride.start_location.latitude + ride.destination.latitude + meetingPoint.latitude) / 3,
    longitude: (ride.start_location.longitude + ride.destination.longitude + meetingPoint.longitude) / 3,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  } : {
    latitude: ride.start_location.latitude,
    longitude: ride.start_location.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Map - Full height */}
      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={mapRegion}>
          {/* Start Marker */}
          <Marker
            coordinate={{
              latitude: ride.start_location.latitude,
              longitude: ride.start_location.longitude,
            }}
            title="Start"
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, styles.startMarker]}>
                <Ionicons name="location" size={20} color={colors.background} />
              </View>
            </View>
          </Marker>
          
          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: ride.destination.latitude,
              longitude: ride.destination.longitude,
            }}
            title="Destination"
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, styles.destinationMarker]}>
                <Ionicons name="flag" size={20} color={colors.background} />
              </View>
            </View>
          </Marker>

          {/* Meeting Point Marker */}
          {meetingPoint && !isOwner && (
            <Marker
              coordinate={{
                latitude: meetingPoint.latitude,
                longitude: meetingPoint.longitude,
              }}
              title="Meeting Point"
            >
              <View style={styles.markerContainer}>
                <View style={[styles.marker, styles.meetingMarker]}>
                  <Ionicons name="people" size={20} color={colors.background} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Meeting Point Overlay */}
        {!isOwner && meetingPoint && distanceToMeeting !== null && (
          <View style={styles.meetingOverlay}>
            <View style={styles.meetingContent}>
              <Ionicons name="people" size={20} color={colors.green} />
              <View style={styles.meetingText}>
                <Text style={styles.meetingTitle}>Meeting Point</Text>
                <Text style={styles.meetingDistance}>{formatDistance(distanceToMeeting)} from you</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Info Panel - Bottom Sheet */}
      <View style={styles.infoPanel}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Event Name */}
        {ride.is_event && ride.event_name && (
          <Text style={styles.eventNameLarge}>{ride.event_name}</Text>
        )}

        {/* Route */}
        <View style={styles.routeInfo}>
          <View style={styles.routeItem}>
            <Ionicons name="ellipse" size={10} color={colors.primary} />
            <Text style={styles.routeCity}>{ride.start_location.city}</Text>
          </View>
          <Ionicons name="arrow-down" size={16} color={colors.yellow} style={{ marginLeft: spacing.xs }} />
          <View style={styles.routeItem}>
            <Ionicons name="ellipse" size={10} color={colors.yellow} />
            <Text style={styles.routeCity}>{ride.destination.city}</Text>
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={18} color={colors.text} />
            <Text style={styles.infoText}>{formatDate(ride.date)}</Text>
            <Text style={styles.infoText}>•</Text>
            <Text style={styles.infoText}>{formatTime(ride.time)}</Text>
          </View>

          {ride.taxi_preference && (
            <View style={styles.infoItem}>
              <Ionicons name="car" size={18} color={colors.text} />
              <Text style={styles.infoText}>{ride.taxi_preference}</Text>
            </View>
          )}

          {ride.payment_method && (
            <View style={styles.infoItem}>
              <Ionicons name="card" size={18} color={colors.text} />
              <Text style={styles.infoText}>{ride.payment_method}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {ride.description && (
          <Text style={styles.description}>{ride.description}</Text>
        )}

        {/* Poster */}
        {ride.profile && (
          <View style={styles.posterInfo}>
            <Text style={styles.posterLabel}>Posted by</Text>
            <Text style={styles.posterName}>{ride.profile.display_name}</Text>
          </View>
        )}

        {/* Chat Button */}
        {!isOwner && (
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Ionicons name="chatbubble" size={22} color={colors.background} />
            <Text style={styles.chatButtonText}>
              Chat with {ride.profile?.display_name?.split(' ')[0] || 'rider'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  header: {
    position: 'absolute',
    top: spacing.xxxl + spacing.lg,
    left: spacing.xl,
    zIndex: 10,
    backgroundColor: colors.background + 'E6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  startMarker: {
    backgroundColor: colors.primary,
  },
  destinationMarker: {
    backgroundColor: colors.yellow,
  },
  meetingMarker: {
    backgroundColor: colors.green,
  },
  meetingOverlay: {
    position: 'absolute',
    top: spacing.xxxl * 2,
    left: spacing.md,
    right: spacing.md,
  },
  meetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background + 'F2',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.green + '60',
  },
  meetingText: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  meetingDistance: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  infoPanel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl + 8,
    borderTopRightRadius: borderRadius.xxl + 8,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '60%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  eventNameLarge: {
    fontSize: fontSize.xxl + 4,
    fontWeight: '700',
    color: colors.yellow,
    marginBottom: spacing.md,
  },
  routeInfo: {
    marginBottom: spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  routeCity: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  quickInfo: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  posterLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  posterName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
  },
  chatButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.background,
  },
});
