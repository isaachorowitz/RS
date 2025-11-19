# Database Update Required

## Add New Columns to Rides Table

To support the new features (events, payment methods), you need to add some columns to the `rides` table.

### Option 1: Run in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tgmogzxnnlepuheaorfo
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the following SQL:

```sql
-- Add new fields to rides table for events and payment
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT FALSE;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add index for event queries
CREATE INDEX IF NOT EXISTS idx_rides_is_event ON rides(is_event) WHERE is_event = true;
```

5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned"

### Option 2: Use Supabase CLI

If you have Supabase CLI installed:

```bash
cd /Users/isaac/RS
supabase db push
```

## After Running the Migration

The app will now support:
- ✅ Event-based rides (concerts, soccer games, etc.)
- ✅ Payment method selection (Bit, PayBox, Cash)
- ✅ Better taxi options (Gett, Have driver, Decide together)
- ✅ City-based locations (Tel Aviv metro area)

## Create Dummy Data

After the migration, you can populate some dummy rides:

1. Create an account in the app (if you haven't already)
2. Go to Supabase Dashboard > Authentication > Users
3. Copy your User ID
4. Open `scripts/seed-dummy-data.ts`
5. Replace `YOUR_USER_ID_HERE` with your actual user ID
6. Run: `npx ts-node scripts/seed-dummy-data.ts`

This will create 8 dummy rides including:
- Coldplay concert at Yarkon Park 🎵
- Soccer match at Bloomfield Stadium ⚽
- Airport rides ✈️
- Dinner in Jaffa 🍽️
- And more!

## Verify Everything Works

After running the migration and seeding data:

1. Open the app
2. Go to "Post Ride" - you should see the new UI with event toggle
3. Go to "Feed" - you should see the dummy rides
4. Event rides should have special styling (yellow border, event badge)
5. Click on a ride to see full details

---

**Need help?** Check the Supabase Dashboard logs if something doesn't work.

