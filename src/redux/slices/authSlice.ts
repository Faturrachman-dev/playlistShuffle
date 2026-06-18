import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  expiresAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; expiresAt: number }>) => {
      state.accessToken = action.payload.token;
      state.expiresAt = action.payload.expiresAt;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.expiresAt = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
