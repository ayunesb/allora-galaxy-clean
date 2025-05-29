import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const isAuthenticated = true; // Replace with real auth logic
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RequireAuth;
