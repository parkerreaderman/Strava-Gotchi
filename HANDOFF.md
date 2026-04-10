# Sporty Gotchi - Project Handoff Document

## Project Overview

**Sporty Gotchi** is a fitness Tamagotchi web application that connects to Strava to gamify workout tracking. Users earn XP, level up, complete challenges, maintain streaks, and watch their character evolve based on their fitness progress.

**Tech Stack:**
- Next.js 16.0.3 (App Router)
- React 19.2.0
- TypeScript 5
- Prisma ORM with SQLite
- Tailwind CSS 4
- Vitest for testing

---

## Current Implementation Status

### Completed Features

#### Core Infrastructure
- [x] Strava OAuth authentication with httpOnly cookies
- [x] Activity syncing from Strava API
- [x] Training metrics calculation (CTL, ATL, TSB)
- [x] 5 fatigue states (Fresh, Optimal, Trained, Fatigued, Overtrained)
- [x] Database persistence with Prisma

#### Gamification System (Sprint 1-5, 7)
- [x] XP calculation based on duration + TSS + streak multiplier
- [x] Level system (1-100) with progression formula
- [x] Streak tracking with 36-hour grace period
- [x] Streak freezes (earned every 7 days, max 3 stored)
- [x] Achievement system with 20+ achievements across 5 categories
- [x] Daily/Weekly challenge generation
- [x] Recovery tracking (auto-detect + manual logging)
- [x] Evolution stages (1-5) based on level + CTL

#### UI Components
- [x] Character display with pixel art fatigue states (PixelCharacter component)
- [x] Wearable customization (hats, shirts, shorts, shoes)
- [x] Level display with XP progress bar
- [x] Streak display with flame animation
- [x] Achievement grid with unlock status
- [x] Achievement toast notifications
- [x] Challenge cards with progress tracking
- [x] Recovery meter with rest day logging
- [x] Training graph visualization
- [x] Gamification sidebar panel
- [x] Pixel art backgrounds (6 environments)

#### Rate Limiting & Caching (Latest Session)
- [x] Client-side rate limiting (10s minimum between requests)
- [x] Client-side response caching (5 minutes)
- [x] Retry with exponential backoff
- [x] Server-side caching (1 minute per user)
- [x] Rate limit status display in UI
- [x] Graceful 429 error handling
- [x] Manual rate limit state clearing (for stuck states)

#### Database Persistence (Latest Session)
- [x] Prisma ORM with SQLite integration
- [x] User and StravaToken models for OAuth persistence
- [x] Activity caching with checksum-based change detection
- [x] Automatic token refresh and persistence
- [x] Reuse cached activities when unchanged (checksum comparison)
- [x] Database-first caching strategy (serves from DB when available)

### Partially Implemented Features

#### Multi-Provider Support (Sprint 6)
- [x] Database schema ready (`ConnectedProvider` model exists)
- [ ] Provider abstraction layer implementation
- [ ] Garmin API integration
- [ ] COROS API integration
- [ ] Apple Health integration
- [ ] Provider switching UI

### Pending Features

#### Pixel Art Enhancements (Sprint 0 - Optional)
- [x] Pixel art character component (PixelCharacter) ✅ **COMPLETED**
- [x] Pixel art backgrounds (6 environments) ✅ **COMPLETED**
- [ ] Additional pixel art sprite sheets for more animation frames
- [ ] Pixel art wearables as overlay sprites (currently SVG)
- [ ] Enhanced pixel art animations (more frame variety)

---

## Directory Structure

