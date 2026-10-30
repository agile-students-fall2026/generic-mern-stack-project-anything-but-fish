import { useNavigate } from "react-router-dom";

export default function CharacterBiographies() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Character biographies</p>
      <button onClick={() => navigate("/plots")}>Back</button>
    </div>
  );
}
