// All requests go to the Express backend proxy.
// In dev: CRA "proxy" field forwards /api/* to http://localhost:5000
// In prod: Configure nginx to route /api/* to the Express server
const API_BASE = "/api";

const get = async (path) => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${response.status}`);
  }
  return response.json();
};

export const tmdb = {
  getNowPlaying: () => get("/movies/now-playing"),
  getPopular: () => get("/movies/popular"),
  getTopRated: () => get("/movies/top-rated"),
  getUpcoming: () => get("/movies/upcoming"),
  getVideos: (movieId) => get(`/movies/videos/${movieId}`),
  searchMovie: (query) => get(`/movies/search?q=${encodeURIComponent(query)}`),
};