```
sporty_gotchi/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # OAuth callback handler
│   │   │   └── strava/route.ts       # OAuth initiation
│   │   ├── gamification/
│   │   │   ├── achievements/route.ts # Achievement checking & awarding
│   │   │   ├── challenges/route.ts   # Daily/weekly challenge generation
│   │   │   ├── recovery/route.ts     # Recovery status & rest day logging
│   │   │   ├── stats/route.ts        # User gamification stats
│   │   │   └── streak/route.ts       # Streak management
│   │   ├── health/route.ts           # Health check endpoint
│   │   └── strava/
│   │       ├── activities/route.ts   # Activity fetching with caching
│   │       └── bootstrap/route.ts    # Initial data bootstrap
│   ├── policies/                     # Legal pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Main dashboard
│
├── components/
│   ├── AchievementGrid.tsx           # Achievement display grid
│   ├── AchievementToast.tsx          # Achievement unlock notification
│   ├── ChallengeCard.tsx             # Challenge progress card
│   ├── EvolutionProgress.tsx         # Evolution stage display
│   ├── GamificationPanel.tsx         # Sidebar with all gamification UI
│   ├── LevelDisplay.tsx              # Level & XP progress bar
│   ├── Locker.tsx                    # Wearable customization
│   ├── RecoveryMeter.tsx             # Recovery status display
│   ├── RestDayLogger.tsx             # Manual rest day logging
│   ├── SetupScreen.tsx               # User profile setup
│   ├── SportyGotchi.tsx              # Main character component
│   ├── StreakDisplay.tsx             # Streak counter with flame
│   ├── TrainingGraph.tsx             # CTL/ATL/TSB visualization
│   ├── pixel/                        # Pixel art components (partial)
│   └── wearables/                    # Wearable SVG components
│
├── hooks/
│   └── useGamification.ts            # Gamification state management hook
│
├── lib/
│   ├── api-utils.ts                  # Rate limiting & caching utilities
│   ├── logger.ts                     # Logging utility
│   ├── prisma.ts                     # Prisma client singleton
│   ├── strava-activities.ts          # Strava activity processing
│   ├── training-metrics.ts           # CTL/ATL/TSB calculation
│   └── gamification/
│       ├── achievement-checker.ts    # Achievement definitions & checking
│       ├── challenge-manager.ts      # Challenge generation logic
│       ├── evolution-manager.ts      # Evolution stage calculation
│       ├── index.ts                  # Gamification exports
│       ├── recovery-tracker.ts       # Recovery detection
│       ├── streak-manager.ts         # Streak calculation
│       └── xp-calculator.ts          # XP formulas
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Database seeding
│   └── migrations/                   # Database migrations
│
└── public/
    └── sprites/                      # Pixel art assets (placeholder)
```

---

## Key Files Modified in Latest Session

### Prisma Integration & Activity Caching (Most Recent)

1. **`prisma/schema.prisma`**
   - Added `User`, `StravaToken`, and `Activity` models
   - Activity model includes `checksum` field for change detection
   - `Activity.xpEarned` tracks XP per activity
   - `ConnectedProvider` model for future multi-provider support

2. **`lib/prisma.ts`** (NEW FILE)
   - Prisma client singleton with development logging
   - Prevents multiple client instances in development

3. **`app/api/auth/callback/route.ts`**
   - Persists user data to database on OAuth callback
   - Stores Strava tokens in `StravaToken` table
   - Sets `strava_athlete_id` cookie for user identification

4. **`app/api/strava/activities/route.ts`**
   - Integrated Prisma for activity persistence
   - Checksum-based change detection (only updates if activity changed)
   - Database-first caching (serves from DB when available)
   - Automatic token refresh and persistence
   - Syncs activities to database on fetch
   - Returns `source: 'cache' | 'strava'` in response

5. **`lib/strava-activities.ts`** (NEW FILE)
   - Activity processing utilities
   - Checksum calculation (`hashSummary`)
   - Type-safe Strava activity parsing

### Rate Limiting Fix (Previous Session)

6. **`lib/api-utils.ts`**
   - Client-side rate limiting with 10-second minimum interval
   - Response caching with 5-minute TTL
   - `fetchWithRetry()` with exponential backoff
   - Rate limit state tracking
   - `clearRateLimitState()` function for manual reset

7. **`app/page.tsx`**
   - Integrated `fetchWithRetry` from api-utils
   - Added `rateLimitInfo` and `isRateLimited` state
   - Rate limit status display in header
   - Yellow warning UI for rate limit errors
   - "Clear Rate Limit" button for stuck states
   - Fixed infinite loop bug with `useRef` for gamification refresh
   - Added `hasFetchedRef` to prevent duplicate fetches

### OAuth Fix (Previous Session)

4. **`app/api/auth/callback/route.ts`**
   - Changed `secure: true` to `secure: isProduction`
   - Fixes cookies not being set on http://localhost

### Type Fixes (Previous Session)

5. **`hooks/useGamification.ts`**
   - Fixed `Challenge.requirement.type` to union type
   - Fixed `Achievement.earnedAt` from `string | null` to `string | undefined`
   - Added `claimed` property to Challenge

6. **`components/GamificationPanel.tsx`**
   - Added optional chaining for `challenges?.daily`
   - Fixed prop names for child components

---

## Database Schema

