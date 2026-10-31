import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function ResetConfirmation() {
  return <AuthLayout title="Password Reset">
    <p role="status">Your password has been reset. Log in with your new password.</p>
    <Link className="btn btn-primary w-100" to="/login">Log In</Link>
  </AuthLayout>;
}
