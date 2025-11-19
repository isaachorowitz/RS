# Ride Sharing MVP - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Yarn package manager installed
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app (optional, for physical device testing)
- Supabase account

## Step 1: Install Dependencies

```bash
cd /Users/isaac/RS
yarn install
```

## Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in your project details
   - Wait for the database to be created

2. **Run Database Schema**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Open and run `supabase/schema.sql`
   - This creates all tables with RLS policies

3. **Enable Realtime**
   - In SQL Editor, run `supabase/realtime.sql`
   - This enables real-time subscriptions for chat and requests

4. **Set Up Storage**
   - Go to Storage section in Supabase dashboard
   - Create a new bucket named `profile-photos`
   - Make it public
   - Alternatively, run `supabase/storage.sql` in SQL Editor

5. **Get Your Credentials**
   - Go to Settings > API
   - Copy your project URL and anon/public key

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Start the Development Server

```bash
yarn start
```

This will start the Expo development server. You'll see options to:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your phone

## Step 5: Test the App

### Create Test Accounts

1. Sign up with a test email and password
2. Complete your profile (add photo and location)
3. Set up interests (places you frequently travel to)

### Test Features

**Post a Ride:**
1. Go to "Post Ride" tab
2. Select start location and destination on map
3. Set date and time
4. Choose taxi preference
5. Post the ride

**Browse Rides:**
1. Go to "Feed" tab
2. See rides personalized to your interests
3. Use filters (All, Today, This Week)
4. Tap on a ride to view details

**Request to Join:**
1. View ride details
2. Tap "Request to Join"
3. Wait for owner approval

**Chat:**
1. Once request is approved, go to "Chats" tab
2. See active conversations
3. Send messages in real-time

## Architecture Overview

### Tech Stack
- **Framework**: Expo SDK 54 with Expo Router
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Maps**: React Native Maps
- **Navigation**: File-based routing with Expo Router

### Project Structure

```
/app                    # Expo Router screens
  /(auth)              # Authentication flow
  /(tabs)              # Main app tabs
  /ride                # Ride detail screens
  /chat                # Chat screens
/components            # Reusable UI components
/stores                # Zustand state stores
/lib                   # Utilities and helpers
/types                 # TypeScript type definitions
/constants             # Colors, styles, config
/hooks                 # Custom React hooks
/supabase              # Database schema and setup
```

### Key Features

1. **User Authentication**
   - Email/password signup and login
   - Profile completion with photo upload
   - Location-based user profiles

2. **Ride Posting**
   - Interactive map for location selection
   - Date/time picker
   - Taxi preference options
   - Optional description

3. **Personalized Feed**
   - Rides sorted by user interests
   - Time proximity scoring
   - Filter by date range

4. **Matching System**
   - Request to join rides
   - Owner approval/decline
   - Automatic meeting point calculation

5. **Real-time Chat**
   - Supabase Realtime subscriptions
   - Instant message delivery
   - Chat list with last message preview

6. **Meeting Point Calculation**
   - Geographic midpoint between users
   - Distance calculation
   - Map visualization

## Troubleshooting

### Maps Not Showing
- Make sure you have location permissions enabled
- Check that react-native-maps is properly installed
- On iOS, you may need to run `npx pod-install`

### Supabase Connection Issues
- Verify your `.env` file has correct credentials
- Check that RLS policies are set up correctly
- Ensure Realtime is enabled for chat_messages and ride_requests

### Build Errors
- Clear cache: `yarn start --clear`
- Reinstall dependencies: `rm -rf node_modules && yarn install`
- Reset Metro bundler: `yarn start --reset-cache`

## Deployment

### iOS (TestFlight)
```bash
eas build --platform ios
eas submit --platform ios
```

### Android (Google Play)
```bash
eas build --platform android
eas submit --platform android
```

For detailed deployment instructions, see the [Expo documentation](https://docs.expo.dev/distribution/introduction/).

## Next Steps

- Add push notifications for new requests and messages
- Implement in-app taxi booking integration
- Add rating system for completed rides
- Enhance map with route visualization
- Add profile verification features
- Implement payment integration (if needed in future)

## Support

For issues or questions:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. Review [Supabase documentation](https://supabase.com/docs)
3. Check the README.md for additional information

