import { useNavigate, useParams } from "react-router-dom";

export default function SaveLoad() {
  const navigate = useNavigate();
  const { page } = useParams();

  return (
    <div>
      <p>Save / Load</p>
      <button onClick={() => navigate(`/game/${page}`)}>Back</button>
    </div>
  );
}
