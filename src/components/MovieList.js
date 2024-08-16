import React, { useRef } from "react";
import MovieCard from "./MovieCard";

const MovieList = ({ title, movies }) => {
  const listRef = useRef(null);

  const scrollRight = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!movies || movies.length === 0) {
    return <div>No movies available.</div>;
  }

  return (
    <div className="px-6 relative">
      <h1 className="text-3xl py-4 text-white">{title}</h1>
      <div className="flex overflow-x-auto p-6 scroll-container" ref={listRef}>
        <div className="flex">
          {movies.map((movie) => (
            <MovieCard key={movie.id} posterPath={movie.poster_path} />
          ))}
        </div>
      </div>
      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={scrollRight}
      >
        Tap to Scroll
      </button>
    </div>
  );
};

export default MovieList;
