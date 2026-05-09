import { createSlice } from "@reduxjs/toolkit";

const gptSlice = createSlice({
  name: "gpt",
  initialState: {
    showGptSearch: false,
    searchQuery: "",
    movieResults: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    toggleGptSearchView: (state) => {
      state.showGptSearch = !state.showGptSearch;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setGptMovieResults: (state, action) => {
      state.movieResults = action.payload;
    },
    setGptLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setGptError: (state, action) => {
      state.error = action.payload;
    },
    clearGptSearch: (state) => {
      state.searchQuery = "";
      state.movieResults = null;
      state.error = null;
    },
  },
});

export const {
  toggleGptSearchView,
  setSearchQuery,
  setGptMovieResults,
  setGptLoading,
  setGptError,
  clearGptSearch,
} = gptSlice.actions;

export default gptSlice.reducer;
