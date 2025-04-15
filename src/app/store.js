import { configureStore } from "@reduxjs/toolkit";
import configReducer from "../features/config/configSlice";
import authReducer from "../features/auth/authSlice"; // for future use

export const store = configureStore({
  reducer: {
    config: configReducer,
    auth: authReducer,
  },
});
