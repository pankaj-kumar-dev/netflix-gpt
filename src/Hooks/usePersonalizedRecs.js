import { useState, useEffect } from "react";
import { auth } from "../utils/firebase";

const usePersonalizedRecs = () => {
  const [movies, setMovies] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const response = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        setMovies(data.results ?? []);
        setPreferences(data.preferences ?? null);
      } catch (err) {
        // Silent fail — personalized row just won't show
        console.error("Personalized recs failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecs();
  }, []);

  return { movies, preferences, isLoading };
};

export default usePersonalizedRecs;
