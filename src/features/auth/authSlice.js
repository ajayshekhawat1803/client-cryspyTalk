import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';

const initialState = {
    user: JSON.parse(Cookies.get('user') || 'null'),
    token: Cookies.get('authToken') || null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        Cookies.set('user', JSON.stringify(action.payload.user), { expires: 7 });
        Cookies.set('authToken', action.payload.token, { expires: 7 });
    },
    logout: (state) => {
        state.user = null;
        state.token = null;
        Cookies.remove('user');
        Cookies.remove('authToken');
    }
}
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;