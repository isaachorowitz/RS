-- Enable Realtime for specific tables
-- Run these commands in the Supabase Dashboard SQL Editor

-- Enable Realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Enable Realtime for ride_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE ride_requests;

-- Note: After running these commands, the tables will broadcast changes in real-time
-- You can listen to changes using Supabase's realtime subscriptions in your app

