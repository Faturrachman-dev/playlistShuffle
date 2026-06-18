# nexc-playerlist — Claude Code Context

YouTube playlist shuffler using a Mersenne-Twister algorithm. Supports up to 12,000
videos, playlist mixes (comma-separated URLs + `name:` suffix), keyboard shortcuts,
and three visual themes. Owned by Faturrachman-dev. Deployed on Vercel.

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:9550
npm run build        # tsc --noEmit && vite build (dist/ with gzip + brotli)
npm run preview      # Serve built dist locally
npm run typecheck    # tsc --noEmit only
npm run test         # vitest run
npm run test:watch   # vitest watch mode
npm run lint         # ESLint --fix (.ts/.tsx)
```

## Deployment

- **Vercel project:** `nexc-playerlist` (faturrachman6773-gmailcoms-projects team)
- **Live URL:** https://nexc-playerlist.vercel.app (or playlist-shuffle-teal.vercel.app)
- **Deploy:** `npx vercel --prod --yes` from the project root (already authenticated)
- **GitHub:** https://github.com/Faturrachman-dev/nexc-playerlist

## Environment

Requires `.env` in the project root (gitignored). Template: `.env.example`.

```
VITE_YT_API_KEY=your_youtube_data_api_v3_key
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
```

Both keys also need to be set in Vercel dashboard (or via `npx vercel env add <KEY> production`).
- `VITE_YT_API_KEY`: YouTube Data API v3 key from Google Cloud Console.
- `VITE_GOOGLE_CLIENT_ID`: OAuth 2.0 Client ID (Web application type). Authorized JS
  origins must include the dev URL (`http://localhost:9550`) and the Vercel production URL.
  OAuth consent screen must be published (or the user added as Test User while in Testing mode).

## Architecture

| Layer | Tech |
|---|---|
| Build | Vite 5 + `@vitejs/plugin-react` |
| Language | TypeScript 5 (strict, `allowJs: false`, lib: ES2020+ES2021) |
| State | Redux Toolkit 2 — 5 slices + redux-persist (localStorage key `'root'`) |
| Routing | React Router v6 |
| Player | react-player 2 (YouTube iframe) |
| Styling | Tailwind CSS 3 + tw-colors (3 themes: `light` / `dark` / `image`) |
| API | YouTube Data API v3 via axios (paginated 50/page, etag caching) |
| Auth | Google Identity Services (GIS) token model — client-side OAuth, no backend |
| Shuffle | mersenne-twister npm package |
| Tests | Vitest |
| Lint | ESLint (airbnb) + Prettier |

## Redux slices (`src/redux/slices/`)

- **playerSlice** — `isPlaying`, `theme`, `currentSong`, `volume`, `progress`,
  `seekTo`/`seekKeyboard` (`number | null`), shuffle/loop/mute flags, search words,
  `isAudioOnlyMode`, `isLyricsActive`
- **playlistDetailsSlice** — `PlaylistDetail[]`: name, id, image, etag, currentIndex,
  playlistLength?
- **playlistSongsByIdSlice** — `Record<playlistId, Song[]>`
- **homepageSlice** — `searchInput: string`
- **authSlice** — `accessToken: string | null`, `expiresAt: number | null`. **Blacklisted
  from redux-persist** — token lives in memory only, cleared on page reload.

Typed hooks: `useAppDispatch` / `useAppSelector` in `src/redux/hooks.ts`.
`RootState` and `AppDispatch` exported from `src/redux/store.ts`.

## Key types (`src/types/`)

- `youtube.ts` — YouTube API response shapes (`YouTubePlaylistItem*`)
- `playlist.ts` — `Song`, `PlaylistDetail`, `SearchResultSong`, `ValidateIdResult`,
  `FetchVideosResult` (includes `'private'` case), `FetchPlaylistDataResult`, payload interfaces
- `lyrics.ts` — `LrcLine`, `LrcLibResponse`, `LyricsResult`, `LyricsStatus`
- `gsi.d.ts` — ambient types for `window.google.accounts.oauth2` (GIS token client)
- `mersenne-twister.d.ts` — ambient module shim (`constructor`, `random()`)
- `src/vite-env.d.ts` — `ImportMetaEnv` with `VITE_YT_API_KEY` + `VITE_GOOGLE_CLIENT_ID`

## File structure

