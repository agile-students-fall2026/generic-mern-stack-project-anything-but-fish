import { useNavigate, useParams } from "react-router-dom";

export default function Game() {
  const navigate = useNavigate();
  const { page } = useParams();
  const currentPage = Number(page) || 1;

  return (
    <div>
      <p>Start Game</p>
      <p>Page {currentPage}</p>
      <button onClick={() => navigate(`/game/${currentPage + 1}`)}>Next Page</button>
      <button onClick={() => navigate(`/game/${currentPage}/settings`)}>Settings</button>
      <button onClick={() => navigate(`/game/${currentPage}/save-load`)}>Save / Load</button>
      <button onClick={() => navigate("/starting")}>Back</button>
    </div>
  );
}
