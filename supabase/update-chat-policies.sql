-- Update chat_messages RLS policies to allow chatting before approval
-- This allows users to chat with ride owners before committing to join

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages for rides they're involved in" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in rides they're involved in" ON chat_messages;

-- New policies: Allow viewing messages for any active ride
CREATE POLICY "Anyone can view messages for active rides" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE id = chat_messages.ride_id 
      AND status = 'active'
    )
  );

-- Allow sending messages if you're the owner OR interested in the ride
CREATE POLICY "Users can send messages in rides" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM rides 
      WHERE id = chat_messages.ride_id 
      AND status = 'active'
    )
  );

