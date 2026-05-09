import React from "react";
import MovieList from "./MovieList";
import { useSelector } from "react-redux";
import usePersonalizedRecs from "../Hooks/usePersonalizedRecs";

const SecondaryContainer = () => {
  const movies = useSelector((store) => store.movies);
  const { movies: forYouMovies, preferences } = usePersonalizedRecs();

  const nowPlayingMovies = movies.nowPlayingMovies || [];
  const topRatedMovies = movies.topRatedMovies || [];
  const upcomingMovies = movies.upcomingMovies || [];
  const popularMovies = movies.popularMovies || [];

  return (
    <div className="bg-black">
      <div className="-mt-44 pl-12 relative z-20">
        {/* Personalized row — only shows when DB + OpenAI are set up */}
        {forYouMovies.length > 0 && (
          <div>
            <MovieList title="✨ For You" movies={forYouMovies} />
            {preferences && (
              <p className="text-gray-500 text-xs pl-6 -mt-4 pb-4">
                Based on your taste: {preferences}
              </p>
            )}
          </div>
        )}
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
      </div>
    </div>
  );
};

export default SecondaryContainer;
