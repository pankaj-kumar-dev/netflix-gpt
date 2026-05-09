import { useDispatch, useSelector } from "react-redux";
import { addTopRatedMovies } from "../utils/movieSlice";
import { useEffect } from "react";
import { tmdb } from "../services/tmdb";

const useTopRatedMovies = () => {
  const dispatch = useDispatch();
  const topRatedMovies = useSelector((store) => store.movies.topRatedMovies);

  useEffect(() => {
    if (topRatedMovies) return;

    const fetchMovies = async () => {
      try {
        const data = await tmdb.getTopRated();
        dispatch(addTopRatedMovies(data.results));
      } catch (error) {
        console.error("Failed to fetch top rated movies:", error);
      }
    };

    fetchMovies();
  }, [dispatch, topRatedMovies]);
};

export default useTopRatedMovies;
