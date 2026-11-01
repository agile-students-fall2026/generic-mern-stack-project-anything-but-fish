import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Welcome() {
  const { user } = useAuth();
  return <AuthLayout title="Welcome">
    <p>Explore the story of Anything but Fish.</p>
    <div>
      {user ? <p><Link to="/starting">Continue</Link></p> : <>
        <p><Link to="/starting">Continue without logging in</Link></p>
        <p><Link to="/register">Sign Up</Link></p>
        <p><Link to="/login">Log In</Link></p>
      </>}
    </div>
  </AuthLayout>;
}
