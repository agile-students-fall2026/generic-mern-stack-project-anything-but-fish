import { useState } from "react";
import NpcChatFlow from "./NpcChatFlow";

// Tiny stand-in for the real main page, only so you can test your part.
// Your teammate's main page just needs to render <NpcChatFlow onExit={...} />
export default function App() {
  const [inChat, setInChat] = useState(false);
  if (inChat) return <NpcChatFlow onExit={() => setInChat(false)} />;
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <button onClick={() => setInChat(true)}>Chat With Characters</button>
    </div>
  );
}
