import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = () => {
  const isAuthenticated = localStorage.getItem("access"); // Check if token exists

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