```
src/
  App.tsx / main.tsx       ← entry points
  app.css                  ← Tailwind directives
  vite-env.d.ts
  components/
    Navbar/
      Navbar.tsx           ← includes AuthButton
      AuthButton.tsx       ← Google sign-in / sign-out button
    HomePage/
      Search/Search.tsx    ← playlist URL input + load logic
      PlaylistUsed/        ← saved playlist cards with update/sort/delete
    PlaylistPage/
      Player/Player.tsx    ← ReactPlayer + audio-only thumbnail overlay
      PlayerToolbar/       ← background-mode + lyrics toggle buttons
      Lyrics/Lyrics.tsx    ← synced lyrics panel (LRCLIB)
      MediaButtons/        ← play/pause/skip/shuffle/loop
      ProgressBar/
      PlayingRightNow/
      VideoCard/           ← virtualised song list
  redux/
    slices/                ← 5 RTK createSlice files (source of truth)
    store.ts               ← configureStore + persistor (auth blacklisted)
    hooks.ts               ← typed useAppDispatch/useAppSelector
  hooks/                   ← visibility.ts
  utils/
    fetchPlaylistData.ts   ← GET /playlists (metadata); accepts optional accessToken
    fetchPlaylistVideos.ts ← GET /playlistItems (paginated); accepts optional accessToken
    validateId.ts          ← parses/validates playlist URL or ID
    youtubeAuth.ts         ← GIS wrapper: requestAccessToken(), revokeToken()
    fetchLyrics.ts         ← LRCLIB fetch + cache + prefetch
    parseLrc.ts            ← LRC string → sorted LrcLine[]
    parseTitleArtist.ts    ← [track, artist] from YouTube snippet title + channel
  types/                   ← shared TypeScript types
public/
  assets/favicon.png
  assets/images/           ← background image served at runtime
  manifest.json
```

## Migration state

TypeScript migration (M1–M6) is **complete**. The codebase is 100% `.ts`/`.tsx` with
`strict: true` and `allowJs: false`. All components import directly from
`src/redux/slices/` — there are no shim barrels or legacy JS files.

**`vite.config.ts` has non-default `resolve.extensions`** (`.ts`/`.tsx` before `.js`/`.jsx`) —
leave this in place; it costs nothing and guards against accidental `.js` file additions.

Possible next steps:
- Enable `noUncheckedIndexedAccess: true` in tsconfig for additional array safety
- Remove `react-github-btn` from package.json if unused (check components first)
- Add Vercel env vars for production OAuth (`VITE_GOOGLE_CLIENT_ID`)
- Publish the OAuth consent screen in GCP so any Google account can sign in

## Player toolbar (`src/components/PlaylistPage/PlayerToolbar/`)

Extensible icon-button bar rendered below the video in the left column. Currently two tools:
- **Audio-only mode** (`isAudioOnlyMode`) — covers the YouTube iframe with the current
  song's thumbnail (`hqdefault.jpg`); audio keeps playing. Toggle with `MdVideocam/Off`.
- **Lyrics** (`isLyricsActive`) — shrinks the video and shows a synced lyrics panel below.
  Toggle with `MdLyrics/MdOutlineLyrics`.

Both flags live in `playerSlice` and are auto-persisted via redux-persist.

## Lyrics system

