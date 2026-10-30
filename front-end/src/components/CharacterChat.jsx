import { useNavigate } from "react-router-dom";

export default function CharacterChat() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Chat with character</p>
      <button onClick={() => navigate("/choose-character")}>Back</button>
    </div>
  );
}
