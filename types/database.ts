// Database types for Supabase tables

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  photo_url: string | null;
  location: Location | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

export interface Ride {
  id: string;
  user_id: string;
  start_location: Location;
  destination: Location;
  date: string;
  time: string;
  status: 'active' | 'completed' | 'cancelled';
  taxi_preference: string | null;
  max_passengers: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
}

export interface RideRequest {
  id: string;
  ride_id: string;
  requester_id: string;
  requester_location: Location;
  status: 'pending' | 'approved' | 'declined';
  message: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
  ride?: Ride;
}

export interface ChatMessage {
  id: string;
  ride_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  // Joined data
  profile?: Profile;
}

export interface UserInterest {
  id: string;
  user_id: string;
  place_name: string;
  place_location: Location | null;
  preferred_times: string[];
  radius_km: number;
  created_at: string;
  updated_at: string;
}

// Insert types (without id and timestamps)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type RideInsert = Omit<Ride, 'id' | 'created_at' | 'updated_at'>;
export type RideRequestInsert = Omit<RideRequest, 'id' | 'created_at' | 'updated_at'>;
export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at'>;
export type UserInterestInsert = Omit<UserInterest, 'id' | 'created_at' | 'updated_at'>;

// Update types (all fields optional except id)
export type ProfileUpdate = Partial<ProfileInsert> & { id: string };
export type RideUpdate = Partial<RideInsert> & { id: string };
export type RideRequestUpdate = Partial<RideRequestInsert> & { id: string };
export type UserInterestUpdate = Partial<UserInterestInsert> & { id: string };

