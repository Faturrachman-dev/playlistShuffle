import axios from 'axios';
import type { FetchPlaylistDataResult } from '../types/playlist';
import type { YouTubePlaylistsResponse } from '../types/youtube';

export default async function fetchPlaylistData(
  id: string,
  etag: string,
  accessToken?: string,
): Promise<FetchPlaylistDataResult> {
  const baseApiUrl = 'https://www.googleapis.com/youtube/v3';
  const apiKey = import.meta.env.VITE_YT_API_KEY;
  console.log(`[fetchPlaylistData] GET /playlists id=${id} (${accessToken ? 'OAuth' : 'apiKey'})`);
  try {
    const response = await axios.get<YouTubePlaylistsResponse>(
      `${baseApiUrl}/playlists`,
      {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        params: {
          part: 'snippet',
          id,
          ...(accessToken ? {} : { key: apiKey }),
        },
      },
    );
    console.log(`[fetchPlaylistData] response items:`, response.data.items.length, response.data.items);
    const item = response.data.items[0];
    if (!item) {
      console.warn(`[fetchPlaylistData] no items returned for id=${id} — playlist may be private, user-specific, or not queryable via /playlists`);
      return null;
    }
    return {
      playlistName: item.snippet.title,
      playlistId: item.id,
      playlistImage: item.snippet.thumbnails.medium.url,
      playlistEtag: etag,
      currentIndex: 0,
    };
  } catch (err) {
    console.error(`[fetchPlaylistData] error for id=${id}:`, (err as { response?: { status: number; data: unknown } })?.response ?? err);
    return null;
  }
}