**Note:** This is a simplified overview. See `prisma/schema.prisma` for the complete schema.

### Core Models

```prisma
model User {
  id               Int           @id @default(autoincrement())
  stravaAthleteId  Int           @unique
  firstName        String?
  lastName         String?
  profileMediumUrl String?
  profileUrl       String?
  // Gamification fields
  xp               Int           @default(0)
  level            Int           @default(1)
  currentStreak    Int           @default(0)
  longestStreak    Int           @default(0)
  lastActivityDate DateTime?
  totalActivities  Int           @default(0)
  totalDistance    Float         @default(0)
  totalDuration    Int           @default(0)
  evolutionStage   Int           @default(1)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  // Relations
  token            StravaToken?
  activities       Activity[]
  achievements     UserAchievement[]
  challenges       UserChallenge[]
  restDays         RestDay[]
  streakFreezes    StreakFreeze[]
  connectedProviders ConnectedProvider[]
}

model StravaToken {
  id           Int      @id @default(autoincrement())
  userId       Int      @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken  String
  refreshToken String
  expiresAt    Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Activity {
  id               Int      @id @default(autoincrement())
  userId           Int
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stravaActivityId String   @unique
  name             String
  type             String
  startDate        DateTime
  duration         Int
  distance         Float?
  averageHeartRate Float?
  maxHeartRate     Float?
  tss              Float?
  checksum         String   // For change detection
  xpEarned         Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId, startDate])
}

model Achievement {
  id          Int               @id @default(autoincrement())
  slug        String            @unique
  name        String
  description String
  category    String            // distance, streak, consistency, milestone, special
  iconUrl     String?           // Optional icon URL
  xpReward    Int               @default(0)
  requirement String            // JSON string
  tier        String            @default("bronze")
  sortOrder   Int               @default(0)
  createdAt   DateTime          @default(now())

  userAchievements UserAchievement[]
}

model Challenge {
  id          Int             @id @default(autoincrement())
  slug        String          @unique
  name        String
  description String
  type        String          // daily, weekly
  requirement String          // JSON string
  xpReward    Int
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())

  userChallenges UserChallenge[]
}

model ConnectedProvider {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider     String   // strava, garmin, apple_health, coros
  accessToken  String
  refreshToken String?
  expiresAt    Int?
  isPrimary    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([userId, provider])
  @@index([userId])
}
```

**Additional models:** `UserAchievement`, `UserChallenge`, `StreakFreeze`, `RestDay` (see schema.prisma for details)

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
DATABASE_URL="file:./dev.db"
```

---

## Running the Project

```bash
# Install dependencies
npm install

# Generate Prisma client (required after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev

# If port 3000 is occupied, update .env.local:
# Add: PORT=3001
# Then access at http://localhost:3001
```

### Database Setup

The database file is located at `prisma/dev.db` (SQLite). To reset the database:

```bash
# Delete the database file
rm prisma/dev.db

# Run migrations to recreate
npx prisma migrate dev
```

---

## Strava Rate Limits Compliance

Based on Strava's API rate limits:
- **100 requests per 15 minutes** (per application)
- **1,000 requests per day** (per application)

Our implementation handles this with:

| Layer | Protection | Threshold |
|-------|-----------|-----------|
| Client-side | Minimum request interval | 10 seconds |
| Client-side | Response cache TTL | 5 minutes |
| Client-side | Retry with backoff | 3 retries, 1s→2s→4s |
| Server-side | Per-user call cache | 1 minute |
| Server-side | Database cache | Serves cached activities |
| UI | Rate limit display | Shows remaining calls |
| UI | Disabled retry button | Prevents spam when limited |

**Headers used:**
- `X-RateLimit-Limit`: Format "100,1000" (15-min, daily)
- `X-RateLimit-Usage`: Format "50,200" (15-min, daily)
- `Retry-After`: Seconds to wait (when 429)

---

## Known Issues

1. **Strava API 429 errors** - Now handled with caching, but if daily limit is exhausted, users must wait until midnight UTC. Users can click "Clear Rate Limit" button if stuck in rate-limited state.

2. **Server-side cache is in-memory** - Resets on server restart. Consider Redis for production.

3. **Rate limit state persistence** - Client-side rate limit state is in-memory and resets on page reload. If stuck, use "Clear Rate Limit" button.

4. **Activity checksum calculation** - Currently includes all activity fields. May need refinement if Strava adds metadata fields that shouldn't trigger updates.

---

## Activity Caching Strategy

Activities are cached in the database with checksums for efficient change detection:

- **New activities**: Automatically stored on first fetch
- **Existing activities**: Updated only if checksum changes (activity was modified on Strava)
- **Cached data**: Served from database when available, reducing API calls
- **Checksum includes**: `stravaActivityId`, `name`, `type`, `startDate`, `duration`, `distance`, `averageHeartRate`, `maxHeartRate`, `tss`
- **Response includes**: `source: 'cache' | 'strava'` to indicate data origin

## Token Management

- Tokens are persisted in `StravaToken` table
- Automatic refresh when expired (handled server-side)
- Tokens stored securely server-side (httpOnly cookies)
- Database backup ensures tokens survive server restarts
- Token refresh updates both cookies and database

## Next Steps (Priority Order)

1. **✅ Rate limiting** - Implemented with manual clear option
2. **Add Redis caching** - For production-ready server-side caching (currently in-memory)
3. **Multi-provider support** - Sprint 6 (schema ready, need implementation)
4. **Mobile responsiveness** - UI optimization for mobile devices
5. **Enhanced pixel art** - Optional improvements (basic implementation complete)

---

## Testing

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Run CI pipeline
npm run ci
```

