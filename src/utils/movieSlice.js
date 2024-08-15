import { createSlice } from "@reduxjs/toolkit";

const movieSlice = createSlice({
  name: "movies",
  initialState: {
    nowPlayingMovies: null,
    trailerVideo: null,
    popularMovies: null, // Add this
    topRatedMovies: null,
    upcomingMovies: null, // Add this
  },
  reducers: {
    addNowPlayingMovies: (state, action) => {
      state.nowPlayingMovies = action.payload;
    },
    addTrailerVideo: (state, action) => {
      state.trailerVideo = action.payload;
    },
    addPopularMovies: (state, action) => {
      // Add this
      state.popularMovies = action.payload;
    },
    addTopRatedMovies: (state, action) => {
      // Add this
      state.topRatedMovies = action.payload;
    },
    addUpcomingMovies: (state, action) => {
      // Add this
      state.upcomingMovies = action.payload;
    },
  },
});

export const {
  addNowPlayingMovies,
  addTrailerVideo,
  addPopularMovies,
  addTopRatedMovies,
  addUpcomingMovies
} = movieSlice.actions;
export default movieSlice.reducer;
