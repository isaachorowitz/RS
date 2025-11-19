import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useAuthStore } from '@/stores/authStore';
import { useRequestsStore } from '@/stores/requestsStore';
import { supabase } from '@/lib/supabase';
import { Ride, RideRequest } from '@/types/database';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatDate, formatTime, formatLocation } from '@/lib/format';
import { calculateMeetingPoint, formatDistance, calculateDistance } from '@/lib/midpoint';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const requests = useRequestsStore(state => state.requests);
  const fetchRideRequests = useRequestsStore(state => state.fetchRideRequests);
  const createRequest = useRequestsStore(state => state.createRequest);
  const updateRequestStatus = useRequestsStore(state => state.updateRequestStatus);
  const subscribeToRideRequests = useRequestsStore(state => state.subscribeToRideRequests);
  const unsubscribeFromRideRequests = useRequestsStore(state => state.unsubscribeFromRideRequests);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [myRequest, setMyRequest] = useState<RideRequest | null>(null);

  useEffect(() => {
    if (id) {
      loadRide();
      fetchRideRequests(id);
      subscribeToRideRequests(id);
    }

    return () => {
      if (id) {
        unsubscribeFromRideRequests(id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (id && requests[id] && user) {
      const userRequest = requests[id].find(r => r.requester_id === user.id);
      setMyRequest(userRequest || null);
    }
  }, [requests, id, user]);

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
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToJoin = async () => {
    if (!user || !ride || !profile?.location) {
      Alert.alert('Error', 'Please set your location in your profile first');
      return;
    }

    setRequesting(true);
    const { error } = await createRequest({
      ride_id: ride.id,
      requester_id: user.id,
      requester_location: profile.location,
      status: 'pending',
      message: null,
    });

    setRequesting(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Request sent! The ride owner will review it.');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const { error } = await updateRequestStatus(requestId, 'approved');
    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Request approved! You can now chat with the requester.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            const { error } = await updateRequestStatus(requestId, 'declined');
            if (error) {
              Alert.alert('Error', error);
            }
          },
        },
      ]
    );
  };

  const handleOpenChat = () => {
    if (ride) {
      router.push(`/chat/${ride.id}`);
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Ride not found</Text>
      </View>
    );
  }

  const isOwner = user?.id === ride.user_id;
  const rideRequests = id ? requests[id] || [] : [];
  const meetingPoint = myRequest?.requester_location
    ? calculateMeetingPoint(ride.start_location, myRequest.requester_location)
    : null;
  
  const distanceToMeeting = meetingPoint && profile?.location
    ? calculateDistance(profile.location, meetingPoint)
    : null;

  const mapRegion = {
    latitude: ride.start_location.latitude,
    longitude: ride.start_location.longitude,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Info */}
        <View style={commonStyles.cardLarge}>
          <View style={styles.route}>
            <Text style={styles.locationLarge}>{formatLocation(ride.start_location)}</Text>
            <Text style={styles.arrowLarge}>→</Text>
            <Text style={styles.locationLarge}>{formatLocation(ride.destination)}</Text>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeBadge}>
              <Text style={styles.dateTimeText}>
                {formatDate(ride.date)} • {formatTime(ride.time)}
              </Text>
            </View>
          </View>

          {ride.taxi_preference && (
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>🚕 Taxi:</Text>
              <Text style={styles.preferenceValue}>{ride.taxi_preference}</Text>
            </View>
          )}

          {ride.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{ride.description}</Text>
            </View>
          )}
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={mapRegion}>
            {/* Start marker */}
            <Marker
              coordinate={{
                latitude: ride.start_location.latitude,
                longitude: ride.start_location.longitude,
              }}
              title="Start"
              description={formatLocation(ride.start_location)}
              pinColor={colors.primary}
            />
            
            {/* Destination marker */}
            <Marker
              coordinate={{
                latitude: ride.destination.latitude,
                longitude: ride.destination.longitude,
              }}
              title="Destination"
              description={formatLocation(ride.destination)}
              pinColor={colors.yellow}
            />

            {/* Meeting point marker */}
            {meetingPoint && (
              <Marker
                coordinate={{
                  latitude: meetingPoint.latitude,
                  longitude: meetingPoint.longitude,
                }}
                title="Meeting Point"
                description="Fair meeting location"
                pinColor={colors.green}
              />
            )}

            {/* Route line */}
            <Polyline
              coordinates={[
                {
                  latitude: ride.start_location.latitude,
                  longitude: ride.start_location.longitude,
                },
                {
                  latitude: ride.destination.latitude,
                  longitude: ride.destination.longitude,
                },
              ]}
              strokeColor={colors.yellow}
              strokeWidth={3}
            />
          </MapView>
        </View>

        {/* Meeting Point Info */}
        {meetingPoint && distanceToMeeting !== null && (
          <View style={commonStyles.cardLarge}>
            <Text style={styles.sectionLabel}>🎯 Meeting Point</Text>
            <Text style={styles.meetingPointText}>
              Fair location calculated between both start points
            </Text>
            <Text style={styles.distanceText}>
              {formatDistance(distanceToMeeting)} from your location
            </Text>
          </View>
        )}

        {/* Poster Info */}
        {ride.profile && (
          <View style={commonStyles.cardLarge}>
            <Text style={styles.sectionLabel}>Posted by</Text>
            <Text style={styles.posterName}>{ride.profile.display_name}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {!isOwner && (
          <View style={styles.actionSection}>
            {myRequest ? (
              <>
                <View style={[styles.statusBadge, styles[`status${myRequest.status}`]]}>
                  <Text style={styles.statusText}>
                    {myRequest.status === 'pending' && '⏳ Request Pending'}
                    {myRequest.status === 'approved' && '✓ Request Approved'}
                    {myRequest.status === 'declined' && '✕ Request Declined'}
                  </Text>
                </View>
                {myRequest.status === 'approved' && (
                  <TouchableOpacity
                    style={commonStyles.primaryButton}
                    onPress={handleOpenChat}
                  >
                    <Text style={commonStyles.buttonText}>Open Chat</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={commonStyles.primaryButton}
                onPress={handleRequestToJoin}
                disabled={requesting}
              >
                <Text style={commonStyles.buttonText}>
                  {requesting ? 'Sending Request...' : 'Request to Join'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Requests (for owner) */}
        {isOwner && rideRequests.length > 0 && (
          <View style={commonStyles.cardLarge}>
            <Text style={styles.sectionLabel}>Ride Requests</Text>
            {rideRequests.map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requesterName}>
                    {request.profile?.display_name}
                  </Text>
                  <Text style={styles.requestStatus}>
                    Status: {request.status}
                  </Text>
                </View>
                {request.status === 'pending' && (
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.approveButton]}
                      onPress={() => handleApproveRequest(request.id)}
                    >
                      <Text style={styles.requestButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.declineButton]}
                      onPress={() => handleDeclineRequest(request.id)}
                    >
                      <Text style={styles.requestButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {request.status === 'approved' && (
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleOpenChat}
                  >
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl + spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContainer: {
    padding: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationLarge: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  arrowLarge: {
    fontSize: fontSize.xxl,
    color: colors.yellow,
    fontWeight: '600',
  },
  dateTimeRow: {
    marginBottom: spacing.md,
  },
  dateTimeBadge: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
  },
  dateTimeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  preferenceLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  preferenceValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionSection: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  mapContainer: {
    height: 300,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  meetingPointText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  distanceText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  posterName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  actionSection: {
    gap: spacing.md,
  },
  statusBadge: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statuspending: {
    backgroundColor: colors.pending + '20',
  },
  statusapproved: {
    backgroundColor: colors.approved + '20',
  },
  statusdeclined: {
    backgroundColor: colors.declined + '20',
  },
  statusText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  requestInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requestStatus: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.approved,
  },
  declineButton: {
    backgroundColor: colors.declined,
  },
  requestButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.background,
  },
  chatButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  chatButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.background,
  },
});

