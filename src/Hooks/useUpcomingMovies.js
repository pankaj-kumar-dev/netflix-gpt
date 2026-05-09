import { useDispatch, useSelector } from "react-redux";
import { addUpcomingMovies } from "../utils/movieSlice";
import { useEffect } from "react";
import { tmdb } from "../services/tmdb";

const useUpcomingMovies = () => {
  const dispatch = useDispatch();
  const upcomingMovies = useSelector((store) => store.movies.upcomingMovies);

  useEffect(() => {
    if (upcomingMovies) return;

    const fetchMovies = async () => {
      try {
        const data = await tmdb.getUpcoming();
        dispatch(addUpcomingMovies(data.results));
      } catch (error) {
        console.error("Failed to fetch upcoming movies:", error);
      }
    };

    fetchMovies();
  }, [dispatch, upcomingMovies]);
};

export default useUpcomingMovies;
