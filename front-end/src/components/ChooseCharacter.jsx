import { Link, useNavigate } from "react-router-dom";
import { useGameData } from "../hooks/useGameData";
import GameDataStatus from "./GameDataStatus";
import environment from "../assets/chat/environment.png";
import emojiCat from "../assets/chat/emoji-cat.png";
import backIcon from "../assets/game/home-icon.png";
import "./ChooseCharacter.css";

export default function ChooseCharacter() {
  const navigate = useNavigate();
  const { data, loading, error, retry } = useGameData("characters");
  const characters = loading || error ? [] : data?.characters ?? [];

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
          {(loading || error || characters.length === 0) && (
            <div className="choose-character__status">
              <GameDataStatus loading={loading} error={error} onRetry={retry} emptyMessage="No characters available yet." />
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
