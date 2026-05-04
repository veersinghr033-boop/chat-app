import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utills/axios";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error fetching users",
      );
    }
  },
);
