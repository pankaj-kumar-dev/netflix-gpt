import React, { useState } from "react";
import GptMovieSuggestion from "./GptMovieSuggestion";
import GptSearchBar from "./GptSearchBar";
import { BG_URL } from "../utils/constants";
import useSearchHistory from "../Hooks/useSearchHistory";

const GptSearchPage = () => {
  const [query, setQuery] = useState("");
  const searchHistory = useSearchHistory();

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 z-[-10]">
        <img
          src={BG_URL}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <GptSearchBar query={query} onQueryChange={setQuery} />

        {/* Recent search chips — only shows if user has history */}
        {searchHistory.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 px-4 mt-2">
            {searchHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => setQuery(item.query)}
                className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full hover:bg-gray-700 transition-colors border border-gray-600"
              >
                {item.query}
              </button>
            ))}
          </div>
        )}

        <GptMovieSuggestion />
      </div>
    </div>
  );
};

export default GptSearchPage;
