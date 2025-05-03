import { configureStore } from "@reduxjs/toolkit";
import configReducer from "../features/config/configSlice";
import authReducer from "../features/auth/authSlice"; 
import loaderReducer from "../features/loader/loaderSlice"; 
import themeReducer from "../features/theme/themeSlice"; 

export const store = configureStore({
  reducer: {
    config: configReducer,
    auth: authReducer,
    loader: loaderReducer,
    theme: themeReducer,
  },
});
