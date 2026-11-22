import { memo, useCallback, useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import StoryScene from "./StoryScene.jsx";
import { ItemRewardNotifications, itemAcquiredImages } from "./ItemAcquired.jsx";
import usePreloadedImages from "../hooks/usePreloadedImages.js";
import useChapterProgress from "../hooks/useChapterProgress.js";
import { useAuth } from "../auth/AuthContext";
import { getEntryPage } from "../lib/chapter-api.js";
import storyEntries, { chapterId, chapterTitle } from "../content/story/ancient-gold-coin.js";
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
import storyMask from "../assets/game/story-illustration.png";
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

const gameImages = [...new Set([
  ...storyEntries.map(({ background }) => background.src),
  ...backgroundLayers,
  ...foregroundLayers,
  ...Object.values(speakerPortraits),
  clipboardClip, fishingHook, paperclip, portrait, radio,
  homeIcon, inventoryIcon, settingsIcon, storyMask,
  ...itemAcquiredImages,
])];

function StoryLoading({ completed, error, retry }) {
  return (
    <div className="game__loading">
      {error ? (
        <>
          <p role="alert">The story images couldn’t load.</p>
          <button type="button" onClick={retry}>Try again</button>
        </>
      ) : (
        <div role="status">
          <p>Preparing your story…</p>
          <progress aria-label="Story images loaded" value={completed} max={gameImages.length} />
          <p className="game__loading-count">{completed} / {gameImages.length}</p>
        </div>
      )}
      <Link to="/starting">Back to home</Link>
    </div>
  );
}

const ArtworkLayer = memo(function ArtworkLayer({ src, className = "" }) {
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
});

export default function Game() {
  const { user, loading } = useAuth();
  const demo = import.meta.env.MODE === "demo" && import.meta.env.VITE_ENABLE_MOCKS !== "false";
  return <GameReader key={demo ? "demo" : (user?.id ?? "guest")} checkingSession={!demo && loading} progressEnabled={demo || !!user} />;
}

function GameReader({ checkingSession, progressEnabled }) {
  const { page } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pageNumber = Number(page);
  const entry = storyEntries[pageNumber - 1];
  const preload = usePreloadedImages(gameImages);
  const chapter = useChapterProgress(chapterId, progressEnabled);
  const [dismissedCompletion, setDismissedCompletion] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [displayedScene, setDisplayedScene] = useState(null);
  const [sceneError, setSceneError] = useState(false);
  const [sceneAttempt, setSceneAttempt] = useState(0);
  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
    setDisplayedScene(entry?.background.src);
    setSceneError(false);
  }, [entry?.background.src]);
  const handleSceneError = useCallback(() => setSceneError(true), []);
  const savedPage = getEntryPage(storyEntries, chapter.progress?.entryId ?? null);
  const furthestPage = chapter.progress?.furthestEntryId == null ? 0 : getEntryPage(storyEntries, chapter.progress.furthestEntryId);
  const unavailableEntry = progressEnabled && chapter.progress && (savedPage === null || furthestPage === null);
  const lockedPage = progressEnabled && chapter.progress && !unavailableEntry && pageNumber > furthestPage + 1;
  const updating = chapter.saving || chapter.completing;
  const progressPending = progressEnabled && (chapter.loading || updating || !!chapter.error || chapter.progress?.entryId !== entry?.id);

  useEffect(() => {
    if (!entry || checkingSession || chapter.loading || lockedPage || unavailableEntry) setDisplayedScene(null);
  }, [entry?.id, checkingSession, chapter.loading, lockedPage, unavailableEntry]);

  useEffect(() => {
    if (entry && displayedScene === entry.background.src && !sceneError && preload.ready && !checkingSession && !chapter.loading && !lockedPage && !unavailableEntry) {
      chapter.recordEntry(entry.id);
    }
  }, [entry?.id, displayedScene, sceneError, preload.ready, checkingSession, chapter.loading, chapter.recordEntry, lockedPage, unavailableEntry]);

  function resumeProgress() {
    chapter.resume();
    navigate(`/game/${savedPage ?? 1}`, { replace: true });
  }

  if (checkingSession || chapter.loading || unavailableEntry || lockedPage || chapter.error?.action === "read") {
    return (
      <main className="game" aria-label="Story">
        <div className="game__loading">
          {checkingSession || chapter.loading ? <p role="status">Loading your chapter progress…</p> : (
            <>
              <p role="alert">{chapter.error?.message || (unavailableEntry
                ? "Your saved story entry is unavailable in this version."
                : "Continue from your saved progress before opening this part of the chapter.")}</p>
              {chapter.error && <button type="button" onClick={chapter.retry}>Retry</button>}
              {lockedPage && <button type="button" onClick={resumeProgress}>Resume saved progress</button>}
            </>
          )}
          <Link to="/starting">Back to home</Link>
        </div>
      </main>
    );
  }

  if (page === undefined) return <Navigate to={`/game/${savedPage ?? 1}${location.state?.openInventory ? "/inventory" : ""}`} replace />;
  if (!/^[1-9]\d*$/.test(page ?? "") || pageNumber > storyEntries.length) {
    return <Navigate to="/game" replace />;
  }

  const { background, camera, dialogue, speaker } = entry;
  const dialogueText = dialogue?.trim() ? dialogue : "...";
  const speakerPortrait = Object.hasOwn(speakerPortraits, speaker) ? speakerPortraits[speaker] : null;

  function closeModal() {
    if (location.state?.overlay) navigate(-1);
    else navigate(`/game/${pageNumber}`, { replace: true });
  }

  function retryScene() {
    setSceneError(false);
    setSceneAttempt((value) => value + 1);
  }

  if (!preload.ready) {
    return (
      <main className="game" aria-label="Story" aria-busy={!preload.error}>
        <StoryLoading {...preload} />
      </main>
    );
  }

  return (
    <main className="game" aria-label="Story" aria-busy={!sceneReady}>
      {(!sceneReady || sceneError) && (
        <StoryLoading {...preload} error={sceneError} retry={retryScene} />
      )}
      <div className="game__canvas" inert={!sceneReady || sceneError} aria-hidden={!sceneReady || sceneError}>
        {backgroundLayers.map((src) => <ArtworkLayer key={src} src={src} />)}
        <div className="game__scene-mask" aria-hidden="true">
          <StoryScene
            background={background}
            camera={camera}
            onReady={handleSceneReady}
            onError={handleSceneError}
            attempt={sceneAttempt}
          />
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
            <span className="game__dialogue-shadow" aria-hidden="true">{dialogueText}</span>
            <span className="game__dialogue-text">{dialogueText}</span>
          </p>
          <ArtworkLayer src={fishingHook} className="game__line-bottom" />
          <Link className="game__hook" to="save-load" state={{ overlay: true }} aria-label="Save and load" aria-haspopup="dialog" title="Save / Load" />
          <span className="game__hook-highlight" aria-hidden="true" />
          <button
            className="game__page-button game__page-button--previous"
            type="button"
            aria-label="Previous dialogue"
            disabled={pageNumber === 1 || progressPending}
            onClick={() => navigate(`/game/${pageNumber - 1}`)}
          />
          <button
            className="game__page-button game__page-button--next"
            type="button"
            aria-label="Next dialogue"
            disabled={pageNumber === storyEntries.length || progressPending}
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
        {chapter.completion?.awardedItems.length > 0 && chapter.completion !== dismissedCompletion && (
          <ItemRewardNotifications key={chapter.completion.progress.completedAt} rewards={chapter.completion.awardedItems}
            onComplete={() => setDismissedCompletion(chapter.completion)} />
        )}
        {(updating || chapter.error || pageNumber === storyEntries.length) && (
          <div className="game__progress" aria-live="polite">
            {chapter.error ? (
              <>
                <p role="alert">{chapter.error.message}</p>
                <button type="button" onClick={chapter.retry}>Retry</button>
                {chapter.error.status === 409 && <button type="button" onClick={resumeProgress}>Resume saved progress</button>}
                {chapter.error.status === 401 && <Link to="/login" state={{ from: location.pathname }}>Log in</Link>}
              </>
            ) : updating ? <p>{chapter.completing ? "Completing chapter…" : "Saving progress…"}</p>
              : pageNumber === storyEntries.length && (
                progressEnabled ? chapter.progress?.completedAt ? (
                  <p>{chapter.completion?.awardedItems.length ? "Chapter complete. Your reward is in your inventory." : "Chapter completed."}</p>
                ) : <button type="button" disabled={progressPending} onClick={chapter.finish}>Finish chapter</button>
                  : <p><Link to="/login" state={{ from: location.pathname }}>Log in</Link>{" "}to complete the chapter and receive its reward.</p>
              )}
          </div>
        )}
      </div>
      <Outlet context={{ closeModal, page: pageNumber, chapterTitle }} />
    </main>
  );
}
