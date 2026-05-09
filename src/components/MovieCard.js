import React from "react";
import { IMG_CDN } from "../utils/constants";
import { auth } from "../utils/firebase";

const logWatchHistory = async (movie) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    fetch("/api/users/watch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
      }),
    });
  } catch {
    // Silent fail — tracking should never break UI
  }
};

const MovieCard = ({ movie }) => {
  if (!movie?.poster_path) return null;

  return (
    <div
      className="w-48 pr-4 cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={() => logWatchHistory(movie)}
    >
      <img
        alt={movie.title || "Movie"}
        src={IMG_CDN + movie.poster_path}
        className="rounded"
      />
    </div>
  );
};

export default MovieCard;
