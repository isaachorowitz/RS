-- First, update the rides table schema
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT FALSE;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Create some dummy users (you'll need to create these via the app first, then note their IDs)
-- For now, I'll show example data structure

-- Example INSERT for a concert ride
-- Replace USER_ID_HERE with actual user ID from auth.users
/*
INSERT INTO rides (
  user_id,
  start_location,
  destination,
  date,
  time,
  status,
  taxi_preference,
  payment_method,
  max_passengers,
  description,
  event_type,
  event_name,
  is_event
) VALUES (
  'USER_ID_HERE',
  '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
  '{"latitude": 32.1047, "longitude": 34.8028, "city": "Yarkon Park", "cityId": "yarkon-park", "address": "Yarkon Park"}',
  '2024-01-25',
  '19:00',
  'active',
  'Gett',
  'Bit',
  3,
  'Going to see Coldplay! Let''s share a ride from the city center',
  'concert',
  'Coldplay Concert',
  true
);

INSERT INTO rides (
  user_id,
  start_location,
  destination,
  date,
  time,
  status,
  taxi_preference,
  payment_method,
  max_passengers,
  description,
  event_type,
  event_name,
  is_event
) VALUES (
  'USER_ID_HERE',
  '{"latitude": 32.0719, "longitude": 34.8242, "city": "Ramat Gan", "cityId": "ramat-gan", "address": "Ramat Gan"}',
  '{"latitude": 32.0628, "longitude": 34.7558, "city": "Bloomfield Stadium", "cityId": "bloomfield-stadium", "address": "Bloomfield Stadium"}',
  '2024-01-26',
  '20:30',
  'active',
  'Have a driver',
  'Cash',
  3,
  'Maccabi vs Hapoel match! Who''s coming?',
  'soccer',
  'Maccabi Tel Aviv vs Hapoel',
  true
);

-- Regular ride example
INSERT INTO rides (
  user_id,
  start_location,
  destination,
  date,
  time,
  status,
  taxi_preference,
  payment_method,
  max_passengers,
  description,
  is_event
) VALUES (
  'USER_ID_HERE',
  '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
  '{"latitude": 32.0114, "longitude": 34.8867, "city": "Ben Gurion Airport", "cityId": "ben-gurion-airport", "address": "Ben Gurion Airport"}',
  '2024-01-24',
  '14:00',
  'active',
  'Gett',
  'Split evenly',
  2,
  'Flight at 17:00, leaving early to avoid traffic',
  false
);
*/

