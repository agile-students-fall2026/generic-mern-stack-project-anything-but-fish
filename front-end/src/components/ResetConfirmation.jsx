import { useNavigate } from "react-router-dom";

export default function ResetConfirmation() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Reset Confirmation</p>
      <button onClick={() => navigate("/login")}>Log In</button>
    </div>
  );
}
