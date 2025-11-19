-- Seed Dummy Rides
-- STEP 1: Get your user ID by running this query first:
-- SELECT id, email FROM profiles LIMIT 1;

-- STEP 2: Replace 'YOUR_USER_ID_HERE' below with the actual ID from step 1
-- STEP 3: Run this entire script

-- Concert at Yarkon Park
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
  '{"latitude": 32.1047, "longitude": 34.8028, "city": "Yarkon Park", "cityId": "yarkon-park", "address": "Yarkon Park"}',
  '2024-01-27',
  '19:00',
  'active',
  'Gett',
  'Bit',
  3,
  'Going to see Coldplay! Let''s share a ride from the city center 🎸',
  'concert',
  'Coldplay Concert',
  true
);

-- Soccer at Bloomfield Stadium
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0719, "longitude": 34.8242, "city": "Ramat Gan", "cityId": "ramat-gan", "address": "Ramat Gan"}',
  '{"latitude": 32.0628, "longitude": 34.7558, "city": "Bloomfield Stadium", "cityId": "bloomfield-stadium", "address": "Bloomfield Stadium"}',
  '2024-01-26',
  '20:30',
  'active',
  'Have a driver',
  'Cash',
  3,
  'Maccabi vs Hapoel match! Who''s coming? ⚽',
  'soccer',
  'Maccabi Tel Aviv vs Hapoel',
  true
);

-- Airport ride
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
  '{"latitude": 32.0114, "longitude": 34.8867, "city": "Ben Gurion Airport", "cityId": "ben-gurion-airport", "address": "Ben Gurion Airport"}',
  '2024-01-24',
  '14:00',
  'active',
  'Gett',
  'Split evenly',
  2,
  'Flight at 17:00, leaving early to avoid traffic ✈️',
  false
);

-- Concert at Menorah Arena
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0578, "longitude": 34.7619, "city": "Neve Tzedek", "cityId": "neve-tzedek", "address": "Neve Tzedek"}',
  '{"latitude": 32.0564, "longitude": 34.7936, "city": "Menorah Arena", "cityId": "menorah-arena", "address": "Menorah Arena"}',
  '2024-01-28',
  '21:00',
  'active',
  'Decide together',
  'PayBox',
  3,
  'Hip hop show tonight! Looking for ride buddies 🎤',
  'concert',
  'Hip Hop Night',
  true
);

-- Dinner in Jaffa
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
  '{"latitude": 32.0543, "longitude": 34.7516, "city": "Jaffa", "cityId": "jaffa", "address": "Jaffa"}',
  '2024-01-25',
  '20:00',
  'active',
  'Gett',
  'Bit',
  3,
  'Dinner in Old Jaffa, anyone want to split a ride? 🍽️',
  false
);

-- Tel Aviv Port
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0547, "longitude": 34.7675, "city": "Florentin", "cityId": "florentin", "address": "Florentin"}',
  '{"latitude": 32.1097, "longitude": 34.7997, "city": "Tel Aviv Port", "cityId": "tel-aviv-port", "address": "Tel Aviv Port"}',
  '2024-01-26',
  '18:00',
  'active',
  'Decide together',
  'Split evenly',
  2,
  'Sunset at the port 🌅',
  false
);

-- Sarona Market lunch
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0808, "longitude": 34.7742, "city": "Dizengoff", "cityId": "dizengoff", "address": "Dizengoff"}',
  '{"latitude": 32.0722, "longitude": 34.7864, "city": "Sarona Market", "cityId": "sarona-market", "address": "Sarona Market"}',
  '2024-01-27',
  '12:30',
  'active',
  'Gett',
  'Cash',
  2,
  'Lunch at Sarona, anyone from Dizengoff area?',
  false
);

-- Rishon LeZion commute
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
  'YOUR_USER_ID_HERE',
  '{"latitude": 32.0853, "longitude": 34.7818, "city": "Tel Aviv Center", "cityId": "tel-aviv-center", "address": "Tel Aviv Center"}',
  '{"latitude": 31.9642, "longitude": 34.8053, "city": "Rishon LeZion", "cityId": "rishon-lezion", "address": "Rishon LeZion"}',
  '2024-01-25',
  '09:00',
  'active',
  'Have a driver',
  'Split evenly',
  3,
  'Daily commute to Rishon, open to carpooling regularly',
  false
);

