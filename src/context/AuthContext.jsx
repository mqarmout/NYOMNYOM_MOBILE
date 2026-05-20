import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api";

// TODO: handle cookie/token persistence (see api.js TODO before implementing)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: check stored token/cookie here before hitting the API
    apiFetch("/api/auth/me")
      .then(({ data }) => setUser(data.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const { data, ok } = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (ok) setUser(data.user);
    return { ok, error: data.error };
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    // TODO: clear stored token/cookie here
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
