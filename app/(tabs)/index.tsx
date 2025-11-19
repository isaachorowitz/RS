import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useRidesStore } from '@/stores/ridesStore';
import { RideCard } from '@/components/RideCard';
import { colors } from '@/constants/colors';
import { spacing, fontSize, borderRadius } from '@/constants/styles';
import { TEL_AVIV_CITIES, EVENT_TYPES } from '@/constants/cities';

type SortBy = 'time' | 'distance';

export default function FeedScreen() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const rides = useRidesStore(state => state.rides);
  const loading = useRidesStore(state => state.loading);
  const fetchRides = useRidesStore(state => state.fetchRides);
  const fetchUserInterests = useRidesStore(state => state.fetchUserInterests);
  
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('time');
  const [fromFilter, setFromFilter] = useState<string | null>(null);
  const [toFilter, setToFilter] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserInterests(user.id);
    }
    loadRides();
  }, [user]);

  const loadRides = async () => {
    await fetchRides(profile?.location || undefined);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  };

  // Filter rides
  let filteredRides = rides.filter(ride => ride.user_id !== user?.id);

  if (fromFilter) {
    filteredRides = filteredRides.filter(r => r.start_location.cityId === fromFilter);
  }
  if (toFilter) {
    filteredRides = filteredRides.filter(r => r.destination.cityId === toFilter);
  }
  if (eventFilter) {
    filteredRides = filteredRides.filter(r => r.event_type === eventFilter);
  }

  // Sort rides
  if (sortBy === 'time') {
    filteredRides.sort((a, b) => {
      const aTime = new Date(`${a.date} ${a.time}`).getTime();
      const bTime = new Date(`${b.date} ${b.time}`).getTime();
      return aTime - bTime;
    });
  }

  const hasActiveFilters = fromFilter || toFilter || eventFilter;
  const activeFilterCount = [fromFilter, toFilter, eventFilter].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Available Rides</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color={colors.text} />
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'time' ? 'distance' : 'time')}
          >
            <Ionicons 
              name={sortBy === 'time' ? 'time' : 'location'} 
              size={18} 
              color={colors.primary} 
            />
            <Text style={styles.sortText}>{sortBy === 'time' ? 'Time' : 'Distance'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rides List */}
      <FlatList
        data={filteredRides}
        renderItem={({ item }) => <RideCard key={item.id} ride={item} compact />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {hasActiveFilters ? 'No matching rides' : 'No rides available'}
            </Text>
            <Text style={styles.emptyText}>
              {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to post!'}
            </Text>
          </View>
        }
      />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* From City */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>From</Text>
              <View style={styles.chipGrid}>
                <TouchableOpacity
                  style={[styles.chip, !fromFilter && styles.chipSelected]}
                  onPress={() => setFromFilter(null)}
                >
                  <Text style={[styles.chipText, !fromFilter && styles.chipTextSelected]}>
                    All
                  </Text>
                </TouchableOpacity>
                {TEL_AVIV_CITIES.slice(0, 12).map(city => (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.chip, fromFilter === city.id && styles.chipSelected]}
                    onPress={() => setFromFilter(city.id)}
                  >
                    <Text style={[styles.chipText, fromFilter === city.id && styles.chipTextSelected]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* To City */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>To</Text>
              <View style={styles.chipGrid}>
                <TouchableOpacity
                  style={[styles.chip, !toFilter && styles.chipSelected]}
                  onPress={() => setToFilter(null)}
                >
                  <Text style={[styles.chipText, !toFilter && styles.chipTextSelected]}>
                    All
                  </Text>
                </TouchableOpacity>
                {TEL_AVIV_CITIES.slice(0, 12).map(city => (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.chip, toFilter === city.id && styles.chipSelected]}
                    onPress={() => setToFilter(city.id)}
                  >
                    <Text style={[styles.chipText, toFilter === city.id && styles.chipTextSelected]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Event Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Event Type</Text>
              <View style={styles.chipGrid}>
                <TouchableOpacity
                  style={[styles.chip, !eventFilter && styles.chipSelected]}
                  onPress={() => setEventFilter(null)}
                >
                  <Text style={[styles.chipText, !eventFilter && styles.chipTextSelected]}>
                    All
                  </Text>
                </TouchableOpacity>
                {EVENT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.chip, eventFilter === type.id && styles.chipSelected]}
                    onPress={() => setEventFilter(type.id)}
                  >
                    <Text style={styles.chipEmoji}>{type.emoji}</Text>
                    <Text style={[styles.chipText, eventFilter === type.id && styles.chipTextSelected]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setFromFilter(null);
                  setToFilter(null);
                  setEventFilter(null);
                }}
              >
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.yellow,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  sortText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  listContainer: {
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xxxl + spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  filterSection: {
    marginTop: spacing.lg,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  chipEmoji: {
    fontSize: 12,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  clearButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.error,
  },
  modalFooter: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.background,
  },
});
