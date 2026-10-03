import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("ghh_token"))
      api
        .get("/auth/me")
        .then((r) => setUser(r.data.user))
        .catch(() => localStorage.removeItem("ghh_token"))
        .finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  async function login(payload) {
    const r = await api.post("/auth/login", payload);
    localStorage.setItem("ghh_token", r.data.token);
    setUser(r.data.user);
  }
  async function register(payload) {
    const r = await api.post("/auth/register", payload);
    localStorage.setItem("ghh_token", r.data.token);
    setUser(r.data.user);
  }
  function logout() {
    localStorage.removeItem("ghh_token");
    setUser(null);
  }
  async function update(payload) {
    const r = await api.put("/auth/me", payload);
    setUser(r.data.user);
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, update }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
