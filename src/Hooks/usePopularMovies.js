import { useDispatch, useSelector } from "react-redux";
import { addPopularMovies } from "../utils/movieSlice";
import { useEffect } from "react";
import { tmdb } from "../services/tmdb";

const usePopularMovies = () => {
  const dispatch = useDispatch();
  const popularMovies = useSelector((store) => store.movies.popularMovies);

  useEffect(() => {
    if (popularMovies) return;

    const fetchMovies = async () => {
      try {
        const data = await tmdb.getPopular();
        dispatch(addPopularMovies(data.results));
      } catch (error) {
        console.error("Failed to fetch popular movies:", error);
      }
    };

    fetchMovies();
  }, [dispatch, popularMovies]);
};

export default usePopularMovies;
