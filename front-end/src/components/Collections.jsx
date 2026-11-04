import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import background from "../assets/collections/background.png";
import photoOne from "../assets/collections/photo-1.png";
import photoTwo from "../assets/collections/photo-2.png";
import photoThree from "../assets/collections/photo-3.png";
import redThread from "../assets/collections/red-thread.png";
import backIcon from "../assets/game/home-icon.png";
import "./Collections.css";

const collectionItems = [
  {
    id: "photo-1",
    image: photoOne,
    title: "Ancient gold coin",
    description: "Desire drives two researchers to fight over a rare mineral. The mineral is cursed: the more people possess, the more they crave. Their conflict ends in a fatal stabbing.",
  },
  {
    id: "photo-2",
    image: photoTwo,
    title: "White bench",
    description: "A new friendship hides a terrible secret. A human-like monster disguises herself to gain a researcher's trust, only to kill him in the end.",
  },
  {
    id: "photo-3",
    image: photoThree,
    title: "?",
    description: "Two researchers create an artificial human together. One wants to build an army for power, but the other refuses. They fight and part ways.",
  },
];

export default function Collections() {
  const [selectedItem, setSelectedItem] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedItem && !dialog.open) dialog.showModal();
  }, [selectedItem]);

  function closeDetails() {
    dialogRef.current.close();
    setSelectedItem(null);
  }

  return (
    <main className="collections" aria-label="Collections">
      <div className="collections__canvas">
        <div className="collections__artwork" aria-hidden="true">
          {[background, ...collectionItems.map((item) => item.image), redThread].map((image) => (
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
            onClick={() => setSelectedItem(item)}
          />
        ))}
        <Link className="collections__back" to="/starting" aria-label="Back to home">
          <img src={backIcon} alt="" width="152" height="152" draggable={false} />
        </Link>
      </div>

      <dialog
        ref={dialogRef}
        className="collections__overlay"
        aria-labelledby="collection-detail-title"
        aria-describedby="collection-detail-description"
        onClose={() => setSelectedItem(null)}
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
