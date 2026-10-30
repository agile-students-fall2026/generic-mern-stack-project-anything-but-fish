import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Inventory</p>
      <button onClick={() => navigate("/choose-character")}>Back</button>
    </div>
  );
}
