import { useNavigate } from "react-router-dom";

export default function NPCChat() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Chat with NPC</p>
      <button onClick={() => navigate("/choose-character")}>Choose character</button>
      <button onClick={() => navigate("/starting")}>Back</button>
    </div>
  );
}
