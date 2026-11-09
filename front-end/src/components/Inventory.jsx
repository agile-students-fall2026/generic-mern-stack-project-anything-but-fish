import { useEffect, useRef, useState } from "react";
import { useGameData } from "../hooks/useGameData";
import GamePopup from "./GamePopup";
import GameDataStatus from "./GameDataStatus";
import ItemIcon from "./ItemIcon";
import "./Inventory.css";

export default function Inventory() {
  const { data, loading, error, retry } = useGameData("inventory");
  const [selectedId, setSelectedId] = useState(null);
  const itemButtons = useRef(new Map());
  const detailHeading = useRef(null);
  const items = loading || error ? [] : data?.items ?? [];
  const capacity = loading || error ? 0 : data?.capacity ?? 0;
  const selectedItem = items.find((item) => item.id === selectedId);

  useEffect(() => {
    if (selectedItem) detailHeading.current?.focus({ preventScroll: true });
  }, [selectedItem]);

  function closeItem() {
    const button = itemButtons.current.get(selectedId);
    setSelectedId(null);
    button?.focus({ preventScroll: true });
  }

  return (
    <GamePopup title="Inventory" className="inventory-popup">
      <div className="inventory__workspace" aria-busy={loading}>
        <div className="inventory__scroll">
          {(loading || error || items.length === 0) && (
            <div className="inventory__status">
              <GameDataStatus loading={loading} error={error} onRetry={retry} emptyMessage="Your inventory is empty." />
            </div>
          )}
          {!loading && !error && (
            <ul className="inventory__grid" aria-label="Inventory slots">
              {Array.from({ length: capacity }, (_, index) => {
                const item = items[index];
                return (
                  <li className="inventory__slot" key={item?.id ?? `empty-${index}`}>
                    {item ? (
                      <button
                        ref={(node) => { if (node) itemButtons.current.set(item.id, node); else itemButtons.current.delete(item.id); }}
                        className="inventory__item"
                        type="button"
                        aria-label={`${item.name}, count ${item.count}`}
                        aria-pressed={selectedId === item.id}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <ItemIcon icon={item.icon} />
                        <span className="inventory__count" aria-hidden="true">{item.count}</span>
                      </button>
                    ) : <span className="inventory__empty-slot" aria-label={`Empty slot ${index + 1}`} />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selectedItem && (
          <section
            className="inventory__details"
            aria-labelledby="inventory-item-name"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                closeItem();
              }
            }}
          >
            <button className="inventory__details-close" type="button" aria-label="Close item details" onClick={closeItem}>×</button>
            <div className="inventory__details-top">
              <h2 id="inventory-item-name" ref={detailHeading} tabIndex={-1}>{selectedItem.name}</h2>
              <div className="inventory__item-summary">
                <dl>
                  <div><dt>Type</dt><dd>{selectedItem.type}</dd></div>
                  <div><dt>Count</dt><dd>{selectedItem.count}</dd></div>
                </dl>
                <ItemIcon icon={selectedItem.icon} />
              </div>
            </div>
            <p className="inventory__description">{selectedItem.description}</p>
          </section>
        )}
      </div>
    </GamePopup>
  );
}
