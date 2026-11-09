import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useGameData } from "../hooks/useGameData";
import { loadGame, saveGame } from "../lib/game-api";
import GamePopup from "./GamePopup";
import "./SaveLoad.css";

const savedTime = new Intl.DateTimeFormat(undefined, {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
});

export default function SaveLoad({ mode: initialMode = "load" }) {
  const navigate = useNavigate();
  const { page, chapterTitle } = useOutletContext();
  const { data, loading, error, retry } = useGameData("saves");
  const [mode, setMode] = useState(initialMode);
  const [updatedSlots, setUpdatedSlots] = useState(null);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [busySlot, setBusySlot] = useState(null);
  const [actionError, setActionError] = useState("");
  const [failedAction, setFailedAction] = useState(null);
  const [status, setStatus] = useState("");
  const request = useRef(null);
  const slots = updatedSlots ?? data?.slots ?? [];

  useEffect(() => () => {
    request.current?.abort();
    request.current = null;
  }, []);

  function changeMode(nextMode) {
    if (request.current) return;
    setMode(nextMode);
    setConfirmSlot(null);
    setActionError("");
    setFailedAction(null);
    setStatus("");
  }

  async function actOnSlot(slotId, action = mode) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10000);
    setBusySlot(slotId);
    setConfirmSlot(null);
    setActionError("");
    setFailedAction(null);
    setStatus("");

    try {
      if (action === "save") {
        const result = await saveGame(slotId, { chapterTitle, page: Number(page) }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setUpdatedSlots(result.slots);
        setStatus("Game saved.");
      } else {
        const result = await loadGame(slotId, { signal: controller.signal });
        if (controller.signal.aborted) return;
        navigate(`/game/${result.page}`, { replace: true });
      }
    } catch (failure) {
      if (request.current === controller && (!controller.signal.aborted || timedOut)) {
        setActionError(timedOut ? "This is taking too long. Please try again." : failure.message);
        setFailedAction({ slotId, action });
      }
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        request.current = null;
        setBusySlot(null);
      }
    }
  }

  function selectSlot(slot) {
    if (request.current) return;
    setStatus("");
    setActionError("");
    setFailedAction(null);
    if (mode === "save" && slot.save) setConfirmSlot(slot.id);
    else actOnSlot(slot.id);
  }

  return (
    <GamePopup
      title={mode === "save" ? "Save" : "Load"}
      className="save-load-popup"
      headerActions={
        <div className="save-load__modes" role="group" aria-label="Save or load game">
          {["save", "load"].map((option) => (
            <button
              key={option}
              type="button"
              className="save-load__mode"
              aria-pressed={mode === option}
              disabled={busySlot !== null}
              onClick={() => changeMode(option)}
            >
              {option === "save" ? "Save" : "Load"}
            </button>
          ))}
        </div>
      }
    >
      {loading && <p className="save-load__feedback" role="status">Loading save slots…</p>}
      {error && (
        <div className="save-load__feedback">
          <p role="alert">{error}</p>
          <button className="save-load__action" type="button" onClick={retry}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="save-load__slots" aria-busy={busySlot !== null}>
          {slots.length === 0 && <p className="save-load__feedback">No save slots available.</p>}
          {slots.map((slot, index) => {
            const number = String(index + 1).padStart(2, "0");
            const isBusy = busySlot === slot.id;
            return (
              <div className="save-load__slot-group" key={slot.id}>
                <button
                  className="save-load__slot"
                  type="button"
                  disabled={busySlot !== null || (mode === "load" && !slot.save)}
                  aria-label={`${mode === "save" ? "Save to" : "Load"} slot ${number}${slot.save ? `, ${slot.save.chapterTitle}, page ${slot.save.page}` : ", empty"}`}
                  onClick={() => selectSlot(slot)}
                >
                  <span className="save-load__slot-heading">
                    <span>No. {number}</span>
                    {slot.save && <span>Page {slot.save.page}</span>}
                  </span>
                  <span className="save-load__chapter">{slot.save?.chapterTitle || "Empty slot"}</span>
                  {slot.save ? (
                    <span className="save-load__saved-time">
                      <span>Saved Time</span>
                      <time dateTime={slot.save.savedAt}>{savedTime.format(new Date(slot.save.savedAt))}</time>
                    </span>
                  ) : (
                    <span className="save-load__empty">{mode === "save" ? "Save your current page here." : "No saved game yet."}</span>
                  )}
                  {isBusy && <span className="save-load__pending">{mode === "save" ? "Saving…" : "Loading…"}</span>}
                </button>
                {confirmSlot === slot.id && (
                  <div className="save-load__confirm">
                    <p>Replace the saved game in slot {number}?</p>
                    <div className="save-load__confirm-actions">
                      <button className="save-load__action" type="button" onClick={() => actOnSlot(slot.id, "save")}>Replace save</button>
                      <button className="save-load__action" type="button" onClick={() => setConfirmSlot(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {status && <p className="save-load__feedback" role="status">{status}</p>}
      {actionError && (
        <div className="save-load__feedback">
          <p role="alert">{actionError}</p>
          {failedAction && <button className="save-load__action" type="button" onClick={() => actOnSlot(failedAction.slotId, failedAction.action)}>Retry</button>}
        </div>
      )}
    </GamePopup>
  );
}
