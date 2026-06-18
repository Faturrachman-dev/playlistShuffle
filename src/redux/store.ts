import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import playerReducer from './slices/playerSlice';
import playlistDetailsReducer from './slices/playlistDetailsSlice';
import playlistSongsByIdReducer from './slices/playlistSongsByIdSlice';
import homepageReducer from './slices/homepageSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  player: playerReducer,
  playlistDetails: playlistDetailsReducer,
  playlistSongsById: playlistSongsByIdReducer,
  homepage: homepageReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
