-- ========================================
-- CREATE SECOND TEST USER
-- Run this in Supabase SQL Editor
-- ========================================

-- This creates a test user you can chat with yourself
-- Email: test2@rideshare.com
-- Password: test123456

-- Note: You'll need to sign up this user through the app
-- Supabase doesn't allow creating auth users directly via SQL for security

-- Instead, do this:
-- 1. Sign out from the app
-- 2. Sign up with: test2@rideshare.com / test123456
-- 3. Complete the profile
-- 4. Post a few rides
-- 5. Sign back in as your main account
-- 6. Chat with test2's rides!

-- OR use this workaround to get the new user's ID after they sign up:
-- Run this to see all users:
SELECT 
  id,
  email,
  display_name,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- After you create test2 account, copy their ID and use it to create more dummy rides
-- Replace SECOND_USER_ID below with their actual ID:

/*
INSERT INTO rides (
  user_id, start_location, destination, date, time, status,
  taxi_preference, payment_method, max_passengers, description,
  event_type, event_name, is_event
) VALUES
  (
    'SECOND_USER_ID',
    '{"latitude": 32.0808, "longitude": 34.7742, "city": "Dizengoff", "cityId": "dizengoff", "address": "Dizengoff"}',
    '{"latitude": 32.1047, "longitude": 34.8028, "city": "Yarkon Park", "cityId": "yarkon-park", "address": "Yarkon Park"}',
    '2024-01-29', '20:00', 'active', 'Gett', 'Bit', 3,
    'Beach House concert! Looking for people from Dizengoff area 🎵',
    'concert', 'Beach House Live', true
  ),
  (
    'SECOND_USER_ID',
    '{"latitude": 32.1656, "longitude": 34.8433, "city": "Herzliya", "cityId": "herzliya", "address": "Herzliya"}',
    '{"latitude": 32.0114, "longitude": 34.8867, "city": "Ben Gurion Airport", "cityId": "ben-gurion-airport", "address": "Ben Gurion Airport"}',
    '2024-01-26', '10:00', 'active', 'Have a driver', 'Cash', 2,
    'Heading to airport from Herzliya, happy to share!',
    NULL, NULL, false
  );
*/

