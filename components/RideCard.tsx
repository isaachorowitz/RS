import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ride } from '@/types/database';
import { colors } from '@/constants/colors';
import { spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatDate, formatTime, formatLocation } from '@/lib/format';

interface RideCardProps {
  ride: Ride;
}

export function RideCard({ ride }: RideCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/ride/${ride.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.route}>
          <Text style={styles.location}>{formatLocation(ride.start_location)}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.location}>{formatLocation(ride.destination)}</Text>
        </View>
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
          <Text style={styles.preferenceLabel}>🚕</Text>
          <Text style={styles.preferenceText}>{ride.taxi_preference}</Text>
        </View>
      )}

      {ride.description && (
        <Text style={styles.description} numberOfLines={2}>
          {ride.description}
        </Text>
      )}

      {ride.profile && (
        <View style={styles.footer}>
          <Text style={styles.posterName}>Posted by {ride.profile.display_name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  location: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  arrow: {
    fontSize: fontSize.xl,
    color: colors.yellow,
    fontWeight: '600',
  },
  dateTimeRow: {
    marginBottom: spacing.sm,
  },
  dateTimeBadge: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
  },
  dateTimeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  preferenceLabel: {
    fontSize: fontSize.md,
  },
  preferenceText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  posterName: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

