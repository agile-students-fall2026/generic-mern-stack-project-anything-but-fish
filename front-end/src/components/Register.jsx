import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authRequest } from "../lib/auth-api";
import AuthPage from "./AuthPage";

const fields = [
  { name: "email", label: "Email", type: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false, maxLength: 254, required: true },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", minLength: 8, maxLength: 128, required: true },
  { name: "confirmation", label: "Confirm password", type: "password", autoComplete: "new-password", minLength: 8, maxLength: 128, required: true },
];

export default function Register() {
  const navigate = useNavigate();
  const request = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => request.current?.abort(), []);

  function clearFeedback(event) {
    setError("");
    if (["password", "confirmation"].includes(event.target.name)) {
      event.currentTarget.elements.namedItem("confirmation").setCustomValidity("");
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (request.current) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    setError("");
    if (fields.get("password") !== fields.get("confirmation")) {
      const confirmation = form.elements.namedItem("confirmation");
      confirmation.setCustomValidity("Passwords do not match.");
      confirmation.reportValidity();
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    try {
      await authRequest("/register", {
        body: { email: fields.get("email").trim(), password: fields.get("password") },
        signal: controller.signal,
      });
      if (!controller.signal.aborted) navigate("/account-created", { replace: true });
    } catch (error) {
      if (!controller.signal.aborted) setError(error.message);
    } finally {
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <AuthPage
      variant="register"
      title="Sign up"
      fields={fields}
      onSubmit={submit}
      onInput={clearFeedback}
      busy={busy}
      error={error}
      buttonLabel="Create Account"
      busyLabel="Creating account…"
      footer={<>
        <Link to="/login">Login</Link>
        <Link to="/password-recovery">Forgot password?</Link>
        <Link to="/">Home</Link>
      </>}
    />
  );
}
