import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import chapter from "../content/story/ancient-gold-coin.json";
import DialoguePage from "./story/DialoguePage";
import ArchivePage from "./story/ArchivePage";
import "./GameOld.css";

export default function GameOld() {
  const navigate = useNavigate();
  const { page } = useParams();
  const { pages } = chapter;
  const pageIndex = pages.findIndex((entry) => entry.id === page);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  if (!page) {
    return <Navigate to={`/game-old/${pages[0].id}`} replace />;
  }

  if (pageIndex === -1) {
    return (
      <main className="story-reader story-reader--missing">
        <h1>Story page not found</h1>
        <p>This page is not part of the chapter.</p>
        <button onClick={() => navigate("/game-old")}>Open chapter</button>{" "}
        <button onClick={() => navigate("/starting")}>Main Screen</button>
      </main>
    );
  }

  const currentPage = pages[pageIndex];
  const character = chapter.characters[currentPage.speaker];
  const previousPage = pages[pageIndex - 1];
  const nextPage = pages[pageIndex + 1];

  return (
    <main className={`story-reader story-reader--${currentPage.template}`}>
      <header className="story-reader__header">
        <h1>{chapter.title}</h1>
        <p>Page {pageIndex + 1} of {pages.length}</p>
      </header>

      {currentPage.template === "archive" ? (
        <ArchivePage key={currentPage.id} page={currentPage} />
      ) : (
        <DialoguePage key={currentPage.id} page={currentPage} character={character} />
      )}

      <footer className="story-reader__footer">
        {!nextPage && <p>End of chapter.</p>}
        <nav className="story-reader__controls" aria-label="Story pages">
          <button disabled={!previousPage} onClick={() => navigate(`/game-old/${previousPage.id}`)}>
            Previous Page
          </button>
          <button disabled={!nextPage} onClick={() => navigate(`/game-old/${nextPage.id}`)}>
            Next Page
          </button>
        </nav>
        <nav className="story-reader__controls" aria-label="Game options">
          <button onClick={() => navigate("/inventory", { state: { from: `/game-old/${currentPage.id}` } })}>
            Inventory
          </button>
          <button onClick={() => navigate(`/game-old/${currentPage.id}/settings`)}>Settings</button>
          <button onClick={() => navigate(`/game-old/${currentPage.id}/save-load`)}>Save / Load</button>
          <button onClick={() => navigate("/starting")}>Main Screen</button>
        </nav>
      </footer>
    </main>
  );
}
