import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await login({ email: form.get("email").trim(), password: form.get("password") });
      const destination = location.state?.from;
      navigate(typeof destination === "string" && destination.startsWith("/") && !destination.startsWith("//") ? destination : "/starting", { replace: true });
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <AuthLayout title="Log In">
    {error && <p role="alert">{error}</p>}
    <form onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy}>
        <div><label htmlFor="email">Email</label>{" "}<input id="email" name="email" type="email" autoComplete="username" required maxLength={254} /></div>
        <div><label htmlFor="password">Password</label>{" "}<input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <button type="submit">{busy ? "Logging in…" : "Log In"}</button>
      </fieldset>
    </form>
    <p><Link to="/password-recovery">Forgot password?</Link></p>
    <p><Link to="/register">Sign Up</Link></p>
  </AuthLayout>;
}
