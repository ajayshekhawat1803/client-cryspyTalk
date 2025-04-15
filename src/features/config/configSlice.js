import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
});

export const selectApiBaseUrl = (state) => state.config.apiBaseUrl;
export default configSlice.reducer;