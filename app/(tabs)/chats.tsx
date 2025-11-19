import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Ride } from '@/types/database';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatLocation, formatRelativeTime } from '@/lib/format';

interface ChatPreview {
  ride: Ride;
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export default function ChatsScreen() {
  const user = useAuthStore(state => state.user);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get rides where user is owner or has approved request
      const { data: ownedRides, error: ownedError } = await supabase
        .from('rides')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data: joinedRides, error: joinedError } = await supabase
        .from('ride_requests')
        .select(`
          ride:rides(
            *,
            profile:profiles(*)
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'approved');

      if (ownedError) throw ownedError;
      if (joinedError) throw joinedError;

      // Combine and deduplicate rides
      const allRides = [
        ...(ownedRides || []),
        ...(joinedRides || []).map(jr => jr.ride).filter(Boolean),
      ];

      // Get last message for each ride
      const chatsWithMessages = await Promise.all(
        allRides.map(async (ride) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('content, created_at')
            .eq('ride_id', ride.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ride,
            lastMessage: lastMessage || undefined,
          };
        })
      );

      // Sort by last message time
      chatsWithMessages.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.ride.created_at;
        const bTime = b.lastMessage?.created_at || b.ride.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setChats(chatsWithMessages);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (rideId: string) => {
    router.push(`/chat/${rideId}`);
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Text style={styles.subtitle}>Your active conversations</Text>
      </View>

      <ScrollView
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
        {loading && chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading chats...</Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active chats</Text>
            <Text style={styles.emptyText}>
              Join a ride to start chatting with other riders
            </Text>
          </View>
        ) : (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.ride.id}
              style={styles.chatCard}
              onPress={() => handleChatPress(chat.ride.id)}
              activeOpacity={0.7}
            >
              <View style={styles.chatHeader}>
                <View style={styles.route}>
                  <Text style={styles.location} numberOfLines={1}>
                    {formatLocation(chat.ride.start_location)}
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.location} numberOfLines={1}>
                    {formatLocation(chat.ride.destination)}
                  </Text>
                </View>
              </View>

              {chat.lastMessage ? (
                <View style={styles.lastMessageContainer}>
                  <Text style={styles.lastMessage} numberOfLines={2}>
                    {chat.lastMessage.content}
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatRelativeTime(chat.lastMessage.created_at)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noMessages}>No messages yet</Text>
              )}
            </TouchableOpacity>
          ))
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
  chatCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  chatHeader: {
    marginBottom: spacing.sm,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  arrow: {
    fontSize: fontSize.lg,
    color: colors.yellow,
    fontWeight: '600',
  },
  lastMessageContainer: {
    gap: spacing.xs,
  },
  lastMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  noMessages: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

