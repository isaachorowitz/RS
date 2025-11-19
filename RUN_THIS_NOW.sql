-- ========================================
-- COMPLETE DATABASE UPDATE
-- Run this entire file in Supabase SQL Editor
-- ========================================

-- 1. Add new columns to rides table
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT FALSE;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 2. Update chat policies to allow messaging before approval
DROP POLICY IF EXISTS "Users can view messages for rides they're involved in" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in rides they're involved in" ON chat_messages;

CREATE POLICY "Anyone can view messages for active rides" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE id = chat_messages.ride_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can send messages in rides" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM rides 
      WHERE id = chat_messages.ride_id 
      AND status = 'active'
    )
  );

-- 3. Insert dummy rides (using your user ID: 9647ae48-3979-4923-9194-6c39cc255087)
INSERT INTO rides (
  user_id, start_location, destination, date, time, status,
  taxi_preference, payment_method, max_passengers, description,
  event_type, event_name, is_event
) VALUES
  -- Concert at Yarkon Park
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
    '{"latitude": 32.1047, "longitude": 34.8028, "city": "Yarkon Park", "cityId": "yarkon-park", "address": "Yarkon Park"}',
    '2024-01-27', '19:00', 'active', 'Gett', 'Bit', 3,
    'Going to see Coldplay! Let''s share a ride from the city center 🎸',
    'concert', 'Coldplay Concert', true
  ),
  -- Soccer at Bloomfield Stadium
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0719, "longitude": 34.8242, "city": "Ramat Gan", "cityId": "ramat-gan", "address": "Ramat Gan"}',
    '{"latitude": 32.0628, "longitude": 34.7558, "city": "Bloomfield Stadium", "cityId": "bloomfield-stadium", "address": "Bloomfield Stadium"}',
    '2024-01-26', '20:30', 'active', 'Have a driver', 'Cash', 3,
    'Maccabi vs Hapoel match! Who''s coming? ⚽',
    'soccer', 'Maccabi Tel Aviv vs Hapoel', true
  ),
  -- Airport ride
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
    '{"latitude": 32.0114, "longitude": 34.8867, "city": "Ben Gurion Airport", "cityId": "ben-gurion-airport", "address": "Ben Gurion Airport"}',
    '2024-01-24', '14:00', 'active', 'Gett', 'Split evenly', 2,
    'Flight at 17:00, leaving early to avoid traffic ✈️',
    NULL, NULL, false
  ),
  -- Concert at Menorah Arena
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0578, "longitude": 34.7619, "city": "Neve Tzedek", "cityId": "neve-tzedek", "address": "Neve Tzedek"}',
    '{"latitude": 32.0564, "longitude": 34.7936, "city": "Menorah Arena", "cityId": "menorah-arena", "address": "Menorah Arena"}',
    '2024-01-28', '21:00', 'active', 'Decide together', 'PayBox', 3,
    'Hip hop show tonight! Looking for ride buddies 🎤',
    'concert', 'Hip Hop Night', true
  ),
  -- Dinner in Jaffa
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
    '{"latitude": 32.0543, "longitude": 34.7516, "city": "Jaffa", "cityId": "jaffa", "address": "Jaffa"}',
    '2024-01-25', '20:00', 'active', 'Gett', 'Bit', 3,
    'Dinner in Old Jaffa, anyone want to split a ride? 🍽️',
    NULL, NULL, false
  ),
  -- Tel Aviv Port
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0547, "longitude": 34.7675, "city": "Florentin", "cityId": "florentin", "address": "Florentin"}',
    '{"latitude": 32.1097, "longitude": 34.7997, "city": "Tel Aviv Port", "cityId": "tel-aviv-port", "address": "Tel Aviv Port"}',
    '2024-01-26', '18:00', 'active', 'Decide together', 'Split evenly', 2,
    'Sunset at the port 🌅',
    NULL, NULL, false
  ),
  -- Sarona Market lunch
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0808, "longitude": 34.7742, "city": "Dizengoff", "cityId": "dizengoff", "address": "Dizengoff"}',
    '{"latitude": 32.0722, "longitude": 34.7864, "city": "Sarona Market", "cityId": "sarona-market", "address": "Sarona Market"}',
    '2024-01-27', '12:30', 'active', 'Gett', 'Cash', 2,
    'Lunch at Sarona, anyone from Dizengoff area?',
    NULL, NULL, false
  ),
  -- Rishon LeZion commute
  (
    '9647ae48-3979-4923-9194-6c39cc255087',
    '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
    '{"latitude": 31.9642, "longitude": 34.8053, "city": "Rishon LeZion", "cityId": "rishon-lezion", "address": "Rishon LeZion"}',
    '2024-01-25', '09:00', 'active', 'Have a driver', 'Split evenly', 3,
    'Daily commute to Rishon, open to carpooling regularly',
    NULL, NULL, false
  );

-- Done! You should see "Success. 8 rows returned"

