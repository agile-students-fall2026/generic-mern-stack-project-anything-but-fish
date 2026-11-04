import { backgrounds } from "../data/fakeData";

// Screen 2: grid of characters. Page background + image per character,
// with the name written BELOW the image (not on it).
export default function CharacterSelect({ chapter, onPick, onBack }) {
  return (
    <div
      className="screen page-bg"
      style={{ backgroundImage: `url(${backgrounds.characters})` }}
    >
      <button className="back-btn" onClick={onBack} aria-label="Back to chapters">↩</button>

      <div className="tile-grid">
        {chapter.characters.map((c) => (
          <button key={c.id} className="character-card" onClick={() => onPick(c)}>
            <img src={c.image} alt="" />
            <span className="character-name">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
