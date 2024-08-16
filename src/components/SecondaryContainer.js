import React from "react";
import MovieList from "./MovieList";
import { useSelector } from "react-redux";

const SecondaryContainer = () => {
  const movies = useSelector((store) => store.movies);

  // Default empty arrays to avoid rendering issues
  const nowPlayingMovies = movies.nowPlayingMovies || [];
  const topRatedMovies = movies.topRatedMovies || [];
  const upcomingMovies = movies.upcomingMovies || [];
  const popularMovies = movies.popularMovies || [];
  const trendingMovies = movies.trendingMovies || [];
  const horrorMovies = movies.horrorMovies || [];

  return (
    <div className="bg-black">
      <div className="-mt-44 pl-12 relative z-20 bg-gray">
        {nowPlayingMovies.length > 0 && (
          <MovieList title="Now Playing" movies={nowPlayingMovies} />
        )}
        {topRatedMovies.length > 0 && (
          <MovieList title="Top Rated" movies={topRatedMovies} />
        )}
        {upcomingMovies.length > 0 && (
          <MovieList title="Upcoming Movies" movies={upcomingMovies} />
        )}
        {popularMovies.length > 0 && (
          <MovieList title="Popular Movies" movies={popularMovies} />
        )}
        {trendingMovies.length > 0 && (
          <MovieList title="Trending" movies={trendingMovies} />
        )}
        {horrorMovies.length > 0 && (
          <MovieList title="Horror Movies" movies={horrorMovies} />
        )}
      </div>
    </div>
  );
};

export default SecondaryContainer;
