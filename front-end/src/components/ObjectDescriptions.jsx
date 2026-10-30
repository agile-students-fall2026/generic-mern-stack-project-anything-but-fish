import { useNavigate } from "react-router-dom";

export default function ObjectDescriptions() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Object descriptions</p>
      <button onClick={() => navigate("/plots")}>Back</button>
    </div>
  );
}
