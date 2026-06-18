export interface LrcLine {
  time: number;
  text: string;
}

export interface LrcLibResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export type LyricsStatus = 'idle' | 'loading' | 'synced' | 'plain' | 'instrumental' | 'not-found' | 'error';

export interface LyricsResult {
  synced: LrcLine[];
  plain: string | null;
  instrumental: boolean;
}
