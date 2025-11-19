# Supabase Setup Guide

This directory contains SQL scripts to set up your Supabase database.

## Setup Steps

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   - Open the SQL Editor in your Supabase Dashboard
   - Copy and paste the contents of `schema.sql`
   - Run the script to create all tables, indexes, and RLS policies

3. **Enable Realtime**
   - In the SQL Editor, run the contents of `realtime.sql`
   - This enables real-time subscriptions for chat messages and ride requests

4. **Set Up Storage**
   - Go to Storage in your Supabase Dashboard
   - Create a new bucket named `profile-photos`
   - Make it public
   - Alternatively, run `storage.sql` in the SQL Editor

5. **Add Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

## Database Schema

### Tables

- **profiles** - User profile information
- **rides** - Ride posts with start/destination, date, time
- **ride_requests** - Join requests for rides
- **chat_messages** - Real-time messages between users
- **user_interests** - User preferences for personalized feed

### Security

All tables have Row Level Security (RLS) enabled with policies that ensure:
- Users can only modify their own data
- Users can view rides and profiles publicly
- Chat messages are only visible to ride participants
- Ride requests are only visible to involved parties

### Realtime

The following tables have real-time subscriptions enabled:
- `chat_messages` - For live chat updates
- `ride_requests` - For instant request notifications

## Storage Buckets

- **profile-photos** - Public bucket for user profile photos
  - Photos are organized by user ID
  - Users can only upload/update their own photos

