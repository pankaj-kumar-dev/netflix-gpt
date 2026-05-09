import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import lang from "../utils/languageConstants";
import {
  setSearchQuery,
  setGptMovieResults,
  setGptLoading,
  setGptError,
} from "../utils/gptSlice";

const GptSearchBar = () => {
  const dispatch = useDispatch();
  const langKey = useSelector((store) => store.config.lang);
  const isLoading = useSelector((store) => store.gpt.isLoading);
  const searchRef = useRef(null);

  const handleSearch = async () => {
    const query = searchRef.current.value.trim();
    if (!query || isLoading) return;

    dispatch(setSearchQuery(query));
    dispatch(setGptLoading(true));
    dispatch(setGptError(null));

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Search failed");
      }

      const { results } = await response.json();
      dispatch(setGptMovieResults(results));
    } catch (error) {
      console.error("GPT search error:", error);
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
          ref={searchRef}
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
