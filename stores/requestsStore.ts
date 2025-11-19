import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { RideRequest, RideRequestInsert } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RequestsState {
  requests: Record<string, RideRequest[]>; // keyed by ride_id
  myRequests: RideRequest[]; // requests made by current user
  loading: boolean;
  activeSubscriptions: Record<string, RealtimeChannel>;
  
  // Actions
  fetchRideRequests: (rideId: string) => Promise<void>;
  fetchMyRequests: (userId: string) => Promise<void>;
  createRequest: (request: RideRequestInsert) => Promise<{ data?: RideRequest; error?: string }>;
  updateRequestStatus: (requestId: string, status: 'approved' | 'declined') => Promise<{ error?: string }>;
  subscribeToRideRequests: (rideId: string) => void;
  unsubscribeFromRideRequests: (rideId: string) => void;
}

export const useRequestsStore = create<RequestsState>((set, get) => ({
  requests: {},
  myRequests: [],
  loading: false,
  activeSubscriptions: {},

  fetchRideRequests: async (rideId: string) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          profile:profiles(*),
          ride:rides(*)
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        set({ loading: false });
        return;
      }

      const requests = get().requests;
      set({
        requests: {
          ...requests,
          [rideId]: data || [],
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      set({ loading: false });
    }
  },

  fetchMyRequests: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          profile:profiles(*),
          ride:rides(*, profile:profiles(*))
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my requests:', error);
        return;
      }

      set({ myRequests: data || [] });
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  },

  createRequest: async (request: RideRequestInsert) => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .insert(request)
        .select(`
          *,
          profile:profiles(*),
          ride:rides(*)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Add to local state
      const requests = get().requests;
      const rideRequests = requests[request.ride_id] || [];
      set({
        requests: {
          ...requests,
          [request.ride_id]: [data, ...rideRequests],
        },
        myRequests: [data, ...get().myRequests],
      });

      return { data };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  updateRequestStatus: async (requestId: string, status: 'approved' | 'declined') => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .update({ status })
        .eq('id', requestId)
        .select(`
          *,
          profile:profiles(*),
          ride:rides(*)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update local state
      const requests = get().requests;
      const rideId = data.ride_id;
      const rideRequests = requests[rideId] || [];
      
      set({
        requests: {
          ...requests,
          [rideId]: rideRequests.map(r => r.id === requestId ? data : r),
        },
        myRequests: get().myRequests.map(r => r.id === requestId ? data : r),
      });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  subscribeToRideRequests: (rideId: string) => {
    const subscriptions = get().activeSubscriptions;
    if (subscriptions[rideId]) {
      return;
    }

    const channel = supabase
      .channel(`requests:${rideId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests',
          filter: `ride_id=eq.${rideId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Fetch the full request with profile data
            const { data } = await supabase
              .from('ride_requests')
              .select(`
                *,
                profile:profiles(*),
                ride:rides(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              const requests = get().requests;
              const rideRequests = requests[rideId] || [];
              
              const existingIndex = rideRequests.findIndex(r => r.id === data.id);
              let updatedRequests;
              
              if (existingIndex >= 0) {
                // Update existing
                updatedRequests = [...rideRequests];
                updatedRequests[existingIndex] = data;
              } else {
                // Add new
                updatedRequests = [data, ...rideRequests];
              }
              
              set({
                requests: {
                  ...requests,
                  [rideId]: updatedRequests,
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

  unsubscribeFromRideRequests: (rideId: string) => {
    const subscriptions = get().activeSubscriptions;
    const channel = subscriptions[rideId];
    
    if (channel) {
      supabase.removeChannel(channel);
      
      const { [rideId]: removed, ...rest } = subscriptions;
      set({ activeSubscriptions: rest });
    }
  },
}));

