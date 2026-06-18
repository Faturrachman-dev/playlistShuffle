import type { YouTubePlaylistItem } from './youtube';

export type Song = YouTubePlaylistItem;

export interface PlaylistDetail {
  playlistName: string;
  playlistId: string;
  playlistImage: string;
  playlistEtag: string;
  currentIndex: number;
  playlistLength?: number;
}

export type PlaylistSongsById = Record<string, Song[]>;

export type SearchResultSong = Song & { index: number };

export type ValidateIdResult = string | PlaylistMixData | null;

export interface PlaylistMixData {
  name: string;
  playlists: string[];
}

export interface FetchVideosSuccess {
  playlistEtag: string;
  responseArrToAdd: Song[];
  currentSong: string;
}

export type FetchVideosResult =
  | FetchVideosSuccess
  | 304
  | 403
  | 404
  | 'private'
  | undefined;

export type FetchPlaylistDataResult = Omit<PlaylistDetail, 'playlistLength'> | null;

export interface EtagUpdate {
  playlistId: string;
  etag: string;
}

export interface IndexUpdate {
  playlistId: string;
  currentIndex: number;
}

export interface LengthUpdate {
  playlistId: string;
  playlistLength: number;
}

export interface ImageUpdate {
  playlistId: string;
  playlistImage: string;
}

export interface AddSongsPayload {
  id: string;
  songs: Song[];
}
