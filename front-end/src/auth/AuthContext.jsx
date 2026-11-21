import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authRequest, readUser } from "../lib/auth-api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const sessionCheck = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    sessionCheck.current = controller;
    setLoading(true);
    setError("");
    authRequest("/me", { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setUser(readUser(data)); })
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
    const account = readUser(data);
    sessionCheck.current?.abort();
    setUser(account);
    setLoading(false);
    setError("");
  }

  function clearSession() {
    sessionCheck.current?.abort();
    setUser(null);
    setLoading(false);
    setError("");
  }

  async function logout() {
    await authRequest("/logout", { body: {} });
    clearSession();
  }

  return <AuthContext.Provider value={{ user, loading, error, login, logout, clearSession, retry: () => setAttempt((value) => value + 1) }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth() {
  const { user, loading, error, retry } = useAuth();
  const location = useLocation();
  if (loading) return <main role="status">Checking your session…</main>;
  if (error) return <main><p role="alert">{error}</p><button onClick={retry}>Retry</button></main>;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
}
