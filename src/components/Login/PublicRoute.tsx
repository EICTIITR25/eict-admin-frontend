import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute: React.FC = () => {
  const token = localStorage.getItem("access");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
