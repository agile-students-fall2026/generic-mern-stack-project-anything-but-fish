import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import chapter from "../content/story/ancient-gold-coin.json";
import deskBackground from "../assets/game/desk-background.png";
import folderBackground from "../assets/game/folder-background.png";
import clipboardClip from "../assets/game/clipboard-clip.png";
import documentBackground from "../assets/game/document-background.png";
import map from "../assets/game/map.png";
import note from "../assets/game/note.png";
import pen from "../assets/game/pen.png";
import badge from "../assets/game/badge.png";
import portrait from "../assets/game/portrait.png";
import radio from "../assets/game/radio.png";
import fishingHook from "../assets/game/fishing-hook.png";
import paperclip from "../assets/game/paperclip.png";
import homeIcon from "../assets/game/home-icon.png";
import inventoryIcon from "../assets/game/inventory-icon.png";
import settingsIcon from "../assets/game/settings-icon.png";
import callFromDeep from "../assets/game/scenes/call-from-deep.png";
import sceneThree from "../assets/game/scenes/img3.png";
import sceneOne from "../assets/game/scenes/img1.png";
import legacy from "../assets/game/scenes/legacy.png";
import "./Game.css";

// Back to front, matching the supplied layer stack. Every PNG retains its canvas.
const backgroundLayers = [
  deskBackground,
  folderBackground,
  clipboardClip,
  documentBackground,
];

const foregroundLayers = [
  map,
  note,
  pen,
  badge,
  portrait,
  radio,
];

const dialoguePages = chapter.pages.filter((page) => page.speaker && page.content?.length);
const scenes = [
  { src: callFromDeep, width: 2388, height: 1668, viewBox: "0 0 2388 1668" },
  { src: sceneThree, width: 1714, height: 2668, viewBox: "0 0 1714 2668" },
  { src: sceneOne, width: 1714, height: 2668, viewBox: "0 0 1714 2668" },
  // Ignore this export's transparent padding without modifying the original file.
  { src: legacy, width: 1875, height: 3204, viewBox: "123 253 1664 1518" },
];

function ArtworkLayer({ src }) {
  return (
    <img
      className="game__layer"
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
  const pageNumber = Number(page);
  // Assign once per visit so returning to a dialogue keeps the same illustration.
  const [pageScenes] = useState(() => dialoguePages.map(() => (
    scenes[Math.floor(Math.random() * scenes.length)]
  )));

  if (!/^[1-9]\d*$/.test(page ?? "") || !Number.isSafeInteger(pageNumber) || pageNumber > dialoguePages.length) {
    return <Navigate to="/game/1" replace />;
  }

  // A route change also cancels any unfinished image load for the previous page.
  return <GamePage key={pageNumber} pageIndex={pageNumber - 1} pageScenes={pageScenes} />;
}

function GamePage({ pageIndex, pageScenes }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [changingPage, setChangingPage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pendingPage = useRef(null);
  const dialogue = dialoguePages[pageIndex].content.join("\n\n");
  const scene = pageScenes[pageIndex];

  function closeModal() {
    if (location.state?.overlay) navigate(-1);
    else navigate(`/game/${pageIndex + 1}`, { replace: true });
  }

  function openPopup() {
    // A late scene-image response must not navigate away from a newly opened popup.
    pendingPage.current = null;
    setChangingPage(false);
  }

  useEffect(() => () => { pendingPage.current = null; }, []);

  async function changePage(direction) {
    const nextIndex = Math.max(0, Math.min(dialoguePages.length - 1, pageIndex + direction));
    if (pendingPage.current || nextIndex === pageIndex) return;

    const request = {};
    pendingPage.current = request;
    setChangingPage(true);
    setImageError(false);

    try {
      const image = new Image();
      image.src = pageScenes[nextIndex].src;
      await image.decode();
      // Keep the current picture and dialogue until the next image is ready.
      if (pendingPage.current === request) navigate(`/game/${nextIndex + 1}`);
    } catch {
      if (pendingPage.current === request) setImageError(true);
    } finally {
      if (pendingPage.current === request) {
        pendingPage.current = null;
        setChangingPage(false);
      }
    }
  }

  return (
    <main className="game" aria-label="Story">
      <div className="game__canvas" aria-busy={changingPage}>
        {backgroundLayers.map((src) => <ArtworkLayer key={src} src={src} />)}
        <div className="game__scene-mask" aria-hidden="true">
          <svg
            key={scene.src}
            className="game__scene"
            viewBox={scene.viewBox}
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            <image href={scene.src} width={scene.width} height={scene.height} />
          </svg>
        </div>
        {foregroundLayers.map((src) => <ArtworkLayer key={src} src={src} />)}
        <p className="game__dialogue" aria-live="polite" aria-atomic="true">
          <span className="game__dialogue-shadow" aria-hidden="true">{dialogue}</span>
          <span className="game__dialogue-text">{dialogue}</span>
        </p>
        {imageError && (
          <p className="game__image-error" role="alert">
            Image could not load. Please try again.
          </p>
        )}
        <ArtworkLayer src={fishingHook} />
        <ArtworkLayer src={paperclip} />
        <nav className="game__tools" aria-label="Story options">
          <Link className="game__tool" to="/starting" aria-label="Back to home">
            <img src={homeIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
          <Link className="game__tool" to="inventory" state={{ overlay: true }} onClick={openPopup} aria-label="Inventory" aria-haspopup="dialog">
            <img src={inventoryIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
          <Link className="game__tool" to="settings" state={{ overlay: true }} onClick={openPopup} aria-label="Settings" aria-haspopup="dialog">
            <img src={settingsIcon} alt="" width="152" height="152" draggable={false} />
          </Link>
        </nav>
        <Link className="game__hook" to="save-load" state={{ overlay: true }} onClick={openPopup} aria-label="Save and load" aria-haspopup="dialog" title="Save / Load" />
        <button
          className="game__page-button game__page-button--previous"
          type="button"
          aria-label="Previous dialogue"
          disabled={changingPage || pageIndex === 0}
          onClick={() => changePage(-1)}
        />
        <button
          className="game__page-button game__page-button--next"
          type="button"
          aria-label="Next dialogue"
          disabled={changingPage || pageIndex === dialoguePages.length - 1}
          onClick={() => changePage(1)}
        />
      </div>
      <Outlet context={{ closeModal, page: pageIndex + 1, chapterTitle: chapter.title }} />
    </main>
  );
}
