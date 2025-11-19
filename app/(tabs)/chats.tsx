import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Ride } from '@/types/database';
import { colors } from '@/constants/colors';
import { spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatRelativeTime } from '@/lib/format';

interface ChatItem {
  ride: Ride;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

export default function ChatsScreen() {
  const user = useAuthStore(state => state.user);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadChats();
      // Refresh every 5 seconds to catch new chats
      const interval = setInterval(loadChats, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Simple approach: Get all messages involving this user
      const { data: myMessages, error: msgError } = await supabase
        .from('chat_messages')
        .select('ride_id')
        .eq('sender_id', user.id);

      if (msgError) {
        console.error('Error fetching my messages:', msgError);
        setLoading(false);
        return;
      }

      // Get messages in rides I own
      const { data: myRidesData } = await supabase
        .from('rides')
        .select('id')
        .eq('user_id', user.id);

      const myRideIds = myRidesData?.map(r => r.id) || [];

      const { data: messagesInMyRides } = await supabase
        .from('chat_messages')
        .select('ride_id')
        .in('ride_id', myRideIds.length > 0 ? myRideIds : ['none']);

      // Combine all ride IDs
      const allRideIds = new Set([
        ...(myMessages?.map(m => m.ride_id) || []),
        ...(messagesInMyRides?.map(m => m.ride_id) || []),
      ]);

      if (allRideIds.size === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Fetch rides with messages
      const chatsPromises = Array.from(allRideIds).map(async (rideId) => {
        // Get ride
        const { data: ride, error: rideError } = await supabase
          .from('rides')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', rideId)
          .single();

        if (rideError || !ride) return null;

        // Get last message
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select(`
            content,
            created_at,
            sender_id,
            profile:profiles(display_name)
          `)
          .eq('ride_id', rideId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ride,
          lastMessage: lastMsg || undefined,
        };
      });

      const chatsData = await Promise.all(chatsPromises);
      const validChats = chatsData.filter(Boolean) as ChatItem[];
      
      // Sort by last message time
      validChats.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.ride.created_at;
        const bTime = b.lastMessage?.created_at || b.ride.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setChats(validChats);
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

  const renderChat = ({ item }: { item: ChatItem }) => {
    const isMyMessage = item.lastMessage?.sender_id === user?.id;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.ride.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.chatIcon}>
          <Ionicons name="chatbubble" size={24} color={colors.primary} />
        </View>
        <View style={styles.chatContent}>
          <Text style={styles.chatDestination} numberOfLines={1}>
            {item.ride.is_event && item.ride.event_name 
              ? item.ride.event_name 
              : `To ${item.ride.destination.city}`}
          </Text>
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {isMyMessage && 'You: '}{item.lastMessage.content}
            </Text>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
        </View>
        <View style={styles.chatMeta}>
          {item.lastMessage && (
            <Text style={styles.timestamp}>
              {formatRelativeTime(item.lastMessage.created_at)}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity onPress={loadChats}>
          <Ionicons name="refresh" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.ride.id}
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
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptyText}>
              View a ride and tap Chat to start a conversation
            </Text>
            {!loading && (
              <TouchableOpacity style={styles.refreshButton} onPress={loadChats}>
                <Ionicons name="refresh" size={18} color={colors.primary} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  listContainer: {
    padding: spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  chatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatDestination: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  noMessages: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  chatMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 3,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.pill,
  },
  refreshButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});
