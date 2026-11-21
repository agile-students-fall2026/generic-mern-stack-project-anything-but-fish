import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useGameData } from "../hooks/useGameData";
import GameDataStatus from "./GameDataStatus";
import environment from "../assets/chat/environment.png";
import emojiCat from "../assets/chat/emoji-cat.png";
import backIcon from "../assets/game/home-icon.png";
import "./ChooseCharacter.css";

export default function ChooseCharacter() {
  const { user, loading } = useAuth();
  return <CharacterSelection key={user?.id ?? "guest"} checkingSession={loading} user={user} />;
}

function CharacterSelection({ checkingSession, user }) {
  const navigate = useNavigate();
  const { data, loading, error, retry } = useGameData("characters");
  const waiting = loading || (checkingSession && import.meta.env.MODE !== "demo");
  const characters = waiting || error ? [] : data?.characters ?? [];

  return (
    <main className="choose-character" aria-label="Choose character">
      <div className="choose-character__canvas">
        <img
          className="choose-character__background"
          src={environment}
          alt=""
          width="1500"
          height="3249"
          draggable={false}
        />
        <Link
          className="choose-character__back"
          to="/starting"
          aria-label="Back to home"
        >
          <img
            src={backIcon}
            alt=""
            width="152"
            height="152"
            draggable={false}
          />
        </Link>
        <nav className="choose-character__list" aria-label="Characters">
          {(waiting || error || characters.length === 0) && (
            <div className="choose-character__status">
              <GameDataStatus loading={waiting} error={error} onRetry={retry} emptyMessage="No characters available yet." />
              {!waiting && error && !user && import.meta.env.MODE !== "demo" && (
                <Link to="/login" state={{ from: "/chat" }}>Log in</Link>
              )}
            </div>
          )}
          {characters.map(({ name, displayName }) => (
            <button
              className="choose-character__button"
              key={name}
              type="button"
              onClick={() => navigate(`/chat/${encodeURIComponent(name)}`)}
            >
              {displayName}
            </button>
          ))}
        </nav>
        <img
          className="choose-character__cat"
          src={emojiCat}
          alt=""
          width="114"
          height="112"
          draggable={false}
        />
      </div>
    </main>
  );
}
