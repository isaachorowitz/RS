import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ session, user: session.user });
        await get().fetchProfile();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session, user: session?.user || null });
        
        if (session?.user) {
          await get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });

      set({ initialized: true, loading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ initialized: true, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set({ session: data.session, user: data.user, loading: false });
      await get().fetchProfile();
      return {};
    } catch (error) {
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    try {
      set({ loading: true });
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        set({ loading: false });
        return { error: authError.message };
      }

      if (!authData.user) {
        set({ loading: false });
        return { error: 'Failed to create user' };
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          display_name: displayName,
          photo_url: null,
          location: null,
        });

      if (profileError) {
        set({ loading: false });
        return { error: profileError.message };
      }

      set({ 
        session: authData.session, 
        user: authData.user,
        loading: false 
      });
      
      await get().fetchProfile();
      return {};
    } catch (error) {
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, profile: null, session: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const user = get().user;
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const user = get().user;
      if (!user) return { error: 'Not authenticated' };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ profile: { ...currentProfile, ...updates } });
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },
}));

