import { useNavigate } from "react-router-dom";

export default function CollectedObjects() {
  const navigate = useNavigate();

  return (
    <div>
      <p>View collectable objects from stories</p>
      <button onClick={() => navigate("/collections")}>Back</button>
    </div>
  );
}
