import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function AccountCreated() {
  return <AuthLayout title="Account Created">
    <p role="status">Your account is ready. Log in to continue.</p>
    <Link className="btn btn-primary w-100" to="/login">Log In</Link>
  </AuthLayout>;
}
