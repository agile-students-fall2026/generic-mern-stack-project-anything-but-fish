import { useNavigate } from "react-router-dom";

export default function MainScreen() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Main Screen</p>
      <button onClick={() => navigate("/game")}>Start Game</button>
      <button onClick={() => navigate("/npc-chat")}>Chat with NPC</button>
      <button onClick={() => navigate("/collections")}>Collections</button>
      <button onClick={() => navigate("/plots")}>Plots</button>
    </div>
  );
}
