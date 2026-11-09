import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import "./GamePopup.css";

export default function GamePopup({ title, className = "", headerActions, children }) {
  const { closeModal } = useOutletContext();
  const dialog = useRef(null);
  const closeButton = useRef(null);

  useEffect(() => {
    const node = dialog.current;
    const previousFocus = document.activeElement;
    node.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      node.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  function dismissBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) closeModal();
  }

  return (
    <dialog
      ref={dialog}
      className={`game-popup ${className}`}
      aria-labelledby="game-popup-title"
      onCancel={(event) => { event.preventDefault(); closeModal(); }}
      onClick={dismissBackdrop}
    >
      <header className="game-popup__header">
        <h1 id="game-popup-title">{title}</h1>
        {headerActions}
        <button ref={closeButton} className="game-popup__close" type="button" onClick={closeModal} aria-label={`Close ${title}`}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div className="game-popup__body">{children}</div>
    </dialog>
  );
}
