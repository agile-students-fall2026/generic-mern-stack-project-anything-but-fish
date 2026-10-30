import { useNavigate } from "react-router-dom";

export default function Collections() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Collections</p>
      <button onClick={() => navigate("/collections/objects")}>View collectable objects from stories</button>
      <button onClick={() => navigate("/starting")}>Back</button>
    </div>
  );
}
