import { useDispatch } from "react-redux";
import { addTrailerVideo } from "../utils/movieSlice";
import { useEffect } from "react";
import { tmdb } from "../services/tmdb";

const useMovieTrailer = (movieId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!movieId) return;

    const fetchTrailer = async () => {
      try {
        const data = await tmdb.getVideos(movieId);
        const trailer =
          data.results.find((v) => v.type === "Trailer") || data.results[0];
        if (trailer) {
          dispatch(addTrailerVideo(trailer));
        }
      } catch (error) {
        console.error("Failed to fetch movie trailer:", error);
      }
    };

    fetchTrailer();
  }, [movieId]);
};

export default useMovieTrailer;
