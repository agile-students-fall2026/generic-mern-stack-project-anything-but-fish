import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Log In</p>
      <button onClick={() => navigate("/starting")}>Log In</button>
      <button onClick={() => navigate("/password-recovery")}>Password Recovery</button>
      <button onClick={() => navigate("/")}>Back</button>
    </div>
  );
}
