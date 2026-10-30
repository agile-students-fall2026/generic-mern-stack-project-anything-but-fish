import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Sign Up</p>
      <button onClick={() => navigate("/account-created")}>Continue</button>
      <button onClick={() => navigate("/")}>Back</button>
    </div>
  );
}
