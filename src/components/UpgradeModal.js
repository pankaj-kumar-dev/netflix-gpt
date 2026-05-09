import React, { useState } from "react";
import { auth } from "../utils/firebase";

const UpgradeModal = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to start checkout");
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe checkout
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2">
          Upgrade to Pro ✦
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Semantic Search uses AI embeddings to match movies by meaning — not
          keywords. "Films about losing yourself" finds results no keyword search
          could.
        </p>

        <ul className="text-sm text-gray-300 mb-6 space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-purple-400">✦</span> Semantic Search
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">✦</span> Unlimited search history
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">✦</span> Priority AI recommendations
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">✦</span> Early access to new features
          </li>
        </ul>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex-1 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Upgrade to Pro"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
