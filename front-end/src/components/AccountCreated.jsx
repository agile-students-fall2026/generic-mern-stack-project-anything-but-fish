import { useNavigate } from "react-router-dom";

export default function AccountCreated() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Account Created</p>
      <button onClick={() => navigate("/login")}>Log In</button>
    </div>
  );
}
