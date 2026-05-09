import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    isAuthReady: false,
  },
  reducers: {
    addUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthReady = true;
    },
    removeUser: (state) => {
      state.currentUser = null;
      state.isAuthReady = true;
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
