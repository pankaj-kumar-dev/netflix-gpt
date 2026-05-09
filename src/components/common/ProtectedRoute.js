import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthReady } = useSelector((store) => store.user);

  // Firebase hasn't responded yet — show nothing while auth state loads
  if (!isAuthReady) return <div className="bg-black min-h-screen" />;

  if (!currentUser) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
