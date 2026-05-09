import { useState } from "react";
import { auth } from "../utils/firebase";

const useEmbeddingSearch = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const search = async (query) => {
    if (!query?.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/embeddings/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Semantic search failed");
      }

      const data = await response.json();
      setResults(data.results ?? []);
      setMessage(data.message ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setResults(null);
    setError(null);
    setMessage(null);
  };

  return { search, results, isLoading, error, message, clear };
};

export default useEmbeddingSearch;
