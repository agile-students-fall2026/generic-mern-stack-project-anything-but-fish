import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import storyEntries, { chapterTitle } from "../content/story/ancient-gold-coin.js";
import deskBackground from "../assets/game/desk-background.png";
import folderBackground from "../assets/game/folder-background.png";
import clipboardClip from "../assets/game/clipboard-clip.png";
import documentBackground from "../assets/game/document-background.png";
import map from "../assets/game/map.png";
import note from "../assets/game/note.png";
import pen from "../assets/game/pen.png";
import badge from "../assets/game/badge.png";
import portrait from "../assets/game/portrait.png";
import ivanPortrait from "../assets/game/ivan-portrait.png";
import onaPortrait from "../assets/game/ona-portrait.png";
import radio from "../assets/game/radio.png";
import fishingHook from "../assets/game/fishing-hook.png";
import paperclip from "../assets/game/paperclip.png";
import homeIcon from "../assets/game/home-icon.png";
import inventoryIcon from "../assets/game/inventory-icon.png";
import settingsIcon from "../assets/game/settings-icon.png";
import "./Game.css";

// Back to front, matching the supplied layer stack. Every PNG retains its canvas.
const backgroundLayers = [
  deskBackground,
  folderBackground,
  documentBackground,
];

const foregroundLayers = [
  map,
  note,
  pen,
  badge,
];

const speakerPortraits = {
  ivan: ivanPortrait,
  ona: onaPortrait,
};

function ArtworkLayer({ src, className = "" }) {
  return (
    <img
      className={`game__layer ${className}`}
      src={src}
      alt=""
      width="1760"
      height="3808"
      draggable={false}
    />
  );
}

export default function Game() {
  const { page } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pageNumber = Number(page);
  if (!/^[1-9]\d*$/.test(page ?? "") || pageNumber > storyEntries.length) {
    return <Navigate to="/game/1" replace />;
  }

  const { background, dialogue, speaker } = storyEntries[pageNumber - 1];
  const speakerPortrait = Object.hasOwn(speakerPortraits, speaker) ? speakerPortraits[speaker] : null;

  function closeModal() {
    if (location.state?.overlay) navigate(-1);
    else navigate(`/game/${pageNumber}`, { replace: true });
  }

  return (
    <main className="game" aria-label="Story">
      <div className="game__canvas">
        {backgroundLayers.map((src) => <ArtworkLayer key={src} src={src} />)}
        <div className="game__scene-mask" aria-hidden="true">
          <svg
            key={background.src}
            className="game__scene"
            viewBox={background.viewBox}
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            <image href={background.src} width={background.width} height={background.height} />
          </svg>
        </div>
        <div className="game__top-art" aria-hidden="true">
          <ArtworkLayer src={clipboardClip} />
          <ArtworkLayer src={fishingHook} className="game__line-top" />
          <ArtworkLayer src={paperclip} />
        </div>
        <div className="game__bottom-art">
          {foregroundLayers.map((src) => <ArtworkLayer key={src} src={src} />)}
          {speakerPortrait ? (
            <img
              className="game__portrait"
              src={speakerPortrait}
              alt=""
              width="561"
              height="517"
              draggable={false}
            />
          ) : <ArtworkLayer src={portrait} />}
          <ArtworkLayer src={radio} />
          <p className="game__dialogue" aria-live="polite" aria-atomic="true">
            <span className="game__dialogue-shadow" aria-hidden="true">{dialogue}</span>
            <span className="game__dialogue-text">{dialogue}</span>
          </p>
          <ArtworkLayer src={fishingHook} className="game__line-bottom" />
          <Link className="game__hook" to="save-load" state={{ overlay: true }} aria-label="Save and load" aria-haspopup="dialog" title="Save / Load" />
          <span className="game__hook-highlight" aria-hidden="true" />
          <button
            className="game__page-button game__page-button--previous"
            type="button"
            aria-label="Previous dialogue"
            disabled={pageNumber === 1}
            onClick={() => navigate(`/game/${pageNumber - 1}`)}
          />
          <button
            className="game__page-button game__page-button--next"
            type="button"
            aria-label="Next dialogue"
            disabled={pageNumber === storyEntries.length}
            onClick={() => navigate(`/game/${pageNumber + 1}`)}
          />
        </div>
        <nav className="game__tools" aria-label="Story options">
          <Link className="game__tool" to="/starting" aria-label="Back to home">
            <img src={homeIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
          <Link className="game__tool" to="inventory" state={{ overlay: true }} aria-label="Inventory" aria-haspopup="dialog">
            <img src={inventoryIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
          <Link className="game__tool" to="settings" state={{ overlay: true }} aria-label="Settings" aria-haspopup="dialog">
            <img src={settingsIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
        </nav>
      </div>
      <Outlet context={{ closeModal, page: pageNumber, chapterTitle }} />
    </main>
  );
}
