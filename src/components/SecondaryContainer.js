import React from "react";
import MovieList from "./MovieList";
import { useSelector } from "react-redux";

const SecondaryContainer = () => {
  const movies = useSelector((store) => store.movies);

  return (
    movies.nowPlayingMovies && (
      <div className="bg-black">
        <div className="-mt-44 pl-12 relative z-20 bg-gray ">
          <MovieList title="Now Playing" movies={movies.nowPlayingMovies} />
          <MovieList title="Top Rated" movies={movies.topRatedMovies} />

          <MovieList title="Upcoming Movies" movies={movies.upcomingMovies} />

          <MovieList title="Popular Movies" movies={movies.popularMovies} />

          <MovieList title="Trending" movies={movies.nowPlayingMovies} />

          <MovieList title="Horror movies" movies={movies.nowPlayingMovies} />
        </div>

        {/* Additional MovieList components for other categories */}
      </div>
    )
  );
};

export default SecondaryContainer;
