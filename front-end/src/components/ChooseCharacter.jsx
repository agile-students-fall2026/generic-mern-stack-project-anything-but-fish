import { useNavigate } from "react-router-dom";

export default function ChooseCharacter() {
  const navigate = useNavigate();

  return (
    <div>
      <p>Choose character</p>
      <button onClick={() => navigate("/character-chat")}>Chat with character</button>
      <button onClick={() => navigate("/inventory")}>Inventory</button>
      <button onClick={() => navigate("/npc-chat")}>Back</button>
    </div>
  );
}
