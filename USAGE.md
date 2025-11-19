# Usage Guide - Ride Sharing MVP

This guide walks you through using the app from a user's perspective.

## Getting Started

### 1. Sign Up

When you first open the app:
1. Tap "Sign Up"
2. Enter your display name
3. Enter your email
4. Create a password (min 6 characters)
5. Confirm password
6. Tap "Create Account"

### 2. Complete Your Profile

After signing up, you'll be prompted to:
1. **Add a profile photo** (optional but recommended)
   - Tap the circle to select a photo
   - Choose from your gallery
   - Photo is uploaded to Supabase Storage

2. **Set your location** (important for personalized feed)
   - The app will request location permissions
   - Your location is used to show nearby rides
   - Tap "Refresh Location" to update

3. Tap "Complete Profile" or "Skip for Now"

## Main Features

### 📱 Feed Screen

The main screen shows available rides:

**Filters:**
- **All** - Shows all active rides
- **Today** - Rides happening today
- **This Week** - Rides in the next 7 days

**Ride Cards Display:**
- Start location → Destination
- Date and time
- Taxi preference
- Description (if provided)
- Posted by name

**Personalized Feed:**
If you've added interests in your profile, rides are sorted by:
- How close they are to your interests
- How soon they're happening
- Distance from your location

**Tap a ride card** to see full details.

### ➕ Post a Ride

Share your trip with others:

1. **Set Start Location**
   - Default is your profile location
   - Tap "Change Location" to select on map
   - Tap anywhere on the map to set the location

2. **Set Destination**
   - Tap "Set Destination"
   - Tap on the map where you want to go

3. **Choose Date & Time**
   - Enter date in YYYY-MM-DD format
   - Enter time in HH:MM format (24-hour)

4. **Taxi Preference** (optional)
   Select how you'll get a taxi:
   - GetTaxi / Gett
   - Have driver number
   - Will decide together
   - Other

5. **Add Description** (optional)
   - Any additional details about your ride
   - Example: "Going to Coldplay concert"

6. **Tap "Post Ride"**

### 🗺️ Ride Details

When you tap on a ride, you'll see:

**Route Information:**
- Full start and destination addresses
- Date and time
- Taxi coordination plan
- Description

**Interactive Map:**
- Green marker: Start location
- Yellow marker: Destination
- Blue marker: Meeting point (after requesting)
- Yellow line: Route

**For Non-Owners:**
- "Request to Join" button
- After requesting: Request status (Pending/Approved/Declined)
- If approved: "Open Chat" button
- Meeting point shown on map

**For Ride Owners:**
- List of all requests
- Approve (✓) or Decline (✕) each request
- Chat with approved requesters

### 🤝 Requesting to Join

1. Open a ride you're interested in
2. Tap "Request to Join"
3. Your location is automatically included
4. **Meeting point is calculated** - fair midpoint between your location and the ride's start
5. Wait for owner approval

**What happens next:**
- **Pending**: Owner hasn't responded yet
- **Approved**: You can now chat with the owner
- **Declined**: Request was denied

### 💬 Chat

Real-time messaging with your ride partners:

**Accessing Chats:**
1. Go to "Chats" tab
2. See all rides you're part of
3. Tap to open conversation

**In a Chat:**
- Send messages instantly
- See when messages were sent
- Messages from you appear on the right (mint green)
- Messages from others appear on the left (gray)
- Pull down to refresh

**When can you chat?**
- After your request is approved
- If you're the ride owner, after approving requests

### 👤 Profile

Manage your account and preferences:

**Profile Photo:**
- Tap your photo to change it
- Upload from your device gallery

**Personal Info:**
- Display name (editable)
- Email (read-only)
- Location

**Location:**
- Used for meeting point calculations
- Used for personalizing feed
- Tap "Update Location" to refresh

**Interests:**
Add places you frequently travel to:
1. Tap "+ Add Interest"
2. Enter place name (e.g., "Tel Aviv")
3. Enter radius in km (e.g., 50)
4. Tap "Add"

**Why add interests?**
- Get a personalized feed
- See rides to places you care about first
- Better matching with other users

**Sign Out:**
- Scroll to bottom
- Tap "Sign Out"

## Example Scenarios

### Scenario 1: Going to a Concert

**As a Ride Poster:**
1. Go to "Post Ride"
2. Set start: Your home location
3. Set destination: Park HaYarkon (concert venue)
4. Date: Friday, 2025-01-20
5. Time: 18:00
6. Taxi preference: "GetTaxi / Gett"
7. Description: "Going to Coldplay concert. Meeting early to grab dinner!"
8. Post the ride

**As a Requester:**
1. Browse feed, see Coldplay concert ride
2. Tap on ride to see details
3. Check meeting point on map
4. Distance shown: "2.3km from your location"
5. Tap "Request to Join"
6. Wait for approval
7. Once approved, chat to coordinate details

### Scenario 2: Daily Commute

**Posting:**
1. Start: Rishon LeZion
2. Destination: Tel Aviv
3. Date: Monday-Friday
4. Time: 08:00
5. Preference: "Have driver number"
6. Description: "Regular commute, Mon-Fri"

**Setting up interests:**
1. Go to Profile
2. Add interest: "Tel Aviv"
3. Radius: 30km
4. Save

Now you'll see Tel Aviv rides prioritized in your feed!

### Scenario 3: Weekend Trip

**Using the meeting point:**
1. You're in Haifa
2. Friend is in Netanya
3. Both going to Jerusalem
4. Meeting point calculated: Caesarea (fair midpoint)
5. Meet at Caesarea, share taxi from there

## Tips & Best Practices

### For Better Experience:

1. **Complete your profile**
   - Add a photo (builds trust)
   - Set accurate location
   - Add interests for personalized feed

2. **Be specific in descriptions**
   - Mention landmarks
   - Include timing details
   - Note any special requirements

3. **Respond to requests promptly**
   - Check your rides regularly
   - Approve/decline quickly
   - Chat to coordinate

4. **Use chat effectively**
   - Confirm meeting point
   - Share contact info if needed
   - Discuss taxi payment method

5. **Plan ahead**
   - Post rides in advance
   - Browse regularly
   - Set up interests

### Payment Methods in Israel:

The app doesn't handle payments. Common methods:
- **Bit** - Israeli instant payment
- **PayBox** - Payment app
- **Cash** - Split fare evenly

Discuss payment in chat before the ride!

## Privacy & Safety

**Location Privacy:**
- Your exact location is never shared publicly
- Only meeting points are shown
- You control when to update your location

**Chat Privacy:**
- Only approved participants can see messages
- Chats are private to each ride
- No group-wide messaging

**Best Practices:**
- Meet in public places
- Share trip details with someone
- Verify ride details before meeting
- Use the chat for coordination

## Troubleshooting

**"No rides found":**
- Change filter from "Today" to "All"
- Add interests to see more relevant rides
- Check back later

**Can't see meeting point:**
- Make sure you've requested to join
- Check your location is set in profile
- Owner must have posted start location

**Chat not working:**
- Ensure request is approved
- Check internet connection
- Try refreshing (pull down)

**Location not updating:**
- Grant location permissions in settings
- Tap "Refresh Location"
- Restart the app if needed

## Support

For issues or questions:
- Check the README.md
- Review SETUP.md for configuration
- Ensure Supabase is properly configured

---

Enjoy sharing rides and saving on travel costs! 🚗💨

