import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PlaylistSongsById, AddSongsPayload } from '../../types/playlist';

const initialState: PlaylistSongsById = {};

const playlistSongsByIdSlice = createSlice({
  name: 'playlistSongsById',
  initialState,
  reducers: {
    addSongsByPlaylistID: (state, action: PayloadAction<AddSongsPayload>) => {
      state[action.payload.id] = action.payload.songs;
    },
    removePlaylistSongsById: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { addSongsByPlaylistID, removePlaylistSongsById } =
  playlistSongsByIdSlice.actions;

export default playlistSongsByIdSlice.reducer;
