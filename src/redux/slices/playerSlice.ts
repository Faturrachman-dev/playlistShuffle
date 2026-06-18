import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'image';

export interface PlayerState {
  isPlLoading: boolean;
  isPlaying: boolean;
  theme: Theme;
  currentSong: string;
  isShuffleActive: boolean;
  isLoopActive: boolean;
  currentActivePlaylistId: string;
  searchWords: string;
  isMutedActive: boolean;
  progress: number;
  videoDuration: number;
  videoPercentage: number;
  volume: number;
  seeking: boolean;
  seekTo: number | null;
  seekKeyboard: number | null;
  title: string;
  artist: string;
  videoCountdown: boolean;
  isAudioOnlyMode: boolean;
  isLyricsActive: boolean;
}

const initialState: PlayerState = {
  isPlLoading: false,
  isPlaying: false,
  theme: 'image',
  currentSong: '',
  isShuffleActive: false,
  isLoopActive: false,
  currentActivePlaylistId: '',
  searchWords: '',
  isMutedActive: false,
  progress: 0,
  videoDuration: 0,
  videoPercentage: 0,
  volume: 1,
  seeking: false,
  seekTo: null,
  seekKeyboard: null,
  title: '',
  artist: '',
  videoCountdown: false,
  isAudioOnlyMode: false,
  isLyricsActive: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentSong: (state, action: PayloadAction<string>) => {
      state.currentSong = action.payload;
    },
    setIsLoopActive: (state, action: PayloadAction<boolean>) => {
      state.isLoopActive = action.payload;
    },
    setIsShuffleActive: (state, action: PayloadAction<boolean>) => {
      state.isShuffleActive = action.payload;
    },
    setIsMutedActive: (state, action: PayloadAction<boolean>) => {
      state.isMutedActive = action.payload;
    },
    setCurrentActivePlaylistId: (state, action: PayloadAction<string>) => {
      state.currentActivePlaylistId = action.payload;
    },
    setVideoDuration: (state, action: PayloadAction<number>) => {
      state.videoDuration = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setPercentage: (state, action: PayloadAction<number>) => {
      state.videoPercentage = action.payload;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setSeeking: (state, action: PayloadAction<boolean>) => {
      state.seeking = action.payload;
    },
    setSeekTo: (state, action: PayloadAction<number | null>) => {
      state.seekTo = action.payload;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setArtist: (state, action: PayloadAction<string>) => {
      state.artist = action.payload;
    },
    setSeekKeyboard: (state, action: PayloadAction<number | null>) => {
      state.seekKeyboard = action.payload;
    },
    setIsPlLoading: (state, action: PayloadAction<boolean>) => {
      state.isPlLoading = action.payload;
    },
    setWordsToSearch: (state, action: PayloadAction<string>) => {
      state.searchWords = action.payload;
    },
    setVideoCountdown: (state, action: PayloadAction<boolean>) => {
      state.videoCountdown = action.payload;
    },
    setIsAudioOnlyMode: (state, action: PayloadAction<boolean>) => {
      state.isAudioOnlyMode = action.payload;
    },
    setIsLyricsActive: (state, action: PayloadAction<boolean>) => {
      state.isLyricsActive = action.payload;
    },
  },
});

export const {
  setIsPlaying,
  setCurrentSong,
  setIsLoopActive,
  setIsShuffleActive,
  setIsMutedActive,
  setCurrentActivePlaylistId,
  setVideoDuration,
  setProgress,
  setPercentage,
  setTheme,
  setVolume,
  setSeeking,
  setSeekTo,
  setTitle,
  setArtist,
  setSeekKeyboard,
  setIsPlLoading,
  setWordsToSearch,
  setVideoCountdown,
  setIsAudioOnlyMode,
  setIsLyricsActive,
} = playerSlice.actions;

export default playerSlice.reducer;
