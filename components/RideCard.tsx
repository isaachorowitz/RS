import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Ride } from '@/types/database';
import { colors } from '@/constants/colors';
import { spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatDate, formatTime } from '@/lib/format';
import { EVENT_TYPES } from '@/constants/cities';

interface RideCardProps {
  ride: Ride;
}

export function RideCard({ ride }: RideCardProps) {
  const router = useRouter();
  const eventType = ride.event_type ? EVENT_TYPES.find(t => t.id === ride.event_type) : null;

  return (
    <TouchableOpacity
      style={[styles.card, ride.is_event && styles.eventCard]}
      onPress={() => router.push(`/ride/${ride.id}`)}
      activeOpacity={0.7}
    >
      {/* Event Header */}
      {ride.is_event && (
        <View style={styles.eventHeader}>
          {eventType && (
            <View style={styles.eventBadge}>
              <Text style={styles.eventEmoji}>{eventType.emoji}</Text>
              <Text style={styles.eventBadgeText}>{eventType.label}</Text>
            </View>
          )}
          {ride.event_name && (
            <Text style={styles.eventName}>{ride.event_name}</Text>
          )}
        </View>
      )}

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={styles.routeDot} />
          <Text style={styles.cityText}>{ride.start_location.city}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, styles.destinationDot]} />
          <Text style={styles.cityText}>{ride.destination.city}</Text>
        </View>
      </View>

      {/* Date & Time */}
      <View style={styles.dateTimeContainer}>
        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
        <Text style={styles.dateTimeText}>
          {formatDate(ride.date)} at {formatTime(ride.time)}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        {ride.taxi_preference && (
          <View style={styles.detailPill}>
            <Ionicons name="car" size={14} color={colors.primary} />
            <Text style={styles.detailText}>{ride.taxi_preference}</Text>
          </View>
        )}
        {ride.payment_method && (
          <View style={styles.detailPill}>
            <Ionicons name="card" size={14} color={colors.primary} />
            <Text style={styles.detailText}>{ride.payment_method}</Text>
          </View>
        )}
        <View style={styles.detailPill}>
          <Ionicons name="people" size={14} color={colors.primary} />
          <Text style={styles.detailText}>{ride.max_passengers} seats</Text>
        </View>
      </View>

      {/* Description */}
      {ride.description && (
        <Text style={styles.description} numberOfLines={2}>
          {ride.description}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.posterText}>Posted by {ride.profile?.display_name || 'Unknown'}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  eventCard: {
    borderColor: colors.yellow + '50',
    backgroundColor: colors.cardBackground,
  },
  eventHeader: {
    marginBottom: spacing.md,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.yellow + '20',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm,
  },
  eventEmoji: {
    fontSize: fontSize.md,
  },
  eventBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.yellow,
    lineHeight: 28,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  destinationDot: {
    backgroundColor: colors.yellow,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: spacing.xs,
  },
  cityText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateTimeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  detailText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  posterText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
