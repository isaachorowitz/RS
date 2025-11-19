#!/bin/bash

# Quick script to seed dummy data
# Usage: ./scripts/seed-with-user-id.sh YOUR_USER_ID_HERE

if [ -z "$1" ]; then
    echo "❌ Please provide your user ID"
    echo "Usage: ./scripts/seed-with-user-id.sh YOUR_USER_ID"
    echo ""
    echo "To get your user ID:"
    echo "1. Go to Supabase Dashboard > SQL Editor"
    echo "2. Run: SELECT id, email FROM profiles LIMIT 1;"
    echo "3. Copy the id value"
    exit 1
fi

USER_ID=$1

echo "🌱 Seeding dummy rides for user: $USER_ID"

# Use the Supabase client to insert rides
node -e "
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '$EXPO_PUBLIC_SUPABASE_URL',
  '$EXPO_PUBLIC_SUPABASE_ANON_KEY'
);

const USER_ID = '$USER_ID';

const DUMMY_RIDES = [
  {
    user_id: USER_ID,
    start_location: { latitude: 32.0853, longitude: 34.7818, city: 'Tel Aviv Center', cityId: 'tel-aviv-center', address: 'Tel Aviv Center' },
    destination: { latitude: 32.1047, longitude: 34.8028, city: 'Yarkon Park', cityId: 'yarkon-park', address: 'Yarkon Park' },
    date: '2024-01-27',
    time: '19:00',
    status: 'active',
    taxi_preference: 'Gett',
    payment_method: 'Bit',
    max_passengers: 3,
    description: 'Going to see Coldplay! Let\\'s share a ride from the city center 🎸',
    event_type: 'concert',
    event_name: 'Coldplay Concert',
    is_event: true
  },
  {
    user_id: USER_ID,
    start_location: { latitude: 32.0719, longitude: 34.8242, city: 'Ramat Gan', cityId: 'ramat-gan', address: 'Ramat Gan' },
    destination: { latitude: 32.0628, longitude: 34.7558, city: 'Bloomfield Stadium', cityId: 'bloomfield-stadium', address: 'Bloomfield Stadium' },
    date: '2024-01-26',
    time: '20:30',
    status: 'active',
    taxi_preference: 'Have a driver',
    payment_method: 'Cash',
    max_passengers: 3,
    description: 'Maccabi vs Hapoel match! Who\\'s coming? ⚽',
    event_type: 'soccer',
    event_name: 'Maccabi Tel Aviv vs Hapoel',
    is_event: true
  }
];

(async () => {
  const { data, error } = await supabase.from('rides').insert(DUMMY_RIDES).select();
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log(\`✅ Created \${data.length} rides!\`);
  }
})();
"

echo "✅ Done!"

