import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authRequest, readUser } from "../lib/auth-api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    authRequest("/me", { signal: controller.signal })
      .then((data) => setUser(readUser(data)))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setUser(null);
        if (error.status !== 401) setError(error.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  async function login(credentials) {
    const data = await authRequest("/login", { body: credentials });
    setUser(readUser(data));
    setError("");
  }

  async function logout() {
    await authRequest("/logout", { body: {} });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, error, login, logout, retry: () => setAttempt((value) => value + 1) }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth() {
  const { user, loading, error, retry } = useAuth();
  const location = useLocation();
  if (loading) return <main className="container py-5" role="status">Checking your session…</main>;
  if (error) return <main className="container py-5"><p role="alert" className="alert alert-danger">{error}</p><button className="btn btn-primary" onClick={retry}>Retry</button></main>;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
}
