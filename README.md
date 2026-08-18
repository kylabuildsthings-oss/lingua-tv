# LinguaTV

A retro purple CRT dashboard for language-learning YouTube channels. It only shows videos from channels you add, and stores everything in the browser.

## Run

```bash
npm install
npm run dev
```

Then open the printed local URL. First visit is empty: add a channel, or click **Load my teachers** to import the 53-channel list in batches.

## Scripts

- `npm run dev` — Vite app plus the local YouTube lookup API
- `npm run build` — production client build
- `npm run preview` — serve the build with the same API plugin
- `npm start` — Express static + API server (run after `npm run build`)

No YouTube API key is required. Channel metadata comes from public YouTube pages and video lists from channel RSS feeds, via `/api` (Vite middleware locally, serverless functions on Vercel).
