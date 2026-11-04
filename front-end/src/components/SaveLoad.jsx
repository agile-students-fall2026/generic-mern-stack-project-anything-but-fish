import { useNavigate, useParams } from "react-router-dom";

export default function SaveLoad({ gamePath = "/game" }) {
  const navigate = useNavigate();
  const { page } = useParams();

  return (
    <div>
      <p>Save / Load</p>
      <button onClick={() => navigate(`${gamePath}/${page}`)}>Back</button>
    </div>
  );
}
