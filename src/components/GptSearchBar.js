import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../utils/firebase";
import lang from "../utils/languageConstants";
import {
  setSearchQuery,
  setGptMovieResults,
  setGptLoading,
  setGptError,
} from "../utils/gptSlice";

const GptSearchBar = ({ query, onQueryChange }) => {
  const dispatch = useDispatch();
  const langKey = useSelector((store) => store.config.lang);
  const isLoading = useSelector((store) => store.gpt.isLoading);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || isLoading) return;

    dispatch(setSearchQuery(q));
    dispatch(setGptLoading(true));
    dispatch(setGptError(null));

    try {
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Search failed");
      }

      const { results } = await response.json();
      dispatch(setGptMovieResults(results));
    } catch (error) {
      dispatch(setGptError(error.message || "Search failed. Please try again."));
    } finally {
      dispatch(setGptLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="pt-[20%] flex justify-center">
      <form
        className="w-1/2 bg-black grid grid-cols-12"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          type="text"
          className="p-4 m-4 col-span-9 text-black rounded"
          placeholder={lang[langKey].gptSearchPlaceholder}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="col-span-3 m-4 py-2 px-4 bg-red-700 text-white rounded disabled:opacity-50 hover:bg-red-600 transition-colors"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "..." : lang[langKey].search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
