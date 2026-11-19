import { useEffect, useRef, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  CHAT_MODES,
  getChatHistory,
  sendChatMessage,
} from "../lib/chat-api";
import environment from "../assets/chat/environment.png";
import cislo from "../assets/chat/cislo.png";
import documentBackground from "../assets/chat/document-background.png";
import inputFrame from "../assets/chat/input-frame.png";
import twoCats from "../assets/chat/two-cats.png";
import emojiCat from "../assets/chat/emoji-cat.png";
import backIcon from "../assets/game/home-icon.png";
import inventoryIcon from "../assets/game/inventory-icon.png";
import "./CharacterChat.css";

const CHARACTER_NAMES = {
  ona: "Ona Laimaitė",
  ivan: "Ivan Likhov",
  cislo: "Cislobog Raskolnikova",
};

export default function CharacterChat() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState(CHAT_MODES.DAILY);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const conversationRef = useRef(null);
  const sendControllerRef = useRef(null);
  const displayName = CHARACTER_NAMES[name] || name || "Investigator";

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setMessages([]);
    setDraft("");
    setError("");
    setLoading(true);

    getChatHistory(name, mode, { signal: controller.signal })
      .then((history) => {
        if (active) setMessages(history);
      })
      .catch((requestError) => {
        if (active && requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
      sendControllerRef.current?.abort();
    };
  }, [name, mode]);

  useEffect(() => {
    const conversation = conversationRef.current;

    if (conversation) {
      conversation.scrollTop = conversation.scrollHeight;
    }
  }, [messages, sending]);

  function closeModal() {
    if (location.state?.overlay) {
      navigate(-1);
    } else {
      navigate(`/chat/${encodeURIComponent(name)}`, { replace: true });
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    const content = draft.trim();
    if (!content || loading || sending) return;

    const controller = new AbortController();
    sendControllerRef.current = controller;
    setSending(true);
    setError("");

    try {
      const reply = await sendChatMessage(name, mode, content, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setMessages((current) => [
        ...current,
        { role: "user", content },
        { role: "assistant", content: reply },
      ]);
      setDraft("");
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError.message);
      }
    } finally {
      if (sendControllerRef.current === controller) {
        sendControllerRef.current = null;
        setSending(false);
      }
    }
  }

  function handleMessageKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <main className="character-chat" aria-label={`Chat with ${displayName}`}>
      <div className="character-chat__canvas">
        <div className="character-chat__artwork" aria-hidden="true">
          {[
            environment,
            ...(name === "cislo" ? [cislo] : []),
            documentBackground,
          ].map((src) => (
            <img
              className="character-chat__layer"
              key={src}
              src={src}
              alt=""
              width="1500"
              height="3249"
              draggable={false}
            />
          ))}
        </div>

        <section className="character-chat__panel" aria-label="Conversation">
          <h1 className="character-chat__name">{displayName}</h1>

          <div
            className="character-chat__modes"
            role="group"
            aria-label="Conversation mode"
          >
            <button
              className="character-chat__mode"
              type="button"
              aria-pressed={mode === CHAT_MODES.DAILY}
              disabled={sending}
              onClick={() => setMode(CHAT_MODES.DAILY)}
            >
              Daily
            </button>
            <button
              className="character-chat__mode"
              type="button"
              aria-pressed={mode === CHAT_MODES.STORY}
              disabled={sending}
              onClick={() => setMode(CHAT_MODES.STORY)}
            >
              Story
            </button>
          </div>

          <div
            className="character-chat__conversation"
            ref={conversationRef}
            role="log"
            aria-label={`${displayName} conversation`}
            aria-live="polite"
          >
            {loading && (
              <p className="character-chat__status">
                Loading conversation...
              </p>
            )}

            {!loading && messages.length === 0 && !error && (
              <p className="character-chat__status">
                No messages yet. Say hello.
              </p>
            )}

            {messages.map(({ role, content }, index) => (
              <div
                className={`character-chat__message character-chat__message--${role}`}
                key={index}
              >
                <span className="character-chat__speaker">
                  {role === "user" ? "You" : displayName}
                </span>
                <p>{content}</p>
              </div>
            ))}

            {sending && (
              <p className="character-chat__status">
                Waiting for a reply...
              </p>
            )}
          </div>

          {error && (
            <p className="character-chat__error" role="alert">
              {error}
            </p>
          )}
        </section>

        <form className="character-chat__composer" onSubmit={handleSend}>
          <img
            className="character-chat__input-frame"
            src={inputFrame}
            alt=""
            width="1397"
            height="801"
            draggable={false}
          />
          <textarea
            className="character-chat__input"
            aria-label={`Message ${displayName}`}
            name="message"
            value={draft}
            maxLength={2000}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleMessageKeyDown}
            disabled={loading || sending}
            placeholder="Write a message..."
          />
          <button
            className="character-chat__send"
            type="submit"
            disabled={loading || sending || !draft.trim()}
          >
            Send
          </button>
          <button
            className="character-chat__emoji"
            type="button"
            aria-label="Emoji (coming soon)"
            disabled
          >
            <img
              src={emojiCat}
              alt=""
              width="114"
              height="112"
              draggable={false}
            />
          </button>
          <img
            className="character-chat__cats"
            src={twoCats}
            alt=""
            width="1088"
            height="464"
            draggable={false}
          />
        </form>

        <nav className="character-chat__tools" aria-label="Chat options">
          <Link
            className="character-chat__tool"
            to="/chat"
            aria-label="Back to characters"
          >
            <img
              src={backIcon}
              alt=""
              width="152"
              height="152"
              draggable={false}
            />
          </Link>
          <Link
            className="character-chat__tool"
            to="inventory"
            state={{ overlay: true }}
            aria-label="Inventory"
            aria-haspopup="dialog"
          >
            <img
              src={inventoryIcon}
              alt=""
              width="152"
              height="152"
              draggable={false}
            />
          </Link>
        </nav>
      </div>

      <Outlet context={{ closeModal }} />
    </main>
  );
}
