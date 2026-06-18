import axios from 'axios';
import type { LrcLibResponse, LyricsResult } from '../types/lyrics';
import type { Song } from '../types/playlist';
import { parseLrc } from './parseLrc';
import { parseTitleArtist } from './parseTitleArtist';

const BASE = 'https://lrclib.net/api';
const UA = 'playlistShuffle v1.0.0 (https://playlistshuffle.vercel.app)';

// Completed results keyed by videoId
const cache = new Map<string, LyricsResult>();
// In-flight promises keyed by videoId — prevents duplicate concurrent requests
const inFlight = new Map<string, Promise<LyricsResult | null>>();

// Max concurrent background prefetch connections (leave room for on-demand)
const PREFETCH_CONCURRENCY = 3;

function mapResponse(data: LrcLibResponse): LyricsResult {
  return {
    synced: data.syncedLyrics ? parseLrc(data.syncedLyrics) : [],
    plain: data.plainLyrics ?? null,
    instrumental: data.instrumental,
  };
}

async function tryGet(track: string, artist: string, duration: number): Promise<LyricsResult | null> {
  const t = performance.now();
  console.log('[lyrics] → GET /api/get', { track_name: track, artist_name: artist, duration: Math.round(duration) });
  try {
    const res = await axios.get<LrcLibResponse>(`${BASE}/get`, {
      params: { track_name: track, artist_name: artist, duration: Math.round(duration) },
      headers: { 'Lrclib-Client': UA },
    });
    const ms = Math.round(performance.now() - t);
    const result = mapResponse(res.data);
    console.log(`[lyrics] ✓ /get hit in ${ms}ms — synced:${result.synced.length} lines, plain:${!!result.plain}, instrumental:${result.instrumental}`);
    return result;
  } catch (err) {
    console.warn(`[lyrics] ✗ /get failed in ${Math.round(performance.now() - t)}ms —`, (err as { response?: { status: number }; code?: string })?.response?.status ?? (err as { code?: string })?.code ?? err);
    return null;
  }
}

async function trySearch(track: string, artist: string, duration: number): Promise<LyricsResult | null> {
  const query = [artist, track].filter(Boolean).join(' ');
  const t = performance.now();
  console.log('[lyrics] → GET /api/search', { q: query });
  try {
    const res = await axios.get<LrcLibResponse[]>(`${BASE}/search`, {
      params: { q: query },
      headers: { 'Lrclib-Client': UA },
    });
    const ms = Math.round(performance.now() - t);
    console.log(`[lyrics]   search returned ${res.data.length} result(s) in ${ms}ms`);
    if (!res.data.length) return null;
    const closest = duration > 0
      ? res.data.reduce((best, cur) =>
          Math.abs(cur.duration - duration) < Math.abs(best.duration - duration) ? cur : best)
      : res.data[0];
    if (!closest) return null;
    const result = mapResponse(closest);
    console.log(`[lyrics] ✓ /search picked "${closest.trackName}" by "${closest.artistName}" (${closest.duration}s${duration > 0 ? `, Δ${Math.abs(closest.duration - duration).toFixed(1)}s` : ''}) — synced:${result.synced.length} lines`);
    return result;
  } catch (err) {
    console.warn(`[lyrics] ✗ /search failed in ${Math.round(performance.now() - t)}ms —`, (err as { code?: string })?.code ?? err);
    return null;
  }
}

export async function fetchLyrics(params: {
  videoId: string;
  track: string;
  artist: string;
  duration: number;
}): Promise<LyricsResult | null> {
  const { videoId, track, artist, duration } = params;

  if (cache.has(videoId)) {
    const cached = cache.get(videoId)!;
    console.log(`[lyrics] cache hit — "${track}" (synced:${cached.synced.length})`);
    return cached;
  }

  // If a request for this videoId is already in-flight (e.g. from prefetch), reuse it
  if (inFlight.has(videoId)) {
    console.log(`[lyrics] joining in-flight request — "${track}"`);
    return inFlight.get(videoId)!;
  }

  const t0 = performance.now();
  console.log(`[lyrics] fetching "${track}" by "${artist}" (${Math.round(duration)}s) — parallel /get + /search`);

  const promise = Promise.any([
    tryGet(track, artist, duration).then((r) => r ?? Promise.reject(new Error('null'))),
    trySearch(track, artist, duration).then((r) => r ?? Promise.reject(new Error('null'))),
  ]).catch(() => null).then((result) => {
    inFlight.delete(videoId);
    const kind = result ? (result.synced.length > 0 ? 'synced' : result.plain ? 'plain' : 'instrumental') : 'null';
    console.log(`[lyrics] total: ${Math.round(performance.now() - t0)}ms — result: ${kind}`);
    if (result) cache.set(videoId, result);
    return result;
  });

  inFlight.set(videoId, promise);
  return promise;
}

// Background prefetch: search-only, batched to avoid flooding the connection pool
async function prefetchOne(videoId: string, track: string, artist: string): Promise<void> {
  if (cache.has(videoId) || inFlight.has(videoId)) return;

  const promise = trySearch(track, artist, 0)
    .catch(() => null)
    .then((result) => {
      inFlight.delete(videoId);
      if (result && (result.synced.length > 0 || result.plain)) {
        cache.set(videoId, result);
      }
      return result;
    });

  inFlight.set(videoId, promise);
  await promise;
}

export function prefetchPlaylistLyrics(songs: Song[], startIndex = 0, maxCount = 100): void {
  // Current song first, then forward, then wrap — skip anything already cached or in-flight
  const ordered = [
    ...songs.slice(startIndex),
    ...songs.slice(0, startIndex),
  ].slice(0, maxCount);

  const todo = ordered.filter((s) => {
    const vid = s.snippet.resourceId.videoId;
    return !cache.has(vid) && !inFlight.has(vid);
  });

  if (!todo.length) return;
  console.log(`[lyrics] prefetching ${todo.length} songs in background (concurrency=${PREFETCH_CONCURRENCY}, starting at index ${startIndex})...`);

  // Batched: wait for each batch before starting the next so we don't saturate the pool
  void (async () => {
    for (let i = 0; i < todo.length; i += PREFETCH_CONCURRENCY) {
      const batch = todo.slice(i, i + PREFETCH_CONCURRENCY);
      await Promise.allSettled(
        batch.map((song) => {
          const videoId = song.snippet.resourceId.videoId;
          const [track, artist] = parseTitleArtist(song.snippet.title, song.snippet.videoOwnerChannelTitle);
          if (!track) return Promise.resolve();
          return prefetchOne(videoId, track, artist);
        }),
      );
    }
    console.log('[lyrics] prefetch complete');
  })();
}
