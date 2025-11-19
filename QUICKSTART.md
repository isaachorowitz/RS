# Quick Start Guide - Ride Sharing MVP

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Yarn installed globally: `npm install -g yarn`
- iOS Simulator (Mac) or Android Studio (Android Emulator)
- Supabase account (free tier works)

## Step 1: Install Dependencies (2 min)

```bash
cd /Users/isaac/RS
yarn install
```

This installs all required packages:
- Expo SDK 52
- React Navigation
- Supabase client
- Zustand for state
- React Native Maps
- TypeScript dependencies

## Step 2: Supabase Setup (2 min)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization/create one
4. Name: "ride-sharing" (or your choice)
5. Password: Create a strong password
6. Region: Choose closest to Israel
7. Click "Create new project"
8. Wait 2 minutes for setup

### Run SQL Scripts
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Repeat for `supabase/realtime.sql`

### Create Storage Bucket
1. Go to **Storage** in sidebar
2. Click "New bucket"
3. Name: `profile-photos`
4. **Public bucket**: YES
5. Click "Create bucket"

### Get API Credentials
1. Go to **Settings** > **API**
2. Copy **Project URL**
3. Copy **anon/public** key

## Step 3: Configure App (1 min)

Create `.env` file:

```bash
# In /Users/isaac/RS directory
cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

Replace with your actual values!

## Step 4: Start App (30 sec)

```bash
yarn start
```

This opens the Expo Dev Tools.

**For iOS:**
```bash
# Press 'i' in terminal
# or
yarn ios
```

**For Android:**
```bash
# Press 'a' in terminal
# or
yarn android
```

**For Physical Device:**
1. Install "Expo Go" from App Store/Play Store
2. Scan the QR code shown in terminal

## Step 5: Test the App (2 min)

### Create First Account
1. Tap "Sign Up"
2. Name: Test User
3. Email: test@example.com
4. Password: test123
5. Confirm password
6. Tap "Create Account"

### Complete Profile
1. Tap circle to add photo (or skip)
2. Location should auto-detect
3. Tap "Complete Profile"

### Post Your First Ride
1. Go to "Post Ride" tab (+ icon)
2. Start location shows your current location
3. Tap "Set Destination"
4. Tap anywhere on map
5. Enter today's date: 2024-01-20
6. Enter time: 18:00
7. Select taxi preference
8. Tap "Post Ride"

### Browse Feed
1. Go to "Feed" tab (home icon)
2. See your ride listed
3. Tap on it to see details
4. View on map

**To test full flow, create a second account on another device/simulator and request to join!**

## Troubleshooting

### "Cannot connect to Supabase"
Check your `.env` file has correct values. Restart expo: `yarn start --clear`

### "Maps not loading"
Grant location permissions in iOS Settings > Privacy > Location Services

### Build errors
```bash
# Clear everything and reinstall
rm -rf node_modules
yarn install
yarn start --clear
```

### iOS specific
```bash
# If maps don't work on iOS
cd ios
pod install
cd ..
yarn ios
```

## What's Next?

1. **Add interests** in Profile to personalize your feed
2. **Post rides** to concerts, events, or work commutes
3. **Request to join** other rides
4. **Chat** with matched riders
5. **View meeting points** on the map

## Common Commands

```bash
# Start development server
yarn start

# Start with cache cleared
yarn start --clear

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Check TypeScript errors
npx tsc --noEmit

# Install new package
yarn add package-name
```

## Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed setup guide
- **USAGE.md** - Feature walkthrough
- **PROJECT_SUMMARY.md** - Technical details

## Support

Having issues? Check:
1. Node version: `node -v` (should be 18+)
2. Yarn version: `yarn -v`
3. Expo version: Look in package.json
4. Supabase project is active
5. Environment variables are set

## Production Deployment

When ready to deploy:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

**You're all set! Start sharing rides! 🚗💨**

