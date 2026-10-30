import { useNavigate } from "react-router-dom";

export default function PasswordRecovery() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Password Recovery</p>
      <button onClick={() => navigate("/verification-code")}>Continue</button>
      <button onClick={() => navigate("/login")}>Back</button>
    </div>
  );
}
