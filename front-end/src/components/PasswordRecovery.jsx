import { useState } from "react";
import { Link } from "react-router-dom";
import { authRequest } from "../lib/auth-api";
import AuthLayout from "./AuthLayout";

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
  return <AuthLayout title="Password Recovery">
    {error && <p className="alert alert-danger" role="alert">{error}</p>}
    {sent ? <p className="alert alert-success" role="status">If an account exists for that email, you will receive a password reset link.</p> : <>
      <p>Enter your email to receive a password reset link.</p>
      <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
        <div className="mb-3"><label className="form-label" htmlFor="email">Email</label><input className="form-control" id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
        <button className="btn btn-primary w-100" type="submit">{busy ? "Sending…" : "Send Reset Link"}</button>
      </fieldset></form>
    </>}
    <Link className="d-inline-block mt-3" to="/login">Back to Log In</Link>
  </AuthLayout>;
}
