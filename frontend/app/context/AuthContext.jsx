"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function dashboardForRole(role, slug) {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  if (role === "client") return `/client/${slug}/dashboard`;
  return "/";
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const decoded = decodeToken(storedToken);
    setToken(storedToken);
    setUser(decoded);
    setLoading(false);
  }, []);

  const login = (newToken) => {
    if (!newToken) return null;
    localStorage.setItem("token", newToken);
    const decoded = decodeToken(newToken);
    setToken(newToken);
    setUser(decoded);
    return decoded;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
