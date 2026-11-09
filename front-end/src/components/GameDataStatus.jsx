import "./GameDataStatus.css";

export default function GameDataStatus({ loading, error, onRetry, emptyMessage }) {
  if (!loading && !error && !emptyMessage) return null;
  return (
    <div className="game-data-status" role={error ? "alert" : "status"}>
      <p>{loading ? "Loading…" : error || emptyMessage}</p>
      {!loading && error && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}
