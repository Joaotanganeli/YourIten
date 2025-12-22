# New Landing Page & Game Detail Pages - Setup Guide

## 🎮 What Was Created

### 1. **Modern Landing Page** (`/`)
- Hero carousel with promotional slides
- Game selection grid with card layout
- Clean, modern design matching your reference images
- Responsive layout for all screen sizes

### 2. **Game Detail Pages** (`/games/[gameId]`)
- Category sidebar navigation
- **Hot Offers** section (featured services)
- **Popular This Week** section (trending services)
- All services grid with filtering
- Buy now buttons for each service

### 3. **Database Enhancements**
- Added featured/hot offer flags
- Weekly order tracking
- View counts and statistics
- Game categories table

---

## 📦 Database Migration Required

**IMPORTANT:** Run this SQL script to add the new features:

```bash
# Connect to your PostgreSQL database
psql -U postgres -d youriten_db

# Run the migration
\i database/migrations/002_add_featured_and_stats.sql
```

### What the Migration Does:

1. **Adds columns to `fixed_services` table:**
   - `is_featured` - Mark services as featured
   - `is_hot_offer` - Mark services for "Hot Offers" section
   - `view_count` - Track how many times viewed
   - `order_count` - Total orders ever
   - `weekly_order_count` - Orders this week (for "Popular" section)
   - `display_order` - Control display order

2. **Creates `game_categories` table:**
   - Stores game information for landing page
   - Includes images, banners, icons
   - Tracks total offers per game

3. **Seeds game data:**
   - League of Legends
   - Valorant
   - Dota 2
   - Deadlock
   - Clash Royale
   - Arc Raiders

4. **Marks some services as hot offers** (automatically)

---

## 🎨 New Pages Structure

### Landing Page (`/`)
```
┌─────────────────────────────────────┐
│     Hero Carousel (Promotional)     │
│  - Christmas Sale / New Season      │
│  - Auto-rotating slides             │
└─────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│  LoL     │ Valorant │  Dota 2  │ Deadlock │
│  150     │  120     │   80     │   60     │
│  offers  │  offers  │  offers  │  offers  │
└──────────┴──────────┴──────────┴──────────┘

┌──────────────┬──────────────┬──────────────┐
│ Clash Royale │ Arc Raiders  │              │
│   45 offers  │  30 offers   │              │
└──────────────┴──────────────┴──────────────┘
```

### Game Detail Page (`/games/league_of_legends`)
```
┌─────────────────────────────────────────────┐
│  League of Legends Boosting and Coaching    │
└─────────────────────────────────────────────┘

┌──────────┐  ┌─────────────────────────────┐
│Categories│  │   🔥 Hot Offers             │
│          │  │  ┌────┬────┬────┬────┬────┐ │
│All       │  │  │ LoL│ RP │Elo │Plac│Win │ │
│Elo Boost │  │  │Acct│    │Bst │Mtch│Bst │ │
│Duo Boost │  │  └────┴────┴────┴────┴────┘ │
│Placement │  │                              │
│Coaching  │  │   ⭐ Popular This Week       │
│          │  │  ┌────┬────┬────┬────┬────┐ │
│          │  │  │Btl │Win │Cch │Mst │Acc │ │
│          │  │  │Pass│Bst │    │Bst │Lvl │ │
│          │  │  └────┴────┴────┴────┴────┘ │
│          │  │                              │
│          │  │   All Services               │
│          │  │  [Service List Grid]         │
└──────────┘  └─────────────────────────────┘
```

---

## 🔧 Files Created/Modified

### New Files:
1. **`database/migrations/002_add_featured_and_stats.sql`** - Database migration
2. **`src/app/api/games/route.ts`** - API endpoint for game categories
3. **`src/app/games/[gameId]/page.tsx`** - Game detail page component

### Modified Files:
1. **`src/app/page.tsx`** - New landing page design
2. **`src/types/index.ts`** - Added new fields to FixedService type

---

## 🎯 How It Works

### Landing Page Flow:
1. User visits `/`
2. Sees hero carousel with promotional content
3. Clicks on a game card (e.g., "League of Legends")
4. Redirects to `/games/league_of_legends`

