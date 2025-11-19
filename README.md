# Ride Sharing MVP 🚗

A modern ride-sharing mobile app built for Israel, allowing users to share rides to concerts, events, or common destinations, splitting taxi costs and making travel more social and affordable.

![Tech Stack](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## ✨ Features

### 🔐 User Authentication & Profile
- Email/password authentication with Supabase
- Profile photo upload to cloud storage
- Location-based user profiles
- Interest management for personalized feed

### 🚕 Ride Posting & Discovery
- Post rides with start/destination locations via interactive maps
- Date and time selection for planned trips
- Taxi coordination preferences (GetTaxi, driver number, decide together)
- Optional ride descriptions

### 📱 Personalized Feed
- Rides sorted by user interests and proximity
- Time-based prioritization (soonest first)
- Filter by date range (Today, This Week, All)
- Distance-based relevance scoring

### 🤝 Smart Matching System
- Request to join rides
- Owner approval/decline workflow
- **Automatic meeting point calculation** - fair midpoint between riders
- Distance display to meeting point

### 💬 Real-time Chat
- Instant messaging with Supabase Realtime
- Chat opens after request approval
- Message history and timestamps
- Active conversation list

### 🗺️ Location Features
- Interactive map for ride visualization
- Meeting point marker display
- Route visualization with polylines
- Reverse geocoding for addresses

## 🛠 Tech Stack

- **Framework**: Expo SDK 52 with Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Yarn
- **State Management**: Zustand
- **Backend**: Supabase
  - PostgreSQL database
  - Authentication
  - Realtime subscriptions
  - Storage for photos
  - Row Level Security (RLS)
- **Maps**: React Native Maps
- **Navigation**: React Navigation v7

## 🎨 UI/UX Design

The app follows a premium dark-mode-first design with:
- **Matte black background** (#0A0A0A)
- **Pastel accent colors**: Yellow (#FFE66D), Mint Green (#A8E6CF), Off-white (#FFFEF7)
- **Rounded cards** with 20-28px radius
- **Generous spacing** (20-28px padding)
- **Clean sans-serif typography** with clear hierarchy
- **Soft shadows** for depth
- **Pill-shaped CTAs** in mint green

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Yarn package manager
- iOS Simulator (Mac) or Android Emulator
- Supabase account

### Quick Start

1. **Clone and install dependencies:**
```bash
cd /Users/isaac/RS
yarn install
```

2. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in SQL Editor
   - Run `supabase/realtime.sql` to enable realtime
   - Create `profile-photos` storage bucket (public)
   - Copy your project URL and anon key

3. **Configure environment:**
```bash
# Create .env file
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Start development server:**
```bash
yarn start
```

5. **Run on device:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📁 Project Structure

```
/app
  /(auth)               # Authentication flow
    login.tsx          # Login screen
    signup.tsx         # Sign up screen
    complete-profile.tsx # Profile completion
  /(tabs)              # Main app navigation
    index.tsx          # Feed screen
    post-ride.tsx      # Post ride screen
    chats.tsx          # Chat list
    profile.tsx        # User profile
  /ride
    [id].tsx           # Ride detail with meeting point
  /chat
    [id].tsx           # Chat conversation
/components
  RideCard.tsx         # Ride list item component
/stores
  authStore.ts         # Authentication state
  ridesStore.ts        # Rides and interests
  chatStore.ts         # Real-time chat
  requestsStore.ts     # Ride requests
/lib
  supabase.ts          # Supabase client
  midpoint.ts          # Geographic calculations
  format.ts            # Formatting utilities
/types
  database.ts          # TypeScript types
/constants
  colors.ts            # Color palette
  styles.ts            # Shared styles
/supabase
  schema.sql           # Database schema
  realtime.sql         # Realtime setup
  storage.sql          # Storage policies
```

## 🗄️ Database Schema

### Tables
- **profiles** - User information and location
- **rides** - Ride posts with start/destination
- **ride_requests** - Join requests with status
- **chat_messages** - Real-time messages
- **user_interests** - User preferences for feed

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Chat messages only visible to ride participants
- Profile photos stored with user-specific access

## 🚀 Key Features Explained

### Meeting Point Calculation
The app calculates a fair meeting point between the ride poster's start location and the requester's location using the geographic midpoint formula:

```typescript
// Calculates the midpoint between two coordinates
calculateMeetingPoint(posterStart, requesterLocation)
```

### Personalized Feed
Rides are scored based on:
1. **Interest matching** - Distance to user's saved places
2. **Time proximity** - Sooner rides score higher
3. **Radius filtering** - Within user's preferred distance

### Real-time Chat
Uses Supabase Realtime to:
- Subscribe to new messages instantly
- Update UI without polling
- Handle connection state automatically

## 🧪 Testing

### Manual Testing Flow

1. **Create Account**
   - Sign up with email/password
   - Upload profile photo
   - Set your location

2. **Post a Ride**
   - Go to "Post Ride" tab
   - Select locations on map
   - Set date/time
   - Choose taxi preference

3. **Browse & Request**
   - View feed (personalized if interests set)
   - Tap ride to see details
   - Request to join
   - View meeting point on map

4. **Chat**
   - Wait for approval
   - Go to "Chats" tab
   - Send messages in real-time

## 📱 Screenshots & Demo

(Screenshots would go here in production)

## 🔮 Future Enhancements

- [ ] Push notifications for requests and messages
- [ ] In-app GetTaxi/Gett integration
- [ ] Rating system for completed rides
- [ ] Profile verification badges
- [ ] Group rides (multiple passengers)
- [ ] Ride history and statistics
- [ ] Payment integration (if needed)
- [ ] Social features (friends, favorites)

## 🤝 Contributing

This is an MVP project. For improvements or bug fixes:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support & Troubleshooting

### Common Issues

**Maps not showing:**
- Check location permissions
- Verify react-native-maps installation
- On iOS: run `npx pod-install`

**Supabase errors:**
- Verify environment variables
- Check RLS policies are set up
- Ensure Realtime is enabled

**Build errors:**
- Clear cache: `yarn start --clear`
- Reset: `rm -rf node_modules && yarn install`

For more help, see [SETUP.md](./SETUP.md)

## 👥 Team

Built for the Israeli market, focusing on shared rides to concerts, events, and common destinations.

---

Made with ❤️ using Expo, TypeScript, and Supabase

