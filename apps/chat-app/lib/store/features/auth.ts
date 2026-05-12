import { createSlice } from "@reduxjs/toolkit";
import { login, signup, logout } from "./authThunk";

interface AuthState {
  token: string | null;
  user: any | null;
  loading: boolean;
  error?: string | null;
}
const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.user?._id,
          user: action.payload.user?.username,
        };
        state.error = null;
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.user?._id,
          user: action.payload.user?.username,
        };
        state.error = null;
      })
      .addCase(signup.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export default authSlice.reducer;
