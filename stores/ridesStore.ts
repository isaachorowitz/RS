import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Ride, RideInsert, UserInterest, Location } from '@/types/database';
import { calculateDistance } from '@/lib/midpoint';

interface RidesState {
  rides: Ride[];
  myRides: Ride[];
  loading: boolean;
  userInterests: UserInterest[];
  
  // Actions
  fetchRides: (userLocation?: Location) => Promise<void>;
  fetchMyRides: (userId: string) => Promise<void>;
  createRide: (ride: RideInsert) => Promise<{ data?: Ride; error?: string }>;
  updateRide: (id: string, updates: Partial<RideInsert>) => Promise<{ error?: string }>;
  deleteRide: (id: string) => Promise<{ error?: string }>;
  fetchUserInterests: (userId: string) => Promise<void>;
  addUserInterest: (interest: Omit<UserInterest, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>;
  removeUserInterest: (id: string) => Promise<{ error?: string }>;
}

export const useRidesStore = create<RidesState>((set, get) => ({
  rides: [],
  myRides: [],
  loading: false,
  userInterests: [],

  fetchRides: async (userLocation?: Location) => {
    try {
      set({ loading: true });
      
      // Fetch all active rides with profiles
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('status', 'active')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching rides:', error);
        set({ loading: false });
        return;
      }

      let rides = data || [];

      // If user has location and interests, personalize the feed
      const interests = get().userInterests;
      if (userLocation && interests.length > 0) {
        // Score each ride based on user interests
        const scoredRides = rides.map(ride => {
          let score = 0;
          
          // Check if destination matches any user interests
          for (const interest of interests) {
            if (interest.place_location) {
              const distance = calculateDistance(
                ride.destination,
                interest.place_location
              );
              
              // If within radius, increase score
              if (distance <= interest.radius_km) {
                score += 100 - distance; // Closer = higher score
                
                // Bonus for matching preferred times
                if (interest.preferred_times.includes(ride.time)) {
                  score += 50;
                }
              }
            }
            
            // Check if place name matches destination city
            if (interest.place_name && ride.destination.city?.toLowerCase().includes(interest.place_name.toLowerCase())) {
              score += 75;
            }
          }
          
          // Calculate time proximity score (sooner = higher)
          const rideDate = new Date(`${ride.date} ${ride.time}`);
          const now = new Date();
          const hoursUntil = (rideDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursUntil > 0 && hoursUntil < 168) { // Within a week
            score += Math.max(0, 50 - hoursUntil / 2);
          }
          
          return { ...ride, score };
        });
        
        // Sort by score (highest first)
        rides = scoredRides.sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      set({ rides, loading: false });
    } catch (error) {
      console.error('Error fetching rides:', error);
      set({ loading: false });
    }
  },

  fetchMyRides: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching my rides:', error);
        return;
      }

      set({ myRides: data || [] });
    } catch (error) {
      console.error('Error fetching my rides:', error);
    }
  },

  createRide: async (ride: RideInsert) => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert(ride)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Add to myRides
      const myRides = get().myRides;
      set({ myRides: [data, ...myRides] });

      return { data };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  updateRide: async (id: string, updates: Partial<RideInsert>) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      const myRides = get().myRides.map(ride =>
        ride.id === id ? { ...ride, ...updates } : ride
      );
      const rides = get().rides.map(ride =>
        ride.id === id ? { ...ride, ...updates } : ride
      );

      set({ myRides, rides });
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  deleteRide: async (id: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      // Remove from local state
      const myRides = get().myRides.filter(ride => ride.id !== id);
      const rides = get().rides.filter(ride => ride.id !== id);

      set({ myRides, rides });
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  fetchUserInterests: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching interests:', error);
        return;
      }

      set({ userInterests: data || [] });
    } catch (error) {
      console.error('Error fetching interests:', error);
    }
  },

  addUserInterest: async (interest) => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .insert(interest)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      const interests = get().userInterests;
      set({ userInterests: [...interests, data] });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  removeUserInterest: async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      const interests = get().userInterests.filter(i => i.id !== id);
      set({ userInterests: interests });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },
}));

