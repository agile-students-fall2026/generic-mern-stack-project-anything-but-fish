import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Welcome</p>
      <button onClick={() => navigate("/register")}>Sign Up</button>
      <button onClick={() => navigate("/login")}>Log In</button>
    </div>
  );
}
