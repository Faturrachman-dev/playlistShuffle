import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface HomepageState {
  searchInput: string;
}

const initialState: HomepageState = {
  searchInput: '',
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    setSearchInput: (state, action: PayloadAction<string>) => {
      state.searchInput = action.payload;
    },
  },
});

export const { setSearchInput } = homepageSlice.actions;
export default homepageSlice.reducer;
