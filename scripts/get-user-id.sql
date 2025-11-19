-- Run this in Supabase SQL Editor to get your user ID
-- Copy the result and use it in seed-dummy-data.ts

SELECT 
  id as user_id,
  email,
  display_name,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 1;

-- Copy the 'user_id' value from the result
-- It will look something like: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

