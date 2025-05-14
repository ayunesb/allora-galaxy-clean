
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user } = useAuth();

  // Redirect to dashboard if logged in, otherwise to auth page
  return user ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />;
}
