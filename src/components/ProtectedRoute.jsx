import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../services/auth";

export default function ProtectedRoute({ children, role }) {
  // Navigation helper only. Real security is enforced by Solidity onlyOwner and backend JWT role checks.
  const token = getToken();
  const userRole = getRole();

  if (!token) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
}
