import { useEffect, useRef, useState } from "react";
import GamePopup from "./GamePopup";
import GameDataStatus from "./GameDataStatus";
import { useGameData } from "../hooks/useGameData";
import { updateSettings } from "../lib/game-api";
import "./Settings.css";

const labels = {
  en: { title: "Settings", sound: "Sound effects", ambient: "Ambient sound", language: "Language", apply: "Apply settings", saving: "Applying…", saved: "Settings applied.", timeout: "This is taking too long. Please try again." },
  zh: { title: "设置", sound: "音效音量", ambient: "环境音音量", language: "语言", apply: "应用设置", saving: "正在应用…", saved: "设置已应用。", timeout: "请求超时，请重试。" },
};

export default function Settings() {
  const { data, loading, error, retry } = useGameData("settings");
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const request = useRef(null);
  const copy = labels[draft?.language || "en"];

  useEffect(() => { if (data) setDraft(data.settings); }, [data]);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);

  function change(field, value) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setSaved(false);
    setSaveError("");
  }

  async function apply(event) {
    event.preventDefault();
    if (!draft || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
    setBusy(true);
    setSaved(false);
    setSaveError("");
    try {
      const result = await updateSettings(draft, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setDraft(result.settings);
        setSaved(true);
      }
    } catch (failure) {
      if (request.current !== controller) return;
      if (timedOut) setSaveError(copy.timeout);
      else if (!controller.signal.aborted) setSaveError(failure.message);
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted || timedOut) setBusy(false);
      }
    }
  }

  return (
    <GamePopup title={copy.title} className="settings-popup">
      {loading || error || !draft ? <GameDataStatus loading={loading} error={error} onRetry={retry} /> : (
        <form className="settings-form" onSubmit={apply}>
          <fieldset disabled={busy}>
            <div className="settings-form__control">
              <label htmlFor="sound-volume">{copy.sound}<output htmlFor="sound-volume">{draft.soundVolume}%</output></label>
              <input id="sound-volume" type="range" min="0" max="100" step="1" value={draft.soundVolume} onChange={(event) => change("soundVolume", Number(event.target.value))} style={{ "--range-fill": `${draft.soundVolume}%` }} />
            </div>
            <div className="settings-form__control">
              <label htmlFor="ambient-volume">{copy.ambient}<output htmlFor="ambient-volume">{draft.ambientVolume}%</output></label>
              <input id="ambient-volume" type="range" min="0" max="100" step="1" value={draft.ambientVolume} onChange={(event) => change("ambientVolume", Number(event.target.value))} style={{ "--range-fill": `${draft.ambientVolume}%` }} />
            </div>
            <div className="settings-form__control settings-form__language">
              <label htmlFor="game-language">{copy.language}</label>
              <select id="game-language" value={draft.language} onChange={(event) => change("language", event.target.value)}>
                <option value="en">English</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <button className="settings-form__apply" type="submit">{busy ? copy.saving : copy.apply}</button>
          </fieldset>
          {saved && <p className="settings-form__feedback" role="status">{copy.saved}</p>}
          {saveError && <p className="settings-form__feedback settings-form__feedback--error" role="alert">{saveError}</p>}
        </form>
      )}
    </GamePopup>
  );
}