### Game Detail Page Flow:
1. Loads all services for selected game
2. Filters services marked as `is_hot_offer = true` → Shows in "Hot Offers"
3. Sorts by `weekly_order_count` → Shows in "Popular This Week"
4. User can filter by category (sidebar)
5. Click "Buy now" → Redirects to purchase flow

### Data Flow:
```
PostgreSQL Database
    ↓
API Endpoints (/api/games, /api/services)
    ↓
API Client (automatic type conversion)
    ↓
React Components (Landing Page, Game Detail)
    ↓
User Interface
```

---

## 📊 Managing Featured Services

### Mark a Service as Hot Offer:
```sql
UPDATE fixed_services 
SET is_hot_offer = true 
WHERE id = 'service-uuid-here';
```

### Mark a Service as Featured:
```sql
UPDATE fixed_services 
SET is_featured = true 
WHERE id = 'service-uuid-here';
```

### Update Weekly Order Count (for Popular section):
```sql
UPDATE fixed_services 
SET weekly_order_count = weekly_order_count + 1 
WHERE id = 'service-uuid-here';
```

### Reset Weekly Stats (run every Monday):
```sql
SELECT reset_weekly_stats();
```

---

## 🎨 Customization

### Change Hero Slides:
Edit `src/app/page.tsx` around line 43:
```typescript
const heroSlides = [
  {
    title: 'YOUR TITLE',
    subtitle: 'Your subtitle',
    image: 'https://your-image-url.com',
    cta: 'Button Text'
  }
]
```

### Change Game Images:
Update in database:
```sql
UPDATE game_categories 
SET image_url = 'https://new-image-url.com',
    banner_url = 'https://new-banner-url.com'
WHERE id = 'league_of_legends';
```

### Add New Game:
```sql
INSERT INTO game_categories (id, name, description, image_url, banner_url, icon_name, total_offers, display_order)
VALUES ('new_game', 'New Game', 'Description', 'image-url', 'banner-url', 'Gamepad2', 0, 7);
```

---

## ✅ Testing Checklist

After running the migration:

1. **Landing Page:**
   - [ ] Visit `/` - Should see hero carousel
   - [ ] See all 6 game cards
   - [ ] Click on a game card - Should navigate to game detail page

2. **Game Detail Page:**
   - [ ] Visit `/games/league_of_legends`
   - [ ] See "Hot Offers" section (if services marked as hot)
   - [ ] See "Popular This Week" section
   - [ ] See "All Services" section
   - [ ] Click category filters - Should filter services
   - [ ] Click "Buy now" - Should redirect to purchase flow

3. **Database:**
   - [ ] Check `game_categories` table has 6 games
   - [ ] Check `fixed_services` has new columns
   - [ ] Some services marked as `is_hot_offer = true`

---

## 🚀 Next Steps

1. **Run the migration** (see above)
2. **Test the landing page** at `/`
3. **Test game detail pages** at `/games/[gameId]`
4. **Mark your best services** as hot offers
5. **Update weekly stats** regularly for accurate "Popular" section
6. **Customize hero slides** with your own promotional content
7. **Add more services** through Admin Dashboard

---

## 💡 Tips

- **Hot Offers:** Mark 3-5 of your best-selling services as hot offers
- **Popular Section:** Updates automatically based on `weekly_order_count`
- **Images:** Use high-quality game images for better visual appeal
- **Categories:** Add more categories in the game detail page as needed
- **Weekly Reset:** Set up a cron job to reset weekly stats every Monday

---

## 🐛 Troubleshooting

**Issue:** Games not showing on landing page
- **Fix:** Run the migration script to create `game_categories` table

**Issue:** Hot Offers section empty
- **Fix:** Mark some services: `UPDATE fixed_services SET is_hot_offer = true WHERE ...`

**Issue:** Popular section empty
- **Fix:** Update weekly counts: `UPDATE fixed_services SET weekly_order_count = 10 WHERE ...`

**Issue:** TypeScript errors
- **Fix:** Already fixed - `FixedService` type updated with new fields

---

## 📝 Summary

You now have:
✅ Modern landing page with game selection
✅ Detailed game pages with hot offers and popular sections
✅ Database structure for tracking featured services
✅ Clean, responsive design matching your reference images
✅ Full PostgreSQL integration

All data is stored in the database and can be managed through SQL or the Admin Dashboard!
