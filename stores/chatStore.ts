import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatMessageInsert } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatState {
  messages: Record<string, ChatMessage[]>; // keyed by ride_id
  loading: boolean;
  activeSubscriptions: Record<string, RealtimeChannel>;
  
  // Actions
  fetchMessages: (rideId: string) => Promise<void>;
  sendMessage: (message: ChatMessageInsert) => Promise<{ error?: string }>;
  subscribeToRide: (rideId: string, userId: string) => void;
  unsubscribeFromRide: (rideId: string) => void;
  clearMessages: (rideId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  loading: false,
  activeSubscriptions: {},

  fetchMessages: async (rideId: string) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        set({ loading: false });
        return;
      }

      const messages = get().messages;
      set({
        messages: {
          ...messages,
          [rideId]: data || [],
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ loading: false });
    }
  },

  sendMessage: async (message: ChatMessageInsert) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select(`
          *,
          profile:profiles(*)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Optimistically add message to local state
      const messages = get().messages;
      const rideMessages = messages[message.ride_id] || [];
      set({
        messages: {
          ...messages,
          [message.ride_id]: [...rideMessages, data],
        },
      });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  subscribeToRide: (rideId: string, userId: string) => {
    // Don't subscribe if already subscribed
    const subscriptions = get().activeSubscriptions;
    if (subscriptions[rideId]) {
      return;
    }

    // Create realtime subscription
    const channel = supabase
      .channel(`chat:${rideId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ride_id=eq.${rideId}`,
        },
        async (payload) => {
          // Fetch the full message with profile data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profile:profiles(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const messages = get().messages;
            const rideMessages = messages[rideId] || [];
            
            // Check if message already exists (to avoid duplicates)
            const exists = rideMessages.some(m => m.id === data.id);
            if (!exists) {
              set({
                messages: {
                  ...messages,
                  [rideId]: [...rideMessages, data],
                },
              });
            }
          }
        }
      )
      .subscribe();

    set({
      activeSubscriptions: {
        ...subscriptions,
        [rideId]: channel,
      },
    });
  },

  unsubscribeFromRide: (rideId: string) => {
    const subscriptions = get().activeSubscriptions;
    const channel = subscriptions[rideId];
    
    if (channel) {
      supabase.removeChannel(channel);
      
      const { [rideId]: removed, ...rest } = subscriptions;
      set({ activeSubscriptions: rest });
    }
  },

  clearMessages: (rideId: string) => {
    const messages = get().messages;
    const { [rideId]: removed, ...rest } = messages;
    set({ messages: rest });
  },
}));

