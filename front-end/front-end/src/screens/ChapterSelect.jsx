import { backgrounds } from "../data/fakeData";

// Screen 1: grid of chapters. Page background + one image per chapter tile.
export default function ChapterSelect({ chapters, onPick, onBack }) {
  return (
    <div
      className="screen page-bg"
      style={{ backgroundImage: `url(${backgrounds.chapters})` }}>
      <button className="back-btn" onClick={onBack} aria-label="Back to main menu">↩</button>

      <div className="tile-grid">
        {chapters.map((ch) => (
          <button key={ch.id} className="chapter-tile" onClick={() => onPick(ch)}>
            <img src={ch.cover} alt="" />
            <span className="chapter-title">{ch.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
