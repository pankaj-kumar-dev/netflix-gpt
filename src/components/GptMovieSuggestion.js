import React from "react";
import { useSelector } from "react-redux";
import MovieList from "./MovieList";

const GptMovieSuggestion = () => {
  const { movieResults, isLoading, error, searchQuery } = useSelector(
    (store) => store.gpt
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-white text-xl animate-pulse">
          Finding movies for you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!movieResults) return null;

  // Take the best TMDB match for each GPT-suggested title
  const suggestedMovies = movieResults
    .map((results) => results[0])
    .filter(Boolean);

  if (suggestedMovies.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-400 text-lg">No results found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="bg-black bg-opacity-90 p-6 mx-6 rounded-lg">
      <p className="text-gray-400 text-sm mb-2">
        AI picks for:{" "}
        <span className="text-white font-semibold">"{searchQuery}"</span>
      </p>
      <MovieList title="GPT Picks" movies={suggestedMovies} />
    </div>
  );
};

export default GptMovieSuggestion;
