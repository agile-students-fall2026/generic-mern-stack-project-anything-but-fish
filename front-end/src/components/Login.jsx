import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";

const fields = [
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "username",
    autoCapitalize: "none",
    spellCheck: false,
    maxLength: 254,
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    maxLength: 128,
    required: true,
  },
];

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
  return (
    <AuthPage
      variant="login"
      title="Log In"
      fields={fields}
      onSubmit={submit}
      busy={busy}
      error={error}
      buttonLabel="Log In"
      busyLabel="Logging in…"
      footer={(
        <>
          <Link to="/password-recovery">Forgot password?</Link>
          <Link to="/register">Register</Link>
          <Link to="/">Home</Link>
        </>
      )}
    />
  );
}
