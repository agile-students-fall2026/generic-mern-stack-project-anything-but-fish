import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import MainMenuLayout from "./MainMenuLayout";

const menuItems = [
  { label: "Start Game", path: "/game" },
  { label: "Chat with NPCs", path: "/chat" },
  { label: "Collections", path: "/collections" },
  { label: "Plots", path: "/plots" },
];

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
    <MainMenuLayout menuItems={menuItems}>
      {user && (
        <div className="main-screen__account">
          <p>Signed in as {user.email}</p>
          <button type="button" disabled={busy} onClick={handleLogout}>
            {busy ? "Logging out…" : "Log Out"}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
    </MainMenuLayout>
  );
}
