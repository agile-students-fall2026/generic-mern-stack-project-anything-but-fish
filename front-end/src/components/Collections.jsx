import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGameData } from "../hooks/useGameData";
import GameDataStatus from "./GameDataStatus";
import background from "../assets/collections/background.png";
import photoOne from "../assets/collections/photo-1.png";
import photoTwo from "../assets/collections/photo-2.png";
import photoThree from "../assets/collections/photo-3.png";
import redThread from "../assets/collections/red-thread.png";
import backIcon from "../assets/game/home-icon.png";
import "./Collections.css";

const photoArtwork = {
  "photo-1": photoOne,
  "photo-2": photoTwo,
  "photo-3": photoThree,
};

export default function Collections() {
  const { data, loading, error, retry } = useGameData("collections");
  const collectionItems = loading || error ? [] : (data?.items ?? []).filter((item) => Object.hasOwn(photoArtwork, item.id));
  const [selectedId, setSelectedId] = useState(null);
  const selectedItem = collectionItems.find((item) => item.id === selectedId);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedItem && !dialog.open) dialog.showModal();
    else if (!selectedItem && dialog.open) dialog.close();
  }, [selectedItem]);

  function closeDetails() {
    dialogRef.current.close();
    setSelectedId(null);
  }

  return (
    <main className="collections" aria-label="Collections">
      <div className="collections__canvas">
        <div className="collections__artwork" aria-hidden="true">
          {[background, ...collectionItems.map((item) => photoArtwork[item.id]), redThread].map((image) => (
            <img
              key={image}
              className="collections__layer"
              src={image}
              alt=""
              width="1500"
              height="3249"
              draggable={false}
            />
          ))}
        </div>
        {collectionItems.map((item) => (
          <button
            key={item.id}
            className={`collections__photo collections__photo--${item.id}`}
            type="button"
            aria-label={`View ${item.title}`}
            aria-haspopup="dialog"
            onClick={() => setSelectedId(item.id)}
          />
        ))}
        <Link className="collections__back" to="/starting" aria-label="Back to home">
          <img src={backIcon} alt="" width="152" height="152" draggable={false} />
        </Link>
      </div>

      {(loading || error || collectionItems.length === 0) && (
        <div className="collections__status">
          <GameDataStatus loading={loading} error={error} onRetry={retry} emptyMessage="No collections unlocked yet." />
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="collections__overlay"
        aria-labelledby="collection-detail-title"
        aria-describedby="collection-detail-description"
        onClose={() => setSelectedId(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDetails();
        }}
      >
        <section className="collections__details">
          <button
            className="collections__close"
            type="button"
            aria-label="Close collection details"
            onClick={closeDetails}
            autoFocus
          >
            ×
          </button>
          <h1 id="collection-detail-title">{selectedItem?.title}</h1>
          <p id="collection-detail-description">{selectedItem?.description}</p>
        </section>
      </dialog>
    </main>
  );
}
