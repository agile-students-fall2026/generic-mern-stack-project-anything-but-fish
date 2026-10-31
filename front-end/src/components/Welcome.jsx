import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Welcome() {
  const { user } = useAuth();
  return <AuthLayout title="Welcome">
    <p>Explore the story of Anything but Fish.</p>
    <div className="d-grid gap-2">
      {user ? <Link className="btn btn-primary" to="/starting">Continue</Link> : <>
        <Link className="btn btn-primary" to="/register">Sign Up</Link>
        <Link className="btn btn-outline-primary" to="/login">Log In</Link>
      </>}
    </div>
  </AuthLayout>;
}
