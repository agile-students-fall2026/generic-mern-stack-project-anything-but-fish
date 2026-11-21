import { Link } from "react-router-dom";
import AuthPage from "./AuthPage";

export default function PasswordRecovery() {
  return (
    <AuthPage
      variant="recovery"
      title="Password Recovery"
      fields={[]}
      status="Password recovery is currently unavailable."
      hideControls
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
