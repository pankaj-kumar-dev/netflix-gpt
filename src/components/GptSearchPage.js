import React, { useState } from "react";
import GptMovieSuggestion from "./GptMovieSuggestion";
import GptSearchBar from "./GptSearchBar";
import MovieList from "./MovieList";
import { BG_URL } from "../utils/constants";
import useSearchHistory from "../Hooks/useSearchHistory";
import useEmbeddingSearch from "../Hooks/useEmbeddingSearch";

const GptSearchPage = () => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("gpt"); // "gpt" | "semantic"
  const searchHistory = useSearchHistory();
  const { search: semanticSearch, results: semanticResults, isLoading: semanticLoading, error: semanticError, message: semanticMessage } = useEmbeddingSearch();

  const handleSemanticSearch = () => {
    if (query.trim()) semanticSearch(query);
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      <div className="absolute inset-0 z-[-10]">
        <img src={BG_URL} alt="background" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10">
        {/* Mode toggle */}
        <div className="flex justify-center pt-[18%] mb-[-14%]">
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            <button
              onClick={() => setMode("gpt")}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                mode === "gpt"
                  ? "bg-red-700 text-white"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              AI Search
            </button>
            <button
              onClick={() => setMode("semantic")}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                mode === "semantic"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              Semantic Search ✦
            </button>
          </div>
        </div>

        {/* Search bar — shared for both modes */}
        <GptSearchBar
          query={query}
          onQueryChange={setQuery}
          mode={mode}
          onSemanticSearch={handleSemanticSearch}
        />

        {/* Recent search chips */}
        {searchHistory.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 px-4 mt-3">
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

        {/* Results */}
        {mode === "gpt" ? (
          <GptMovieSuggestion />
        ) : (
          <div className="bg-black bg-opacity-90 p-6 mx-6 rounded-lg mt-6">
            {semanticLoading && (
              <p className="text-white text-center animate-pulse">
                Finding semantically similar movies...
              </p>
            )}
            {semanticError && (
              <p className="text-red-400 text-center">{semanticError}</p>
            )}
            {semanticMessage && !semanticResults?.length && (
              <p className="text-gray-400 text-center">{semanticMessage}</p>
            )}
            {semanticResults?.length > 0 && (
              <>
                <p className="text-gray-400 text-xs mb-2">
                  Semantic matches for:{" "}
                  <span className="text-white font-semibold">"{query}"</span>
                </p>
                <MovieList title="Semantic Picks" movies={semanticResults} />
                <p className="text-gray-600 text-xs mt-2 text-center">
                  Ranked by meaning similarity, not keywords
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GptSearchPage;
