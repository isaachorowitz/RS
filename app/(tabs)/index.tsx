import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useRidesStore } from '@/stores/ridesStore';
import { RideCard } from '@/components/RideCard';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, fontSize, borderRadius } from '@/constants/styles';

export default function FeedScreen() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const rides = useRidesStore(state => state.rides);
  const loading = useRidesStore(state => state.loading);
  const fetchRides = useRidesStore(state => state.fetchRides);
  const fetchUserInterests = useRidesStore(state => state.fetchUserInterests);
  const userInterests = useRidesStore(state => state.userInterests);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    if (user) {
      fetchUserInterests(user.id);
    }
  }, [user]);

  useEffect(() => {
    loadRides();
  }, [profile, userInterests]);

  const loadRides = async () => {
    await fetchRides(profile?.location || undefined);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  };

  const getFilteredRides = () => {
    if (filter === 'all') return rides;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (filter === 'today') {
      return rides.filter(ride => ride.date === today);
    }

    if (filter === 'week') {
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return rides.filter(ride => {
        const rideDate = new Date(ride.date);
        return rideDate >= now && rideDate <= weekFromNow;
      });
    }

    return rides;
  };

  const filteredRides = getFilteredRides();

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rides</Text>
        <Text style={styles.subtitle}>
          {userInterests.length > 0
            ? 'Personalized for your interests'
            : 'Browse available rides'}
        </Text>
      </View>

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'today' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('today')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'today' && styles.filterTextActive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'week' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('week')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'week' && styles.filterTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading && rides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading rides...</Text>
          </View>
        ) : filteredRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptyText}>
              {filter !== 'all'
                ? 'Try changing the filter'
                : 'Be the first to post a ride!'}
            </Text>
          </View>
        ) : (
          filteredRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.xxl,
    paddingTop: spacing.xxxl * 2,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl + 8,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.md,
  },
  filterScroll: {
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.xxl,
    paddingTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

