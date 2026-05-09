import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { auth } from "../utils/firebase";

// Silently embeds now-playing movies in background after Browse loads.
// Builds up the semantic search corpus — each movie embedded once (idempotent).
// Runs once per session, 3s delay to not compete with initial page load.
const useEmbedMovies = () => {
  const nowPlayingMovies = useSelector((store) => store.movies.nowPlayingMovies);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!nowPlayingMovies?.length || hasRun.current) return;

    const embedBatch = async () => {
      hasRun.current = true;
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      // Embed first 10 movies — enough to demo semantic search
      const batch = nowPlayingMovies.slice(0, 10);
      batch.forEach((movie) => {
        fetch("/api/embeddings/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movieId: movie.id }),
        }).catch(() => {}); // Silent fail — never break Browse
      });
    };

    const timer = setTimeout(embedBatch, 3000);
    return () => clearTimeout(timer);
  }, [nowPlayingMovies]);
};

export default useEmbedMovies;
