import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Reset Password</p>
      <button onClick={() => navigate("/reset-confirmation")}>Continue</button>
      <button onClick={() => navigate("/verification-code")}>Back</button>
    </div>
  );
}
