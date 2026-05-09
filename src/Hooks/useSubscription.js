import { useState, useEffect } from "react";
import { auth } from "../utils/firebase";

const useSubscription = () => {
  const [tier, setTier] = useState("FREE");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const response = await fetch("/api/billing/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setTier(data.subscriptionTier ?? "FREE");
        }
      } catch {
        // Default FREE on any failure
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { tier, isPro: tier === "PRO", isLoading };
};

export default useSubscription;
