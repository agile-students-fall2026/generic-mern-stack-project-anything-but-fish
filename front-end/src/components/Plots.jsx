import { useEffect, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import background from "../assets/plots/background.png";
import characters from "../assets/plots/characters.png";
import chapters from "../assets/plots/chapters.png";
import objects from "../assets/plots/objects.png";
import backIcon from "../assets/game/home-icon.png";
import { useGameData } from "../hooks/useGameData";
import GameDataStatus from "./GameDataStatus";
import "./Plots.css";

export default function Plots() {
  const { category: categoryId, entryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error, retry } = useGameData("plots");
  const plotCategories = data?.categories ?? [];
  const category = plotCategories.find((item) => item.id === categoryId);
  const entry = category?.entries.find((item) => item.id === entryId);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const detailHeadingRef = useRef(null);
  const categoryButtons = useRef(new Map());
  const entryButtons = useRef(new Map());
  const previousView = useRef({ category: null, entry: null });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previous = previousView.current;
    if (category) {
      if (!dialog.open) {
        dialog.showModal();
        closeRef.current?.focus({ preventScroll: true });
      }
      if (entry) {
        detailHeadingRef.current?.focus({ preventScroll: true });
      } else if (previous.category === category.id && previous.entry) {
        entryButtons.current.get(previous.entry)?.focus({ preventScroll: true });
      }
    } else if (dialog.open) {
      dialog.close();
      categoryButtons.current.get(previous.category)?.focus({ preventScroll: true });
    }
    previousView.current = { category: category?.id, entry: entry?.id };
  }, [category, entry, entryId]);

  function closeArchive() {
    // Unwind internal navigation; direct links do not have a board in their history.
    if (location.state?.fromPlots) navigate(entry ? -2 : -1);
    else navigate("/plots", { replace: true });
  }

  function goBack() {
    if (!entry) closeArchive();
    else if (location.state?.fromList) navigate(-1);
    else navigate(`/plots/${category.id}`, { replace: true });
  }

  // Wait for the API before treating a deep link as an unknown entry.
  if (data && categoryId && !category) return <Navigate to="/plots" replace />;
  if (data && entryId && !entry) return <Navigate to={`/plots/${category.id}`} replace />;

  return (
    <main className="plots" aria-label="Plots">
      <div className="plots__canvas">
        <div className="plots__artwork" aria-hidden="true">
          {[background, characters, chapters, objects].map((image) => (
            <img className="plots__layer" key={image} src={image} alt="" width="1500" height="3249" draggable={false} />
          ))}
        </div>
        {plotCategories.map((item) => (
          <button
            key={item.id}
            ref={(node) => { if (node) categoryButtons.current.set(item.id, node); else categoryButtons.current.delete(item.id); }}
            className={`plots__category plots__category--${item.id}`}
            type="button"
            aria-label={item.title}
            aria-haspopup="dialog"
            onClick={() => navigate(`/plots/${item.id}`, { state: { fromPlots: true } })}
          />
        ))}
        <Link className="plots__home" to="/starting" aria-label="Back to home">
          <img src={backIcon} alt="" width="152" height="152" draggable={false} />
        </Link>
      </div>

      {(loading || error || plotCategories.length === 0) && (
        <div className="plots__status">
          <GameDataStatus loading={loading} error={error} onRetry={retry} emptyMessage="No archive categories are available yet." />
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="plots__overlay"
        aria-labelledby={entry ? "plots-detail-title" : "plots-list-title"}
        onCancel={(event) => { event.preventDefault(); goBack(); }}
        onClick={(event) => { if (event.target === event.currentTarget) goBack(); }}
      >
        {category && (
          <div className="plots__panel">
            <header className="plots__toolbar">
              <button className="plots__return" type="button" onClick={goBack}>
                <span aria-hidden="true">←</span> {entry ? category.title : "Plots"}
              </button>
              <button ref={closeRef} className="plots__close" type="button" aria-label="Close archive" onClick={closeArchive} autoFocus>×</button>
            </header>
            <div className="plots__views">
              {/* Keep the list laid out so its scroll position survives details. */}
              <section className={`plots__list-pane${entry ? " plots__list-pane--covered" : ""}`} inert={!!entry} aria-hidden={entry ? true : undefined}>
                <h1 id="plots-list-title" className="plots__list-title">{category.title}</h1>
                <div className="plots__list-scroll">
                  {category.entries.length === 0 && <GameDataStatus emptyMessage="No entries unlocked in this category yet." />}
                  <ul className="plots__list">
                    {category.entries.map((item) => (
                      <li key={item.id}>
                        <button
                          ref={(node) => { if (node) entryButtons.current.set(item.id, node); else entryButtons.current.delete(item.id); }}
                          className="plots__entry"
                          type="button"
                          onClick={() => navigate(`/plots/${category.id}/${item.id}`, { state: { fromList: true, fromPlots: !!location.state?.fromPlots } })}
                        >
                          <span className="plots__entry-title">{item.title}</span>
                          <span className="plots__entry-meta">
                            <span className="plots__entry-line" aria-hidden="true" />
                            <span className="plots__entry-count">collected {item.collected}/{item.total}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              {entry && (
                <section className="plots__detail" key={entry.id} aria-labelledby="plots-detail-title">
                  <div className="plots__detail-copy">
                    <p className="plots__detail-category">{category.title}</p>
                    <h1 id="plots-detail-title" ref={detailHeadingRef} tabIndex={-1}>{entry.title}</h1>
                    {entry.description.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
