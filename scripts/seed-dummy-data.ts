/**
 * Seed script to populate dummy rides for testing
 * Run this after creating at least one user account
 * 
 * Usage:
 * 1. Create a user account in the app
 * 2. Copy the user ID from Supabase dashboard
 * 3. Update USER_ID below
 * 4. Run: npx ts-node scripts/seed-dummy-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tgmogzxnnlepuheaorfo.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// REPLACE THIS WITH YOUR USER ID FROM SUPABASE
const USER_ID = 'YOUR_USER_ID_HERE';

const DUMMY_RIDES = [
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0853,
      longitude: 34.7818,
      city: 'Tel Aviv Center',
      cityId: 'tel-aviv-center',
      address: 'Tel Aviv Center'
    },
    destination: {
      latitude: 32.1047,
      longitude: 34.8028,
      city: 'Yarkon Park',
      cityId: 'yarkon-park',
      address: 'Yarkon Park'
    },
    date: '2024-01-27',
    time: '19:00',
    status: 'active',
    taxi_preference: 'Gett',
    payment_method: 'Bit',
    max_passengers: 3,
    description: 'Going to see Coldplay! Let\'s share a ride from the city center 🎸',
    event_type: 'concert',
    event_name: 'Coldplay Concert',
    is_event: true
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0719,
      longitude: 34.8242,
      city: 'Ramat Gan',
      cityId: 'ramat-gan',
      address: 'Ramat Gan'
    },
    destination: {
      latitude: 32.0628,
      longitude: 34.7558,
      city: 'Bloomfield Stadium',
      cityId: 'bloomfield-stadium',
      address: 'Bloomfield Stadium'
    },
    date: '2024-01-26',
    time: '20:30',
    status: 'active',
    taxi_preference: 'Have a driver',
    payment_method: 'Cash',
    max_passengers: 3,
    description: 'Maccabi vs Hapoel match! Who\'s coming? ⚽',
    event_type: 'soccer',
    event_name: 'Maccabi Tel Aviv vs Hapoel',
    is_event: true
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0853,
      longitude: 34.7818,
      city: 'Tel Aviv Center',
      cityId: 'tel-aviv-center',
      address: 'Tel Aviv Center'
    },
    destination: {
      latitude: 32.0114,
      longitude: 34.8867,
      city: 'Ben Gurion Airport',
      cityId: 'ben-gurion-airport',
      address: 'Ben Gurion Airport'
    },
    date: '2024-01-24',
    time: '14:00',
    status: 'active',
    taxi_preference: 'Gett',
    payment_method: 'Split evenly',
    max_passengers: 2,
    description: 'Flight at 17:00, leaving early to avoid traffic ✈️',
    is_event: false
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0578,
      longitude: 34.7619,
      city: 'Neve Tzedek',
      cityId: 'neve-tzedek',
      address: 'Neve Tzedek'
    },
    destination: {
      latitude: 32.0564,
      longitude: 34.7936,
      city: 'Menorah Arena',
      cityId: 'menorah-arena',
      address: 'Menorah Arena'
    },
    date: '2024-01-28',
    time: '21:00',
    status: 'active',
    taxi_preference: 'Decide together',
    payment_method: 'PayBox',
    max_passengers: 3,
    description: 'Hip hop show tonight! Looking for ride buddies 🎤',
    event_type: 'concert',
    event_name: 'Hip Hop Night',
    is_event: true
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0853,
      longitude: 34.7818,
      city: 'Tel Aviv Center',
      cityId: 'tel-aviv-center',
      address: 'Tel Aviv Center'
    },
    destination: {
      latitude: 32.0543,
      longitude: 34.7516,
      city: 'Jaffa',
      cityId: 'jaffa',
      address: 'Jaffa'
    },
    date: '2024-01-25',
    time: '20:00',
    status: 'active',
    taxi_preference: 'Gett',
    payment_method: 'Bit',
    max_passengers: 3,
    description: 'Dinner in Old Jaffa, anyone want to split a ride? 🍽️',
    is_event: false
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0547,
      longitude: 34.7675,
      city: 'Florentin',
      cityId: 'florentin',
      address: 'Florentin'
    },
    destination: {
      latitude: 32.1097,
      longitude: 34.7997,
      city: 'Tel Aviv Port',
      cityId: 'tel-aviv-port',
      address: 'Tel Aviv Port'
    },
    date: '2024-01-26',
    time: '18:00',
    status: 'active',
    taxi_preference: 'Decide together',
    payment_method: 'Split evenly',
    max_passengers: 2,
    description: 'Sunset at the port 🌅',
    is_event: false
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0808,
      longitude: 34.7742,
      city: 'Dizengoff',
      cityId: 'dizengoff',
      address: 'Dizengoff'
    },
    destination: {
      latitude: 32.0722,
      longitude: 34.7864,
      city: 'Sarona Market',
      cityId: 'sarona-market',
      address: 'Sarona Market'
    },
    date: '2024-01-27',
    time: '12:30',
    status: 'active',
    taxi_preference: 'Gett',
    payment_method: 'Cash',
    max_passengers: 2,
    description: 'Lunch at Sarona, anyone from Dizengoff area?',
    is_event: false
  },
  {
    user_id: USER_ID,
    start_location: {
      latitude: 32.0853,
      longitude: 34.7818,
      city: 'Tel Aviv Center',
      cityId: 'tel-aviv-center',
      address: 'Tel Aviv Center'
    },
    destination: {
      latitude: 31.9642,
      longitude: 34.8053,
      city: 'Rishon LeZion',
      cityId: 'rishon-lezion',
      address: 'Rishon LeZion'
    },
    date: '2024-01-25',
    time: '09:00',
    status: 'active',
    taxi_preference: 'Have a driver',
    payment_method: 'Split evenly',
    max_passengers: 3,
    description: 'Daily commute to Rishon, open to carpooling regularly',
    is_event: false
  }
];

async function seedData() {
  console.log('🌱 Seeding dummy rides...');
  
  if (USER_ID === 'YOUR_USER_ID_HERE') {
    console.error('❌ Please update USER_ID in the script first!');
    console.log('To get your user ID:');
    console.log('1. Create an account in the app');
    console.log('2. Go to Supabase Dashboard > Authentication');
    console.log('3. Copy your user ID');
    console.log('4. Update USER_ID in scripts/seed-dummy-data.ts');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('rides')
      .insert(DUMMY_RIDES)
      .select();

    if (error) {
      console.error('❌ Error inserting rides:', error);
      return;
    }

    console.log(`✅ Successfully created ${data?.length} dummy rides!`);
    console.log('\nYou can now:');
    console.log('1. Open the app');
    console.log('2. Browse the feed to see all rides');
    console.log('3. Request to join rides');
    console.log('4. Test the chat functionality');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

seedData();

