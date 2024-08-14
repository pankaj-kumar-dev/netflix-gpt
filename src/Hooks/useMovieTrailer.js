import { useDispatch } from "react-redux";
import { API_OPTIONS } from "../utils/constants";
import { addTrailerVideo } from "../utils/movieSlice";
import { useEffect, useState } from "react";

const useMovieTrailer = (movieId) => {
  const dispatch = useDispatch();
  const [trailerId, setTrailerId] = useState(null); // State for storing trailer ID

  // Fetch trailer video & update store with trailer video data
  const getMovieVideos = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
      API_OPTIONS
    );
    const json = await data.json();
  

    const filterData = json.results.filter((video) => video.type === "Trailer");
    const trailer = filterData.length ? filterData[0] : json.results[0];
 

    if (trailer) {
      setTrailerId(trailer.key); // Update local state with trailer ID
      dispatch(addTrailerVideo(trailer)); // Dispatch to Redux store
    }
  };

  useEffect(() => {
    if (movieId) {
      getMovieVideos();
    }
  }, [movieId]); // Re-run the effect when movieId changes

  return trailerId; // Return the trailer ID so the component can use it
};

export default useMovieTrailer;
