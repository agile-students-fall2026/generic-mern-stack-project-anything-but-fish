import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authRequest } from "../lib/auth-api";
import AuthLayout from "./AuthLayout";

export default function ResetPassword() {
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
      navigate("/reset-confirmation", { replace: true });
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <AuthLayout title="Reset Password">
    {!token ? <p className="alert alert-warning" role="alert">This reset link is missing a token. Please request a new link.</p> : <>
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
        <div className="mb-3"><label className="form-label" htmlFor="password">New password</label><input className="form-control" id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="password-help" required /><div className="form-text" id="password-help">Use 8–128 characters.</div></div>
        <div className="mb-3"><label className="form-label" htmlFor="confirmation">Confirm new password</label><input className="form-control" id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></div>
        <button className="btn btn-primary w-100" type="submit">{busy ? "Resetting…" : "Reset Password"}</button>
      </fieldset></form>
    </>}
    <Link className="d-inline-block mt-3" to="/password-recovery">Request a new reset link</Link>
  </AuthLayout>;
}
