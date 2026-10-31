import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MainScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleLogout() {
    if (busy) return;
    setBusy(true); setError("");
    try { await logout(); navigate("/login", { replace: true }); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <p>Main Screen</p>
      <p>Signed in as {user.email}</p>
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      <button className="btn btn-outline-secondary" disabled={busy} onClick={handleLogout}>{busy ? "Logging out…" : "Log Out"}</button>
      <button onClick={() => navigate("/game")}>Start Game</button>
      <button onClick={() => navigate("/npc-chat")}>Chat with NPC</button>
      <button onClick={() => navigate("/collections")}>Collections</button>
      <button onClick={() => navigate("/plots")}>Plots</button>
    </div>
  );
}
