import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authRequest } from "../lib/auth-api";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";

const fields = [
  {
    name: "password",
    label: "New password",
    type: "password",
    autoComplete: "new-password",
    minLength: 8,
    maxLength: 128,
    required: true,
    help: "Use 8–128 characters.",
  },
  {
    name: "confirmation",
    label: "Confirm new password",
    type: "password",
    autoComplete: "new-password",
    minLength: 8,
    maxLength: 128,
    required: true,
  },
];

export default function ResetPassword() {
  const { clearSession } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmation")) { setError("Passwords do not match."); return; }
    setBusy(true); setError("");
    try {
      await authRequest("/reset-password", { body: { token, password: form.get("password") } });
      clearSession();
      navigate("/reset-confirmation", { replace: true });
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return (
    <AuthPage
      variant="reset"
      title="Reset Password"
      fields={fields}
      onSubmit={submit}
      busy={busy}
      error={!token ? "This reset link is missing a token. Please request a new link." : error}
      hideControls={!token}
      buttonLabel="Reset Password"
      busyLabel="Resetting…"
      footer={(
        <>
          <Link to="/password-recovery">Request a new reset link</Link>
          <Link to="/login">Login</Link>
          <Link to="/">Home</Link>
        </>
      )}
    />
  );
}
