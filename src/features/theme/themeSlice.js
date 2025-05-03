import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', state.mode); // update HTML root
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
    }
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
