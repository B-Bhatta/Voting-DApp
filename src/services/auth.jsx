/**
 * Auth Service for JEC Voting DApp
 * Handles persistent storage of JWT and User Roles
 */

// Save the authentication data after a successful login
export const saveAuth = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
};

// Retrieve the JWT token for the API Interceptor
export const getToken = () => {
    return localStorage.getItem("token");
};

// Retrieve the user role to handle Role-Based Access Control (RBAC)
export const getRole = () => {
    return localStorage.getItem("role");
};

// Check if a session exists
export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    // Returns true if token exists, false otherwise
    return !!token;
};

// Clear session and redirect to login
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Redirect to home/login and refresh to clear state
    window.location.href = "/";
};

// Helper to check if the current user is an Admin
export const isAdmin = () => {
    return localStorage.getItem("role") === "admin";
};