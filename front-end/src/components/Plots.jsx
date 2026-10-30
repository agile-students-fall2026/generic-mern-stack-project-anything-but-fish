import { useNavigate } from "react-router-dom";

export default function Plots() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Plots</p>
      <button onClick={() => navigate("/plots/characters")}>Character biographies</button>
      <button onClick={() => navigate("/plots/chapters")}>Chapter Selection</button>
      <button onClick={() => navigate("/plots/objects")}>Object descriptions</button>
      <button onClick={() => navigate("/starting")}>Back</button>
    </div>
  );
}
