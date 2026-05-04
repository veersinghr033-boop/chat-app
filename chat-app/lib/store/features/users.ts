import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers } from "./usersThunk";
import{logout} from "./authThunk"

interface UsersState {
    users: any[];
    loading: boolean;
    error?: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};  

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        resetUsers: (state) => {
            state.users = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchUsers.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload || action.error.message ;
            })
            .addCase(logout.fulfilled, (state) => {
                state.users = [];
                state.loading = false;
                state.error = null;
            });
    },
});
export const { resetUsers } = usersSlice.actions;           
export default usersSlice.reducer;