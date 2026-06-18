# playlistShuffle — Claude Code Context

YouTube playlist shuffler using a Mersenne-Twister algorithm. Supports up to 12,000
videos, playlist mixes (comma-separated URLs + `name:` suffix), keyboard shortcuts,
and three visual themes. Deployed on Vercel. Planned: Chrome extension version.

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

## Environment

Requires `.env` in the project root (gitignored):

```
VITE_YT_API_KEY=your_youtube_data_api_v3_key
```

Template: `.env.example`. The key ships in the client bundle (`VITE_` prefix — same
exposure as before). The old hardcoded key in git history is revoked; use a new one
from Google Cloud Console (enable YouTube Data API v3).

## Architecture

| Layer | Tech |
|---|---|
| Build | Vite 5 + `@vitejs/plugin-react` |
| Language | TypeScript 5 (strict, `allowJs: false`) |
| State | Redux Toolkit 2 — 4 slices + redux-persist (localStorage key `'root'`) |
| Routing | React Router v6 |
| Player | react-player 2 (YouTube iframe) |
| Styling | Tailwind CSS 3 + tw-colors (3 themes: `light` / `dark` / `image`) |
| API | YouTube Data API v3 via axios (paginated 50/page, etag caching) |
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

Typed hooks: `useAppDispatch` / `useAppSelector` in `src/redux/hooks.ts`.
`RootState` and `AppDispatch` exported from `src/redux/store.ts`.

## Key types (`src/types/`)

- `youtube.ts` — YouTube API response shapes (`YouTubePlaylistItem*`)
- `playlist.ts` — `Song`, `PlaylistDetail`, `SearchResultSong`, `ValidateIdResult`,
  `FetchVideosResult`, `FetchPlaylistDataResult`, payload update interfaces
- `lyrics.ts` — `LrcLine`, `LrcLibResponse`, `LyricsResult`, `LyricsStatus`
- `mersenne-twister.d.ts` — ambient module shim (`constructor`, `random()`)
- `src/vite-env.d.ts` — `ImportMetaEnv` augmented with `VITE_YT_API_KEY`

## File structure

```
src/
  App.tsx / main.tsx       ← entry points
  app.css                  ← Tailwind directives
  vite-env.d.ts
  components/              ← React components (.tsx)
  redux/
    slices/                ← RTK createSlice files (.ts)  ← source of truth
    store.ts               ← configureStore + persistor
    hooks.ts               ← typed useAppDispatch/useAppSelector
  hooks/                   ← visibility.ts
  utils/                   ← fetchPlaylistData.ts, fetchPlaylistVideos.ts, validateId.ts,
                              fetchLyrics.ts, parseLrc.ts, parseTitleArtist.ts
  types/                   ← shared TypeScript types
  images/                  ← source images (also copied to public/)
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
- Remove `react-github-btn` from package.json if unused (check components)

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

## Known gotchas

- **redux-persist serializableCheck** — must ignore `[FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]` (already set in store.ts)
- **Persist key `'root'`** — do not change; changing it wipes users' saved playlists
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
