import { useDispatch, useSelector } from "react-redux";
import { addNowPlayingMovies } from "../utils/movieSlice";
import { useEffect } from "react";
import { tmdb } from "../services/tmdb";

const useNowPlayingMovies = () => {
  const dispatch = useDispatch();
  const nowPlayingMovies = useSelector((store) => store.movies.nowPlayingMovies);

  useEffect(() => {
    if (nowPlayingMovies) return;

    const fetchMovies = async () => {
      try {
        const data = await tmdb.getNowPlaying();
        dispatch(addNowPlayingMovies(data.results));
      } catch (error) {
        console.error("Failed to fetch now playing movies:", error);
      }
    };

    fetchMovies();
  }, [dispatch, nowPlayingMovies]);
};

export default useNowPlayingMovies;
