import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authRequest } from "../lib/auth-api";
import AuthLayout from "./AuthLayout";

export default function Register() {
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
      await authRequest("/register", { body: { email: form.get("email").trim(), password: form.get("password") } });
      navigate("/account-created", { replace: true });
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <AuthLayout title="Sign Up">
    {error && <p className="alert alert-danger" role="alert">{error}</p>}
    <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
      <div className="mb-3"><label className="form-label" htmlFor="email">Email</label><input className="form-control" id="email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
      <div className="mb-3"><label className="form-label" htmlFor="password">Password</label><input className="form-control" id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="password-help" required /><div className="form-text" id="password-help">Use 8–128 characters.</div></div>
      <div className="mb-3"><label className="form-label" htmlFor="confirmation">Confirm password</label><input className="form-control" id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></div>
      <button className="btn btn-primary w-100" type="submit">{busy ? "Creating account…" : "Create Account"}</button>
    </fieldset></form>
    <p className="mt-3 mb-0">Already have an account? <Link to="/login">Log In</Link></p>
  </AuthLayout>;
}
