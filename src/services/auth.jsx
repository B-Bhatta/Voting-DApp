// TODO Phase 2: migrate auth token to httpOnly cookie.
// Frontend roles only help navigation; authorization is enforced by the contract and API.
export const saveAuth = (token, role) => {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role", role);
};

export const getToken = () => sessionStorage.getItem("token");
export const getRole = () => sessionStorage.getItem("role");
export const isAuthenticated = () => Boolean(getToken());

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  window.location.href = "/";
};

export const isAdmin = () => getRole() === "admin";
