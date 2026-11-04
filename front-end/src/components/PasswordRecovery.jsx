import { useState } from "react";
import { Link } from "react-router-dom";
import { authRequest } from "../lib/auth-api";
import AuthPage from "./AuthPage";

const fields = [
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    spellCheck: false,
    maxLength: 254,
    required: true,
    help: "Enter your email to receive a password reset link.",
  },
];

export default function PasswordRecovery() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await authRequest("/forgot-password", { body: { email: form.get("email").trim() } });
      setSent(true);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return (
    <AuthPage
      variant="recovery"
      title="Password Recovery"
      fields={fields}
      onSubmit={submit}
      busy={busy}
      error={error}
      status={sent ? "If an account exists for that email, you will receive a password reset link." : ""}
      hideControls={sent}
      buttonLabel="Send Reset Link"
      busyLabel="Sending…"
      footer={(
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/">Home</Link>
        </>
      )}
    />
  );
}
