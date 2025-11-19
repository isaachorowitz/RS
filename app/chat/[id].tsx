import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useRequestsStore } from '@/stores/requestsStore';
import { supabase } from '@/lib/supabase';
import { Ride, ChatMessage, RideRequest } from '@/types/database';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { formatRelativeTime, formatLocation } from '@/lib/format';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const messages = useChatStore(state => state.messages);
  const fetchMessages = useChatStore(state => state.fetchMessages);
  const sendMessage = useChatStore(state => state.sendMessage);
  const subscribeToRide = useChatStore(state => state.subscribeToRide);
  const unsubscribeFromRide = useChatStore(state => state.unsubscribeFromRide);
  const createRequest = useRequestsStore(state => state.createRequest);
  const updateRequestStatus = useRequestsStore(state => state.updateRequestStatus);
  const fetchRideRequests = useRequestsStore(state => state.fetchRideRequests);
  const requests = useRequestsStore(state => state.requests);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [myRequest, setMyRequest] = useState<RideRequest | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const rideMessages = id ? messages[id] || [] : [];
  const rideRequests = id ? requests[id] || [] : [];

  useEffect(() => {
    if (id && user) {
      loadRide();
      fetchMessages(id);
      fetchRideRequests(id);
      subscribeToRide(id, user.id);
    }

    return () => {
      if (id) {
        unsubscribeFromRide(id);
      }
    };
  }, [id, user]);

  useEffect(() => {
    if (id && rideRequests && user) {
      const userRequest = rideRequests.find(r => r.requester_id === user.id);
      setMyRequest(userRequest || null);
    }
  }, [rideRequests, id, user]);

  useEffect(() => {
    if (rideMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [rideMessages.length]);

  const loadRide = async () => {
    try {
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
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !user || !id) return;

    const content = messageText.trim();
    setMessageText('');
    setSending(true);

    const { error } = await sendMessage({
      ride_id: id,
      sender_id: user.id,
      content,
    });

    setSending(false);

    if (error) {
      setMessageText(content);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleRequestToJoin = async () => {
    if (!user || !ride || !profile?.location) {
      Alert.alert('Set Your Location', 'Please update your location in your profile first');
      return;
    }

    const { error } = await createRequest({
      ride_id: ride.id,
      requester_id: user.id,
      requester_location: profile.location,
      status: 'pending',
      message: null,
    });

    if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const { error } = await updateRequestStatus(requestId, 'approved');
    if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            await updateRequestStatus(requestId, 'declined');
          },
        },
      ]
    );
  };

  const isOwner = user?.id === ride?.user_id;
  const pendingRequests = rideRequests.filter(r => r.status === 'pending');

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {item.profile?.display_name || 'Unknown'}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        {ride && (
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {formatLocation(ride.destination)}
            </Text>
            <Text style={styles.headerSubtitle}>
              {ride.profile?.display_name}
            </Text>
          </View>
        )}
        <View style={{ width: 24 }} />
      </View>

      {/* Pending Requests (for owner) */}
      {isOwner && pendingRequests.length > 0 && (
        <View style={styles.requestsBar}>
          <Text style={styles.requestsText}>
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
          </Text>
          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <Text style={styles.requesterName}>{request.profile?.display_name}</Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveRequest(request.id)}
                >
                  <Ionicons name="checkmark" size={18} color={colors.background} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDeclineRequest(request.id)}
                >
                  <Ionicons name="close" size={18} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Request Status (for requester) */}
      {!isOwner && myRequest && (
        <View style={[styles.statusBar, styles[`status${myRequest.status}`]]}>
          <Ionicons 
            name={
              myRequest.status === 'approved' ? 'checkmark-circle' :
              myRequest.status === 'pending' ? 'time' : 'close-circle'
            }
            size={20}
            color={colors.text}
          />
          <Text style={styles.statusText}>
            {myRequest.status === 'pending' && 'Request Pending'}
            {myRequest.status === 'approved' && 'Request Approved!'}
            {myRequest.status === 'declined' && 'Request Declined'}
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={rideMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Say hello!</Text>
          </View>
        }
      />

      {/* Input & Actions */}
      <View style={styles.inputContainer}>
        {!isOwner && !myRequest && (
          <TouchableOpacity style={styles.requestButton} onPress={handleRequestToJoin}>
            <Ionicons name="add-circle" size={20} color={colors.background} />
            <Text style={styles.requestButtonText}>Request to Join</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            <Ionicons name="send" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl + spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  requestsBar: {
    backgroundColor: colors.yellow + '20',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.yellow + '40',
  },
  requestsText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  requesterName: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  approveButton: {
    backgroundColor: colors.green,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  statuspending: {
    backgroundColor: colors.pending + '20',
  },
  statusapproved: {
    backgroundColor: colors.approved + '30',
  },
  statusdeclined: {
    backgroundColor: colors.declined + '20',
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  messageBubble: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: '100%',
  },
  myMessage: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.background,
  },
  otherMessageText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  myTimestamp: {
    marginRight: spacing.sm,
    marginLeft: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  inputContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.yellow,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm,
  },
  requestButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.disabled,
  },
});
