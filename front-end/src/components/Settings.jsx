import { useNavigate, useParams } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const { page } = useParams();

  return (
    <div>
      <p>Settings</p>
      <button onClick={() => navigate(`/game/${page}`)}>Back</button>
    </div>
  );
}