---

## Completion Assessment

### ✅ Fully Complete & Production-Ready

1. **Core Infrastructure**
   - ✅ Strava OAuth with secure token management
   - ✅ Database persistence with Prisma + SQLite
   - ✅ Activity caching with checksum-based change detection
   - ✅ Training metrics calculation (CTL, ATL, TSB)
   - ✅ All 5 fatigue states implemented

2. **Gamification System**
   - ✅ XP calculation and leveling (1-100)
   - ✅ Streak tracking with grace period and freezes
   - ✅ Achievement system (20+ achievements)
   - ✅ Daily/Weekly challenges
   - ✅ Recovery tracking
   - ✅ Evolution stages (1-5)

3. **UI Components**
   - ✅ Pixel art character display
   - ✅ All gamification UI components
   - ✅ Wearable customization
   - ✅ Training visualization

4. **Rate Limiting**
   - ✅ Client-side throttling and caching
   - ✅ Server-side caching
   - ✅ Manual rate limit clearing
   - ✅ Graceful error handling

### ⚠️ Needs Attention (Not Blocking)

1. **Rate Limit State Persistence**
   - **Issue**: Client-side rate limit state is in-memory, resets on page reload
   - **Impact**: Low - users can use "Clear Rate Limit" button if stuck
   - **Fix**: Consider localStorage persistence (optional enhancement)

2. **Server-Side Cache**
   - **Issue**: In-memory cache resets on server restart
   - **Impact**: Medium - affects production scalability
   - **Fix**: Implement Redis caching for production

3. **Activity Checksum**
   - **Issue**: May need refinement if Strava adds metadata fields
   - **Impact**: Low - currently works well
   - **Fix**: Monitor and adjust checksum calculation as needed

### 🚧 Partially Implemented

1. **Multi-Provider Support**
   - ✅ Database schema ready (`ConnectedProvider` model)
   - ❌ Provider abstraction layer not implemented
   - ❌ Garmin/COROS/Apple Health integrations missing
   - **Priority**: Medium (nice-to-have feature)

### 📋 Optional Enhancements

1. **Pixel Art Improvements**
   - ✅ Basic pixel art character complete
   - ❌ More animation frames
   - ❌ Pixel art wearables (currently SVG)
   - **Priority**: Low (aesthetic enhancement)

2. **Mobile Responsiveness**
   - ⚠️ UI works on mobile but could be optimized
   - **Priority**: Medium

### 🔧 Immediate Actions Needed

**For Rate Limit Error:**
1. Click "Clear Rate Limit" button if stuck in rate-limited state
2. Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
3. Check browser console for actual error messages
4. Verify Strava API credentials are valid

**For Development:**
1. Run `npx prisma generate` after any schema changes
2. Run `npx prisma migrate dev` to apply migrations
3. Clear `.next` cache if seeing stale build errors

**For Production:**
1. Set up Redis for server-side caching
2. Configure production database (PostgreSQL recommended)
3. Set up proper environment variables
4. Configure CORS and security headers

---

## Contact

For questions about this codebase, refer to:
- Plan file: `.claude/plans/sprightly-gliding-peach.md`
- Setup guide: `SETUP_GUIDE.md`
- Component docs: `components/wearables/README.md`
