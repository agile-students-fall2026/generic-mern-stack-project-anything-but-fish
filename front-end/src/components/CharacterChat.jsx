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
import { useAuth } from "../auth/AuthContext";
import environment from "../assets/chat/environment.png";
import cislo from "../assets/chat/cislo.png";
import ona from "../assets/chat/ona-portrait.png";
import ivan from "../assets/chat/ivan-portrait.png";
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

const CHARACTER_PORTRAITS = {
  cislo: { src: cislo, width: 1500, height: 3249 },
  ona: { src: ona, width: 1500, height: 2620 },
  ivan: { src: ivan, width: 1500, height: 2799 },
};

export default function CharacterChat() {
  const { user, loading } = useAuth();
  const { name } = useParams();
  return <CharacterConversation key={`${user?.id ?? "guest"}:${name}`} checkingSession={loading} />;
}

function CharacterConversation({ checkingSession }) {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState(CHAT_MODES.DAILY);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const conversationRef = useRef(null);
  const sendControllerRef = useRef(null);
  const portraitButtonRef = useRef(null);
  const displayName = CHARACTER_NAMES[name] || name || "Investigator";
  const portrait = Object.hasOwn(CHARACTER_PORTRAITS, name) ? CHARACTER_PORTRAITS[name] : null;
  const waiting = loading || checkingSession;
  const accessDenied = [401, 403, 404].includes(errorStatus);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setMessages([]);
    setDraft("");
    setError("");
    setErrorStatus(null);
    setLoading(true);

    getChatHistory(name, mode, { signal: controller.signal })
      .then((history) => {
        if (active) setMessages(history);
      })
      .catch((requestError) => {
        if (active && requestError.name !== "AbortError") {
          setError(requestError.message);
          setErrorStatus(requestError.status ?? null);
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
  }, [messages, sending, panelOpen]);

  function hideConversation() {
    setPanelOpen(false);
    portraitButtonRef.current?.focus({ preventScroll: true });
  }

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
    if (!content || waiting || sending || accessDenied) return;

    setPanelOpen(true);
    const controller = new AbortController();
    sendControllerRef.current = controller;
    setSending(true);
    setError("");
    setErrorStatus(null);

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
        setErrorStatus(requestError.status ?? null);
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
          <img
            className="character-chat__layer"
            src={environment}
            alt=""
            width="1500"
            height="3249"
            draggable={false}
          />
          {portrait && (
            <div className="character-chat__portrait-crop">
              <img
                className={`character-chat__portrait character-chat__portrait--${name}`}
                src={portrait.src}
                alt=""
                width={portrait.width}
                height={portrait.height}
                draggable={false}
              />
            </div>
          )}
          <img
            className="character-chat__layer"
            src={documentBackground}
            alt=""
            width="1500"
            height="3249"
            draggable={false}
          />
        </div>

        <button
          ref={portraitButtonRef}
          className={portrait ? `character-chat__portrait-button character-chat__portrait-button--${name}` : "character-chat__open-conversation"}
          type="button"
          aria-label={`Open conversation with ${displayName}`}
          aria-controls="character-conversation"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen(true)}
        >
          {!portrait && "Open conversation"}
        </button>

        <section
          id="character-conversation"
          className="character-chat__panel"
          aria-label="Conversation"
          hidden={!panelOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              hideConversation();
            }
          }}
        >
          <button
            className="character-chat__close"
            type="button"
            aria-label="Hide conversation"
            onClick={hideConversation}
          >
            <span aria-hidden="true">×</span>
          </button>
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
            {waiting && (
              <p className="character-chat__status">
                Loading conversation...
              </p>
            )}

            {!waiting && messages.length === 0 && !error && (
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

          {!waiting && error && (
            <p className="character-chat__error" role="alert">
              {error}
              {errorStatus === 401 && (
                <> <Link to="/login" state={{ from: location.pathname }}>Log in</Link></>
              )}
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
            disabled={waiting || sending || accessDenied}
            placeholder="Write a message..."
          />
          <button
            className="character-chat__send"
            type="submit"
            disabled={waiting || sending || accessDenied || !draft.trim()}
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
