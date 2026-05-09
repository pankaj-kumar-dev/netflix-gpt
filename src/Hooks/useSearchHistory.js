import { useState, useEffect } from "react";
import { auth } from "../utils/firebase";

const useSearchHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const response = await fetch("/api/users/search-history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error("Search history fetch failed:", err);
      }
    };

    fetchHistory();
  }, []);

  return history;
};

export default useSearchHistory;