**Data source:** [LRCLIB](https://lrclib.net/docs) — free, no API key, no rate limit,
`access-control-allow-origin: *` (direct browser calls, no proxy needed). Returns LRC
format (`[mm:ss.xx] text`) in `syncedLyrics`; plain text fallback in `plainLyrics`.

**Files:**
- `src/utils/fetchLyrics.ts` — main entry point. Cache keyed by **YouTube videoId**.
  On-demand: fires `/api/get` (exact, needs duration) + `/api/search` in parallel via
  `Promise.any`; whichever resolves first wins. Also exports `prefetchPlaylistLyrics`.
- `src/utils/parseLrc.ts` — pure LRC string → sorted `LrcLine[]`.
- `src/utils/parseTitleArtist.ts` — extracts `[track, artist]` from raw YouTube snippet
  title + channel name (handles ` - `, `//`, ` - Topic` channel patterns).
- `src/components/PlaylistPage/Lyrics/Lyrics.tsx` — fetches on `player.title` change
  (fires after `handleReady` sets correct metadata), highlights active line, auto-scrolls.

**Prefetch strategy:**
- `prefetchPlaylistLyrics(songs, startIndex, maxCount=100)` fires on playlist load from
  `PlaylistPage`, ordered: current song first → forward → wrap. Uses search-only (no
  duration). Batched at `PREFETCH_CONCURRENCY=3` to avoid flooding the connection pool.
- `inFlight` Map deduplicates concurrent requests — if the prefetch already started a
  request for the current song, `fetchLyrics` joins that promise instead of firing again.
- Cache is never populated with failed/null results, so a network timeout is retryable.

## YouTube OAuth (sign in to load private playlists)

**Why:** Private/user-specific playlists (`LR`-prefix Recap, Watch Later, Liked Videos)
return `totalResults=0` from the public API. The YouTube Data API needs an OAuth access
token to fetch them.

**Approach:** Google Identity Services (GIS) token model (`initTokenClient`) — fully
client-side, no backend, no client secret needed. Scope: `youtube.readonly`.
Token is short-lived (~1 hour), in-memory only (never persisted to localStorage).

**Files:**
- `src/utils/youtubeAuth.ts` — `requestAccessToken()` opens Google consent popup and
  returns `{ token, expiresAt }`. `revokeToken(token)` for sign-out.
- `src/types/gsi.d.ts` — ambient window.google types (no npm package, loaded via CDN).
- `src/redux/slices/authSlice.ts` — `setAuth` / `clearAuth`; blacklisted from persist.
- `src/components/Navbar/AuthButton.tsx` — sign-in/sign-out button in navbar.
- `index.html` — `<script src="https://accounts.google.com/gsi/client" async defer>`

**Token threading:** `fetchPlaylistVideos` and `fetchPlaylistData` accept an optional
`accessToken?: string`. When provided: `Authorization: Bearer <token>` header, no `key=`
param. When absent: falls back to `key=VITE_YT_API_KEY` (public playlists). Both
`Search.tsx` and `PlaylistUsed.tsx` read `auth.accessToken` from Redux and pass it through.

**Private playlist error handling:** `fetchPlaylistVideos` returns `'private'` (not
`undefined`) when the API succeeds with 0 results. `Search.tsx` shows a context-aware
message: prompts sign-in if not authenticated, or "not accessible with your account"
if already signed in.

## Playlist ID validation (`src/utils/validateId.ts`)

Supported prefixes: `PL`, `OLAK`, `RD`, `UU`, `LR` (added for YouTube Recap playlists).
Minimum length: 13 characters. Also handles full YouTube URLs and mix playlists
(comma-separated, `name:` suffix).

## Known gotchas

- **redux-persist serializableCheck** — must ignore `[FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]` (already set in store.ts)
- **Persist key `'root'`** — do not change; changing it wipes users' saved playlists
- **auth slice blacklisted** — `blacklist: ['auth']` in persistConfig; tokens are session-only
- **`seekTo`/`seekKeyboard`** are `number | null`, not `number` — Player guards with `?`
- **Background image** — runtime string `url(./assets/images/...)` resolves from `public/`
- **Favicon** — `public/assets/favicon.png` (index.html references `/assets/favicon.png`)
- **Mix playlist ID** — prefixed `MIXpl...`, excluded from update button in PlaylistUsed
- **Lyrics fetch timing** — `Lyrics.tsx` depends on `player.title` (not `player.currentSong`)
  because title is set in `handleReady` after the video loads — that's when correct
  track/artist/duration are available. A separate effect on `currentSong` clears the display.
- **`parseTitleArtist` vs `player.title`** — `player.title` has an index prefix (`"40 - Track"`);
  strip it with `stripIndexPrefix` in `Lyrics.tsx`. Use `player.artist` directly (already parsed
  by `handleReady`). Don't call `parseTitleArtist` on `player.title`/`player.artist`.
- **LRCLIB latency** — expect 15–35 s per request from Southeast Asia (server is EU/US).
  The parallel `/get`+`/search` + prefetch cache mitigates perceived latency.
- **`Promise.any`** — requires `lib: ["ES2021"]` in tsconfig (already set). Do NOT revert to ES2020-only.
- **GIS script import** — `src/types/gsi.d.ts` is an ambient declaration; do NOT import it
  with `import '../types/gsi'` in `.ts` files — Rollup will fail the production build trying
  to resolve it. TypeScript picks it up automatically via tsconfig `include: ["src"]`.
- **Vercel project name** — renamed from `playlist-shuffle` to `nexc-playerlist`. The old
  alias `playlist-shuffle-teal.vercel.app` persists until manually removed in the dashboard.
- **`FetchVideosResult`** now includes `'private'` — any narrowing that checks
  `typeof data === 'number'` must also handle the string `'private'` case separately.
