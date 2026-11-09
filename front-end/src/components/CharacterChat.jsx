import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import environment from "../assets/chat/environment.png";
import cislo from "../assets/chat/cislo.png";
import documentBackground from "../assets/chat/document-background.png";
import inputFrame from "../assets/chat/input-frame.png";
import twoCats from "../assets/chat/two-cats.png";
import emojiCat from "../assets/chat/emoji-cat.png";
import backIcon from "../assets/game/home-icon.png";
import inventoryIcon from "../assets/game/inventory-icon.png";
import "./CharacterChat.css";

export default function CharacterChat() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  function closeModal() {
    if (location.state?.overlay) navigate(-1);
    else navigate(`/chat/${encodeURIComponent(name)}`, { replace: true });
  }

  return (
    <main className="character-chat" aria-label={`Chat with ${name}`}>
      <div className="character-chat__canvas">
        <div className="character-chat__artwork" aria-hidden="true">
          {[environment, cislo, documentBackground].map((src) => (
            <img className="character-chat__layer" key={src} src={src} alt="" width="1500" height="3249" draggable={false} />
          ))}
        </div>
        <div className="character-chat__composer">
          <img className="character-chat__input-frame" src={inputFrame} alt="" width="1397" height="801" draggable={false} />
          <textarea
            className="character-chat__input"
            aria-label={`Message ${name}`}
            name="message"
          />
          <button className="character-chat__emoji" type="button" aria-label="Emoji (coming soon)" disabled>
            <img src={emojiCat} alt="" width="114" height="112" draggable={false} />
          </button>
          <img className="character-chat__cats" src={twoCats} alt="" width="1088" height="464" draggable={false} />
        </div>
        <nav className="character-chat__tools" aria-label="Chat options">
          <Link className="character-chat__tool" to="/chat" aria-label="Back to characters">
            <img src={backIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
          <Link className="character-chat__tool" to="inventory" state={{ overlay: true }} aria-label="Inventory" aria-haspopup="dialog">
            <img src={inventoryIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
        </nav>
      </div>
      <Outlet context={{ closeModal }} />
    </main>
  );
}
