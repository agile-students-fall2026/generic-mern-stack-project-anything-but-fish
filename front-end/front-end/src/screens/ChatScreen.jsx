import { useEffect, useRef, useState } from "react";

//scene  + chat window 
export default function ChatScreen({ character, messages, onSend, onBack }) {
  const [draft, setDraft] = useState("");       // what the user is typing right now
  const [justSent, setJustSent] = useState(false); // shows the "sent !" note
  const [typing, setTyping] = useState(false);  // NPC "is typing..." indicator
  const bottomRef = useRef(null);
  const timers = useRef([]);

  // Auto-scroll the chat box to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Clean up pending timeouts if the user leaves the screen
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    onSend({ from: "you", text });
    setDraft("");

    setJustSent(true);
    timers.current.push(setTimeout(() => setJustSent(false), 1500));

    // FAKE NPC reply (no back end): pick a canned line after a short delay.
    // Later, replace this block with a call to the real NPC API.
    setTyping(true);
    timers.current.push(
      setTimeout(() => {
        const reply = character.replies[Math.floor(Math.random() * character.replies.length)];
        onSend({ from: "npc", text: reply });
        setTyping(false);
      }, 900)
    );
  }

  return (
    <div className="screen chat-screen">
      <div className="scene">
        <button className="back-btn" onClick={onBack} aria-label="Back to characters">↩</button>
        {character.scene ? (
          <img src={character.scene} alt={`${character.name} scene`} />
        ) : (
          <span className="scene-label">scene</span>
        )}
      </div>

      <div className="chat-area">
        <div className="speaker-bar">{character.name}: {typing ? "typing…" : "online"}</div>

        <div className="chat-box" aria-live="polite">
          {messages.length === 0 && <p className="empty">Say something to {character.name}.</p>}
          {messages.map((m, i) => (
            <div key={i} className={`bubble-row ${m.from}`}>
              <div className="bubble">{m.text}</div>
              <span className="who">{m.from === "you" ? "You" : character.name}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={handleSend}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message"
            aria-label="Message"
          />
          <button type="submit" disabled={!draft.trim()}>send</button>
        </form>
        <p className="sent-note">{justSent ? "sent !" : "\u00A0"}</p>
      </div>
    </div>
  );
}
