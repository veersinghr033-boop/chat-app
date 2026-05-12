import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utills/axios";
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", { email, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error in Login",
      );
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ username, password, email }: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/signup", { username, password, email });
      console.log(response, "response");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error in Signup",
      );
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/logout");
  } catch (error) {
    console.error("Logout failed", error);
  }
});
