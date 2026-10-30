import { useNavigate } from "react-router-dom";

export default function VerificationCode() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Verification Code</p>
      <button onClick={() => navigate("/reset-password")}>Continue</button>
      <button onClick={() => navigate("/password-recovery")}>Back</button>
    </div>
  );
}
