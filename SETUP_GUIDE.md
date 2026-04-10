# Quick Setup Guide for Sporty Gotchi

## You're almost ready to see your Sporty Gotchi!

Your development server is already running at: [http://localhost:3000](http://localhost:3000)

### Next Steps:

## 1. Add Your Strava API Credentials

You need to add your Strava API credentials to the `.env.local` file.

**Open the file:** `.env.local` (in the sporty_gotchi folder)

**Replace these lines:**
```env
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
```

**With your actual credentials from Strava**

### Where to find your Strava credentials:

1. Go to: https://www.strava.com/settings/api
2. If you don't have an app yet, click "Create an App"
   - **Application Name:** Sporty Gotchi
   - **Category:** Training
   - **Website:** http://localhost:3000
   - **Authorization Callback Domain:** localhost
3. Once created, you'll see your:
   - **Client ID** (a number)
   - **Client Secret** (click "Show" to reveal it)

## 2. Restart the Development Server

After adding your credentials:

1. Stop the server (press Ctrl+C in the terminal)
2. Start it again: `npm run dev`
3. Open http://localhost:3000

## 3. Connect Your Strava Account

1. Click "Connect with Strava" on the homepage
2. Authorize the app
3. You'll be redirected back and see your Sporty Gotchi!

## Troubleshooting

### "Missing Strava credentials" error
- Make sure you saved the `.env.local` file after adding your credentials
- Make sure there are no quotes around the values
- Make sure there are no spaces before or after the `=` sign

### Server won't start
- Make sure port 3000 is not already in use
- Try running: `npm run dev` again

### Need help?
Check the main [README.md](README.md) for more detailed information!

---

## What You've Built

- ✅ Next.js app with TypeScript
- ✅ Strava OAuth integration
- ✅ Training load calculations (TSS, CTL, ATL, TSB)
- ✅ Dynamic character that changes with your training state
- ✅ Beautiful UI with Tailwind CSS
- ✅ Rate limit handling for Strava API

**Congratulations on building your first coding project!** 🎉
