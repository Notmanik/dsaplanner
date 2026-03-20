import { Navigate } from "react-router-dom";
import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
