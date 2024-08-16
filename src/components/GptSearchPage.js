import React from "react";
import GptMovieSuggestion from "./GptMovieSuggestion";
import GptSearchBar from "./GptSearchBar";
import { BG_URL } from "../utils/constants";

const GptSearchPage = () => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 z-[-10]">
        <img
          src={BG_URL}
          alt="bg-image"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10">
        <GptSearchBar />
        <GptMovieSuggestion />
      </div>
    </div>
  );
};

export default GptSearchPage;
