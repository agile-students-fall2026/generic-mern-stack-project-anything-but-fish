import { useLocation, useNavigate } from "react-router-dom";

export default function Inventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || "/choose-character";

  return (
    <div>
      <p>Inventory</p>
      <button onClick={() => navigate(returnTo, { replace: true })}>Back</button>
    </div>
  );
}
