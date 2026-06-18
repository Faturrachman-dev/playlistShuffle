import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  PlaylistDetail,
  EtagUpdate,
  IndexUpdate,
  LengthUpdate,
  ImageUpdate,
} from '../../types/playlist';

const initialState: PlaylistDetail[] = [];

const playlistDetailsSlice = createSlice({
  name: 'playlistDetails',
  initialState,
  reducers: {
    addToPlaylistDetails: (state, action: PayloadAction<PlaylistDetail>) => {
      const exists = state.some(
        (el) => el.playlistId === action.payload.playlistId,
      );
      if (!exists) {
        state.push(action.payload);
      }
    },
    deleteFromPlaylistDetails: (state, action: PayloadAction<string>) =>
      state.filter((el) => el.playlistId !== action.payload),
    modifyEtagInPlaylistDetailsById: (
      state,
      action: PayloadAction<EtagUpdate>,
    ) => {
      const entry = state.find(
        (el) => el.playlistId === action.payload.playlistId,
      );
      if (entry) {
        entry.playlistEtag = action.payload.etag;
      }
    },
    lastPlayedIndexPlaylistDetails: (
      state,
      action: PayloadAction<IndexUpdate>,
    ) => {
      const entry = state.find(
        (el) => el.playlistId === action.payload.playlistId,
      );
      if (entry) {
        entry.currentIndex = action.payload.currentIndex;
      }
    },
    setPlaylistLength: (state, action: PayloadAction<LengthUpdate>) => {
      const entry = state.find(
        (el) => el.playlistId === action.payload.playlistId,
      );
      if (entry) {
        entry.playlistLength = action.payload.playlistLength;
      }
    },
    setPlaylistImage: (state, action: PayloadAction<ImageUpdate>) => {
      const entry = state.find(
        (el) => el.playlistId === action.payload.playlistId,
      );
      if (entry) {
        entry.playlistImage = action.payload.playlistImage;
      }
    },
  },
});

export const {
  addToPlaylistDetails,
  deleteFromPlaylistDetails,
  modifyEtagInPlaylistDetailsById,
  lastPlayedIndexPlaylistDetails,
  setPlaylistLength,
  setPlaylistImage,
} = playlistDetailsSlice.actions;

export default playlistDetailsSlice.reducer;
